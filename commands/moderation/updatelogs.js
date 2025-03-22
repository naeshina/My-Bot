const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('updatelogs')
    .setDescription('Update changelogs')
    .addStringOption(option =>
      option.setName('version')
        .setDescription(`Versi saat ini (${JSON.parse(fs.readFileSync('./database/data/changelogs.json')).version})`)
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('changes')
        .setDescription('Perubahan yang ingin ditambahkan (pisahkan dengan koma)')
        .setRequired(false)
    )
    .addStringOption(option =>
      option.setName('fixes')
        .setDescription('Perbaikan yang ingin ditambahkan (pisahkan dengan koma)')
        .setRequired(false)
    ),

  async execute(interaction) {
    const version = interaction.options.getString('version');
    const changes = interaction.options.getString('changes')?.split(',') || [];
    const fixes = interaction.options.getString('fixes')?.split(',') || [];

    

    try {
      const changelogsFile = './database/data/changelogs.json';   
      const data = await fs.promises.readFile(changelogsFile, 'utf8');
      const changelogs = JSON.parse(data);    

      changelogs.version = version;
      changelogs.changes = []
      changelogs.fixes = []
      changelogs.changes.push(...changes.map(change => change.trim()));
      changelogs.fixes.push(...fixes.map(fix => fix.trim()));

      await fs.promises.writeFile(changelogsFile, JSON.stringify(changelogs, null, 2));

      interaction.reply(`Changelogs telah diupdate! Versi: ${version}`);
    } catch (error) {
      console.error(error);
      interaction.reply('Gagal mengupdate changelogs!');
    }
  }
}