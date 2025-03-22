const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("panelucp")
    .setDescription("Displays the UCP panel for Player"),
  async execute(interaction, client, db) {
    if (!interaction.member.roles.cache.has(db.config.roles.admin)) {
      return interaction.reply({
        content: "❌ Anda tidak memiliki izin!",
        ephemeral: true,
      });
    }
    const embed = new EmbedBuilder()
      .setTitle("🎮 User Control Panel (GPRP)")
      .setDescription(
        "Selamat datang di User Control Panel (UCP) GarudaPride Roleplay" +
          "Panel ini dirancang untuk membantu Anda mengelola akun dan karakter dengan mudah.\n\n" +
          "Gunakan tombol di bawah untuk mengakses fitur yang tersedia."
      )
      .setColor("#0D6EFD")
      .addFields(
        {
          name: "Available Features",
          value:
            "**Change Password** - Mengganti password akun UCP.\n" +
            "**Reverif** - Verifikasi ulang akun UCP.",
          inline: false,
        },
        {
          name: "Penting",
          value:
            "🔒 **Jaga kerahasiaan informasi akun Anda.**\n" +
            "📌 Jika ada masalah, hubungi admin server.",
          inline: false,
        }
      )
      .setImage(db.config.banner)
      .setFooter({ text: db.config.footer, iconURL: db.config.logo})
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("change_password")
        .setLabel("📝 Reset Password!")
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId("reverify")
        .setLabel("📄 Reverif!")
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId("resend-code")
        .setLabel("🔐 Resend Code")
        .setStyle(ButtonStyle.Success)
    );
    
    try {
      await interaction.reply({ embeds: [embed], components: [row] });
    } catch (e) {
      console.log(e)
    }
  },
};
