import { REST, Routes, SlashCommandBuilder } from "discord.js";
import "dotenv/config";

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

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

(async () => {
  try {
    console.log("📡 Регистрирую команды...");
    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands }
    );
    console.log("✅ Команды зарегистрированы!");
  } catch (error) {
    console.error("❌ Ошибка регистрации команд:", error);
  }
})();
