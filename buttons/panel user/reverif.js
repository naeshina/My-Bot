const { pool } = require("../../functions/database");

module.exports = {
  customId: "reverify",
  async execute(interaction, client, db) {
    const discordId = interaction.user.id;

    try {
      const [result] = await pool.execute(
        "SELECT * FROM playerucp WHERE discordid = ?",
        [discordId]
      );

      if (result.length === 0) {
        return interaction.reply({
          content:
            "❌ Akun Discord ini tidak terdaftar di server. Silakan register terlebih dahulu.",
          ephemeral: true,
        });
      }

      const roleCitizen = interaction.guild.roles.cache.get(
        db.config.roles.citizen
      );
      const member = interaction.guild.members.cache.get(discordId);

      if (!roleCitizen) {
        return interaction.reply({
          content:
            "⚠️ Role 'Warga' tidak ditemukan. Hubungi admin untuk bantuan.",
          ephemeral: true,
        });
      }

      if (member.roles.cache.has(roleCitizen.id)) {
        return interaction.reply({
          content: "Anda sudah memiliki citizen role.",
          ephemeral: true,
        });
      }

      await member.roles.add(roleCitizen);

      return interaction.reply({
        content: "✅ Role Warga berhasil ditambahkan ke akun Anda!",
        ephemeral: true,
      });
    } catch (error) {
      console.error(error);
      return interaction.reply({
        content: "❌ Terjadi kesalahan saat memverifikasi ulang akun Anda.",
        ephemeral: true,
      });
    }
  },
};
