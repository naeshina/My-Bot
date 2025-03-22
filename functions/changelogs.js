const fs = require('fs');
const db = require('../database/index.js')
const { EmbedBuilder } = require('discord.js');

class Changelogs {
  constructor(client, channelId, changelogsFile) {
    this.client = client;
    this.channelId = channelId;
    this.changelogsFile = changelogsFile;
    this.currentVersion = null;

    fs.watch(this.changelogsFile, (eventType, filename) => {
      if (eventType === 'change') {
        this.loadChangelogs();
      }
    });
  }

  loadChangelogs() {
    fs.readFile(this.changelogsFile.toString(), 'utf8', (err, data) => {
      if (err) {
        console.error(err);
        return;
      }
      const changelogs = JSON.parse(data);
      const newVersion = changelogs.version;
      if (newVersion !== this.currentVersion) {
        this.currentVersion = newVersion;
        this.sendChangelogs(changelogs);
      }
    });
  }
  
  sendChangelogs(changelogs) {
    const channel = this.client.channels.cache.get(this.channelId);
    if (!channel) {
      console.error('Channel tidak ditemukan!');
      return;
    }
    let atxt = `__**Changes**__\n`
    atxt += `${changelogs.changes.map(change => `‣ ${change}`).join('\n')}`
    atxt += '\n'
    atxt += `__**Fixed & Improvement**__\n`
    atxt += `${changelogs.fixes.map(fix => `‣ ${fix}`).join('\n')}`
    atxt += '\n\n'
    atxt += `__**Update on ${new Date().toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}**__`
    
    const embed = new EmbedBuilder()
      .setTitle(`Changelogs v${changelogs.version}`)
      .setDescription(atxt)

      .setColor("#0D6EFD")
      .setFooter({ text: db.config.footer, iconUrl: db.config.logo })
      .setTimestamp() 
        
    try {
      channel.send({ embeds: [embed] });
    } catch (err) {
      console.error(err)
    }
  }
}

module.exports = Changelogs;