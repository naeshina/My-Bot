const { EmbedBuilder, AttachmentBuilder } = require("discord.js");
const { pool } = require("../functions/database");
const db = require('../database/index.js')
const selectDeleteCharacter = require("../dropdown/selectDeleteCharacter");

module.exports = {
  name: "interactionCreate",
  async execute(interaction, client) {
    if (interaction.isCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) {
        console.error(
          `No handler found for command: ${interaction.commandName}`
        );
        return;
      }
      try {
        await command.execute(interaction, client, db);
      } catch (error) {
        console.error(error);
        await interaction.reply({
          content: "There was an error executing this command!",
          ephemeral: true,
        });
      }
    } else if (interaction.isButton()) {
      const handler =
        client.buttons.get(interaction.customId) ||
        Array.from(client.buttons.values()).find(
          (h) =>
            h.customId instanceof RegExp &&
            h.customId.test(interaction.customId)
        );

      if (!handler) {
        console.error(
          `No handler found for button with customId: ${interaction.customId}`
        );
        return;
      }

      try {
        await handler.execute(interaction, client, db);
      } catch (error) {
        console.error(`Error executing button handler: ${error}`);
        await interaction.reply({
          content: "❌ Terjadi kesalahan saat memproses tombol!",
          ephemeral: true,
        });
      }
    } else if (interaction.isModalSubmit()) {
      const handler =
        client.modals.get(interaction.customId) ||
        [...client.modals.values()].find(
          (h) =>
            h.customId instanceof RegExp &&
            h.customId.test(interaction.customId)
        );

      if (!handler) {
        console.error(
          `No handler found for modal with customId: ${interaction.customId}`
        );
        return;
      }

      try {
        await handler.execute(interaction, client, db);
      } catch (error) {
        console.error(`Error executing modal handler: ${error}`);
        await interaction.reply({
          content: "❌ Terjadi kesalahan saat memproses modal!",
          ephemeral: true,
        });
      }
    } else if (interaction.isSelectMenu()) {
      if (interaction.customId === "select_delete_character") {
        await selectDeleteCharacter.execute(interaction);
      }
    }
  },
};
