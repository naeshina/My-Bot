const {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
} = require("discord.js");
const { pool } = require("../../functions/database");

module.exports = {
  customId: "change_password",
  async execute(interaction) {
    const discordId = interaction.user.id;

    const [userRows] = await pool.query(
      "SELECT * FROM playerucp WHERE DiscordID = ?",
      [discordId]
    );
    if (userRows.length === 0) {
      return interaction.reply({
        content:
          "❌ Anda belum terdaftar di sistem UCP. Silakan daftar terlebih dahulu.",
        ephemeral: true,
      });
    }
    
    await pool.query("UPDATE playerucp SET password = '' WHERE DiscordID = ?", [
      discordId,
    ]);

    await interaction.reply({
      content: "✅ Kata sandi Anda berhasil direset, Silahkan Login Server untuk mengganti Password Baru!.\n\nUntuk kode verifikasi silahkan Resend di <#1333657244964749393>",
      ephemeral: true,
    });
  },
};
