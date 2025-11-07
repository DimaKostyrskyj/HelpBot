import { Client, GatewayIntentBits, EmbedBuilder, REST, Routes, SlashCommandBuilder } from "discord.js";
import "dotenv/config";

let lastMessageId = null; // <== Хранит последнее сообщение бота

const commands = [
  // /update
  new SlashCommandBuilder()
    .setName("update")
    .setDescription("Отправить обновление в специальный канал")
    .addStringOption(option =>
      option
        .setName("text")
        .setDescription("Текст обновления")
        .setRequired(true)
    ),

  // /update-edit
  new SlashCommandBuilder()
    .setName("update-edit")
    .setDescription("Изменить последнее сообщение бота")
    .addStringOption(option =>
      option
        .setName("newtext")
        .setDescription("Новый текст обновления")
        .setRequired(true)
    ),

  // /update-delete
  new SlashCommandBuilder()
    .setName("update-delete")
    .setDescription("Удалить последнее сообщение бота")
].map(cmd => cmd.toJSON());

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

// Функция регистрации команд
async function startBot() {
  // Проверка наличия необходимых переменных окружения
  if (!process.env.TOKEN) {
    console.error("❌ Токен бота не найден в .env файле");
    process.exit(1);
  }
  
  if (!process.env.CLIENT_ID) {
    console.error("❌ CLIENT_ID не найден в .env файле");
    process.exit(1);
  }
  
  if (!process.env.CHANNEL_ID) {
    console.error("❌ CHANNEL_ID не найден в .env файле");
    process.exit(1);
  }

  console.log("🔑 Проверка переменных окружения...");
  console.log("TOKEN:", process.env.TOKEN ? "✅ Установлен" : "❌ Отсутствует");
  console.log("CLIENT_ID:", process.env.CLIENT_ID ? "✅ Установлен" : "❌ Отсутствует");
  console.log("CHANNEL_ID:", process.env.CHANNEL_ID ? "✅ Установлен" : "❌ Отсутствует");

  try {
    await registerCommands();
    console.log("🤖 Запускаю бота...");
    await client.login(process.env.TOKEN);
  } catch (error) {
    console.error("❌ Критическая ошибка при запуске:", error.message);
    process.exit(1);
  }
}

client.once("ready", () => {
  console.log(`✅ Бот запущен как ${client.user.tag}`);
});

client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const channel = client.channels.cache.get(process.env.CHANNEL_ID);
  if (!channel) return interaction.reply({ content: "❌ Канал не найден.", ephemeral: true });

  // /update — отправка embed
  if (interaction.commandName === "update") {
    const text = interaction.options.getString("text");

    const embed = new EmbedBuilder()
      .setTitle("📌 Обновление на сервере")
      .setDescription(text)
      .setColor("#5865F2")
      .setTimestamp();

    const sentMessage = await channel.send({ embeds: [embed] });
    lastMessageId = sentMessage.id;

    return interaction.reply({ content: "✅ Обновление отправлено!", ephemeral: true });
  }

  // /update-edit — изменить embed
  if (interaction.commandName === "update-edit") {
    if (!lastMessageId)
      return interaction.reply({ content: "❌ Нет сообщения для изменения.", ephemeral: true });

    const newText = interaction.options.getString("newtext");
    const lastMessage = await channel.messages.fetch(lastMessageId);

    const updatedEmbed = new EmbedBuilder()
      .setTitle("✏️ Обновление изменено")
      .setDescription(newText)
      .setColor("#ffaa00")
      .setTimestamp();

    await lastMessage.edit({ embeds: [updatedEmbed] });

    return interaction.reply({ content: "✏️ Сообщение изменено!", ephemeral: true });
  }

  // /update-delete — удалить сообщение
  if (interaction.commandName === "update-delete") {
    if (!lastMessageId)
      return interaction.reply({ content: "❌ Нет сообщения для удаления.", ephemeral: true });

    const lastMessage = await channel.messages.fetch(lastMessageId);
    await lastMessage.delete();

    lastMessageId = null;

    return interaction.reply({ content: "🗑️ Сообщение удалено!", ephemeral: true });
  }
});

// Запуск бота и регистрация команд
async function startBot() {
  await registerCommands();
  await client.login(process.env.TOKEN);
}

startBot();