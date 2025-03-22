const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('a')
    .setDescription('Send Announcemet')
    .addStringOption(option => 
      option.setName('message')
        .setDescription('What do you want to announce?')
        .setRequired(true)
    ),
  async execute(interaction, client, db) {
    if (!interaction.member.roles.cache.has(db.config.roles.admin)) {
      return interaction.reply({
        content: "❌ Anda tidak memiliki izin!",
        ephemeral: true,
      });
    }
    
    async function sendAnnouncement (message) {
      const ch = client.channels.cache.get(db.channel.announcement)
      if(!ch) return console.log('Channel not found')
      const embed = new EmbedBuilder()
        .setTitle('📢 Announcement')
        .setDescription(message)
        .setColor("#0D6EFD")
        .setFooter({ text: db.config.footer, iconURL: db.config.logo})
        .setTimestamp(); 
        
      try {
        await ch.send({ embeds: [embed] })
      } catch (e) {
        console.log(e)
      }
    }
    if(interaction.isChatInputCommand()) {
      try {
        const mess = interaction.options.getString('message')
        console.log(mess)
        await sendAnnouncement(mess)
        await interaction.reply({
          content: 'Announcement sent successfully',
          ephemeral: true
        })
      }  catch (err) {
        console.log(err)
      }
    }
  }
}