const {
  ModalBuilder,
  TextInputBuilder,
  ActionRowBuilder,
  TextInputStyle,
} = require("discord.js");
const db = require("../../database/index.js");

module.exports = {
  customId: "infoCharacter",
  async execute(interaction) {
    if (!interaction.member.roles.cache.has(db.config.roles.admin)) {
      return interaction.reply({
        content: "❌ Anda tidak memiliki izin!",
        ephemeral: true,
      });
    }
    const modal = new ModalBuilder()
      .setCustomId("characterInfoModal")
      .setTitle("Info Karakter");

    const characterNameInput = new TextInputBuilder()
      .setCustomId("characterName")
      .setLabel("Masukkan nama karakter")
      .setStyle(TextInputStyle.Short)
      .setPlaceholder("Contoh: John_Doe")
      .setRequired(true);

    const row = new ActionRowBuilder().addComponents(characterNameInput);
    modal.addComponents(row);

    await interaction.showModal(modal);
  },
};
