const { EmbedBuilder } = require("discord.js");
const sampQuery = require("samp-query");
const db = require('../database/index.js')

const CHANNEL_ID = db.channel.ipchannel;
const SERVER_IP = db.config.server.serverIP;
const SERVER_PORT = db.config.server.serverPort;

let embedMessage = null;
let lastServerData = null;

async function checkServerStatus() {
  return new Promise((resolve) => {
    const options = {
      host: SERVER_IP,
      port: SERVER_PORT,
      timeout: 1000,
    };

    sampQuery(options, (error, response) => {
      if (error) {
        resolve({
          status: "🔴 OFFLINE",
          players: "N/A",
          maxPlayers: "N/A",
          gamemode: "N/A",
        });
      } else if (response.passworded) {
        resolve({
          status: "🟡 MAINTENANCE",
          players: "N/A",
          maxPlayers: "N/A",
          gamemode: "N/A",
        });
      } else {
        resolve({
          status: "🟢 ONLINE",
          players: `${response.online}/${response.maxplayers}`,
          maxPlayers: response.maxplayers,
          language: response.rules.language || "Unknown",
          gamemode: response.gamemode || "Unknown",
        });
      }
    });
  });
}

async function updateEmbed(client) {
  try {
    const serverData = await checkServerStatus();

    if (JSON.stringify(serverData) === JSON.stringify(lastServerData)) {
      return;
    }

    lastServerData = serverData;

    const embed = new EmbedBuilder()
      .setColor(
        serverData.status === "🟢 ONLINE"
          ? 0x00ff00
          : serverData.status === "🟡 MAINTENANCE"
          ? 0xffff00
          : 0xff0000
      )
      .setTitle("GarudaPride Roleplay")
      .setURL(db.config.linkDiscord)
      .addFields(
        {
          name: "__Server Status__",
          value: `\`\`\`${serverData.status}\`\`\``,
          inline: true,
        },
        {
          name: "__Players Online__",
          value: `\`\`\`${serverData.players}\`\`\``,
          inline: true,
        },
       // { name: "\u200B", value: "\u200B", inline: true },
        {
          name: "__Server IP__",
          value: `\`\`\`${SERVER_IP}\`\`\``,
          inline: false,
        },
        {
          name: "__Server PORT__",
          value: `\`\`\`${SERVER_PORT}\`\`\``,
          inline: false, 
        },
        {
          name: "__Gamemode__",
          value: `\`\`\`${serverData.gamemode}\`\`\``,
          inline: true,
        }
      )
      .setThumbnail(
        `${db.config.logo}`
      )
      .setImage(
        db.config.banner
      )
      .setFooter({
        text: db.config.footer,
        iconURL:
          db.config.logo,
      })
      .setTimestamp();

    const channel = await client.channels.fetch(CHANNEL_ID);

    if (!embedMessage) {
      const messages = await channel.messages.fetch({ limit: 20 });
      embedMessage = messages.find(
        (msg) => msg.author.id === client.user.id && msg.embeds.length > 0
      );
    }

    if (!embedMessage) {
      embedMessage = await channel.send({ embeds: [embed] });
    } else {
      await embedMessage.edit({ embeds: [embed] });
    }

    // Hapus pesan lain dari bot
    const messages = await channel.messages.fetch({ limit: 20 });
    const otherMessages = messages.filter((msg) => msg.id !== embedMessage.id);
    otherMessages.forEach(async (msg) => {
      if (msg.author.id === client.user.id) {
        await msg.delete();
      }
    });
  } catch (error) {
    console.error("Error updating embed:", error);
  }
}

function startAutoUpdate(client) {
  setInterval(() => {
    updateEmbed(client);
  }, 5000); // Interval 5 detik
}

module.exports = { updateEmbed, startAutoUpdate };
