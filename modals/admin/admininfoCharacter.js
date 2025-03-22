const { EmbedBuilder } = require("discord.js");
const { pool } = require("../../functions/database");
const db = require("../../database/index.js");

module.exports = {
  customId: "characterInfoModal",
  async execute(interaction) {
    if (!interaction.member.roles.cache.has(db.config.roles.admin)) {
      return interaction.reply({
        content: "❌ Anda tidak memiliki izin!",
        ephemeral: true,
      });
    }
    const characterName = interaction.fields.getTextInputValue("characterName");

    try {
      const [characterData] = await pool.execute(
        "SELECT * FROM players WHERE username = ?",
        [characterName]
      );

      if (characterData.length === 0) {
        return interaction.reply({
          content: "Karakter tidak ditemukan.",
          ephemeral: true,
        });
      }

      const char = characterData[0];

      const characterNameDisplay = char.username || "Nama tidak tersedia";

      const vipLevels = ["Not VIP", "Bronze", "Silver", "Gold"];
      const vipStatus = vipLevels[char.vip] || "Not VIP";

      const jobNames = {
        1: "Sopir Bus",
        2: "Petani",
        3: "Penjahit",
        4: "Penambang",
        5: "Tukang Kayu",
        6: "Tukang Ayam",
        7: "Mechanic",
        8: "Supir Taxi",
        9: "Truk Cargo",
      };
      const jobTitle = jobNames[char.job] || "Pekerjaan Tidak Diketahui";

      const characterInfoEmbed = new EmbedBuilder()
        .setTitle(`📋 ${characterNameDisplay}`)
        .setColor("#0D6EFD")
        .setDescription(
          `
    **Level**: ${char.level}
    **Jenis Kelamin**: ${char.gender === 1 ? "Laki-laki" : "Perempuan"}  
    **Tanggal Lahir**: ${char.age} 
    **Status Admin**: ${char.admin === 0 ? "Tidak Admin" : "Administrator"}  
    **Tanggal Registrasi**: ${new Date(char.reg_date).toLocaleDateString()}  
    **Terakhir Login**: ${new Date(char.last_login).toLocaleString()}  
    **Saldo**: $${char.money.toLocaleString()}  
    **Bank**: $${char.bmoney.toLocaleString()}   
    **VIP**: ${vipStatus}  
    **VIP Expiry**: ${
      char.VIPTime === 0
        ? "Not VIP"
        : new Date(char.vip_time).toLocaleDateString()
    }  
    **Lapar**: ${char.hunger}%  
    **Haus**: ${char.energy}%  
    **Stress**: ${char.stress}%  
    **Pekerjaan**: ${jobTitle}
  `
        )
        .setFooter({ text: "Informasi Karakter" })
        .setTimestamp();

      const skinImageUrl = `https://assets.open.mp/assets/images/skins/${char.skin}.png`;

      characterInfoEmbed.setThumbnail(skinImageUrl);

      await interaction.reply({
        embeds: [characterInfoEmbed],
        ephemeral: true,
      });
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: "Terjadi kesalahan saat mengambil informasi karakter.",
        ephemeral: true,
      });
    }
  },
};
