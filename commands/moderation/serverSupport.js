const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("support")
    .setDescription("Displays the support panel for players"),
  async execute(interaction, client, db) {
    if (!interaction.member.roles.cache.has(db.config.roles.admin)) {
      return interaction.reply({
        content: "❌ Anda tidak memiliki izin!",
        ephemeral: true,
      });
    }
    const embed = new EmbedBuilder()
      .setTitle("GarudaPride Roleplay")
      .setDescription(
        "**InGame Supports**\n" +
          "Harap Gunakan Official Ticket Tool ini dengan sebaik baiknya."
      )
      .setColor("#0D6EFD")
      .addFields({
        name: "Available Features",
        value:
          "**Bug Report Note:**\n[-] Staff tidak menerima Report Bug Client Side.\n [-] Hanya merespons Bug Server Script Side\n[-] Jika menyalah gunakan tiket, anda akan Terkena Sanksi\n\n" +
          "**Ucp Delete Note:**\n[-] Harap Konfirmasikan kembali bahwa ketika ucp sudah di delete, tidak dapat di Recover kembali.\n\n" +
          "**Character Delete Note:**\n[-] Harap Konfirmasikan kembali bahwa ketika Character sudah di delete, tidak dapat di Recover kembali.\n\n" +
          "**Character Story Note**\n[-] Buat Character story character anda dengan benar\n[-]Masukkan nama character yang akan didaftarkan character story.",
        inline: false,
      })

      .setFooter({
        text: db.config.footer,
        iconURL: db.config.logo,
      })
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("reportBug")
        .setLabel("🔨 Report Bugs!")
        .setStyle(ButtonStyle.Danger),
      new ButtonBuilder()
        .setCustomId("CharacterDetele")
        .setLabel("🗑 Character Delete!")
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId("character_story")
        .setLabel("📖 Character Story")
        .setStyle(ButtonStyle.Primary)
    );

    await interaction.reply({ embeds: [embed], components: [row] });
  },
};
