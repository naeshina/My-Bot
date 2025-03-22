const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("myid")
    .setDescription(
      "Menampilkan Informasi User."
    ),
  async execute(interaction, client, db) {
    
    const embed = new EmbedBuilder()
      .setTitle("Discord User Information")
      .setDescription('Berikut adalah Informasi akun anda')
      .setFooter({ text: db.config.footer, iconURL: db.config.logo})
      .setImage(db.config.banner)
      .setColor("#0D6EFD")
      .addFields(
        {
          name: `USERNAME`,
          value:  `\`\`\`${interaction.user.tag}\`\`\``,
          inline: true
        },
        {
          name: `DISCORD ID`,
          value:  `\`\`\`${interaction.user.id}\`\`\``,
          inline: true
        },
      )
    await interaction.reply({ embeds: [embed] })
  }
}

