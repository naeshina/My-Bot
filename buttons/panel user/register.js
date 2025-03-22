const {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
} = require("discord.js");

module.exports = {
  customId: "register",
  async execute(interaction) {
    const modal = new ModalBuilder()
      .setCustomId("register_modal")
      .setTitle("Register UCP");

    const ucpNameInput = new TextInputBuilder()
      .setCustomId("ucp_name")
      .setLabel("Masukkan nama UCP Anda:")
      .setPlaceholder("Example (Naeshina22)")
      .setStyle(TextInputStyle.Short)
      .setRequired(true)
      .setMaxLength(10);
    const WhatsAppNumberInput = new TextInputBuilder()
      .setCustomId("WhatsApp_Number")
      .setLabel("Masukan Nomor WhatsApp Anda:")
      .setPlaceholder("Example (628123456)")
      .setStyle(TextInputStyle.Short)
      .setRequired(true)
      .setMaxLength(15); 

    const actionRow1 = new ActionRowBuilder().addComponents(ucpNameInput);
    const actionRow2 = new ActionRowBuilder().addComponents(WhatsAppNumberInput)
    
    modal.addComponents(actionRow1, actionRow2);

    await interaction.showModal(modal);
  },
};
