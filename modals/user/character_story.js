const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const { pool } = require("../../functions/database");
const { validateICOwner } = require("../../functions/validate_ic_owner");
const { writeFileSync, readFileSync } = require("fs");
const db = require("../../database/index.js");

module.exports = {
  customId: "character_story",
  async execute(interaction) {
    const characterName = interaction.fields.getTextInputValue("ic_name");
    const story = interaction.fields.getTextInputValue("cs_content");
    const discordId = interaction.user.id;
    const isValid = await validateICOwner(discordId, characterName);
    
    if (!isValid) {
      console.error(
        `Validation failed for Discord ID: ${discordId}, Character Name: ${characterName}`
      );
      return interaction.reply({
        content: "❌ Nama karakter bukan milik Anda!",
        ephemeral: true,
      });
    }
    try {
      const query = `SELECT characterstory FROM players WHERE username = ?`;
      const [results] = await pool.query(query, [characterName]);

      console.log("Query Results:", results); // Debugging log
      if (results.length > 0 && Number(results[0].characterstory) === 1) {
        console.log(`Character ${characterName} already has a story.`);
        return interaction.reply({
          content: `❌ Karakter **${characterName}** sudah memiliki character story!`,
          ephemeral: true,
        });
      }
    } catch (error) {
      console.error("Database query error:", error);
      return interaction.reply({
        content: "❌ Terjadi kesalahan saat memeriksa character story!",
        ephemeral: true,
      });
    }
    
    const dataPath = "./database/data/pending_requests.json";
    let data;
    try {
      data = JSON.parse(
        readFileSync(dataPath, "utf8") || '{"pendingRequests": []}'
      );

      const isPending = data.pendingRequests.some(
        (req) => req.characterName === characterName && req.status === "pending"
      );

      if (isPending) {
        console.log(`Character ${characterName} is already pending.`);
        return interaction.reply({
          content: `❌ Karakter **${characterName}** sedang dalam proses pengecekan oleh admin!`,
          ephemeral: true,
        });
      }
    } catch (error) {
      console.error("Error reading JSON file:", error);
      data = { pendingRequests: [] };
    }

    data.pendingRequests.push({
      characterName,
      story,
      discordId,
      timestamp: new Date().toISOString(),
      status: "pending",
    });

    try {
      writeFileSync(dataPath, JSON.stringify(data, null, 2));
      console.log("Data successfully saved to JSON!");
    } catch (error) {
      console.error("Error writing to JSON file:", error);
      return interaction.reply({
        content: "❌ Gagal menyimpan data ke sistem!",
        ephemeral: true,
      });
    }
    
    const channelName = `cs-${characterName.replace(/\s+/g, "-").toLowerCase()}`;
    const channel = await interaction.guild.channels.create({
      name: channelName,
      type: 0,
      parent: db.channel.category.characterstory,
      permissionOverwrites: [
        {
          id: interaction.guild.roles.everyone.id,
          deny: ["ViewChannel"],
        },
        {
          id: discordId,
          allow: ["ViewChannel", "SendMessages", "ReadMessageHistory"],
        },
      ],
    });

    const embed = new EmbedBuilder()
      .setColor("#4A90E2")
      .setTitle("New Character Story Registration")
      .setDescription(
        `Pendaftaran baru untuk **${characterName}** telah diajukan.\n\n` +
          `**Story**:\n${story}`
      )
      .addFields(
        { name: "Nama IC", value: characterName, inline: true },
        { name: "Diajukan Oleh", value: `<@${discordId}>`, inline: true }
      )
      .setTimestamp()
      .setFooter({
        text: `Diajukan oleh ${interaction.user.tag}`,
        iconURL: interaction.user.displayAvatarURL(),
      });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`accept_cs_${characterName}`)
        .setLabel("Terima")
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId(`reject_cs_${characterName}`)
        .setLabel("Tolak")
        .setStyle(ButtonStyle.Danger)
    );
    
    const del = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("deleteTicketCs")
        .setLabel("Close Ticket")
        .setStyle(ButtonStyle.Danger)
    )

    await channel.send({
      content: `Character Story Request by <@${discordId}>`,
      embeds: [embed],
      components: [row],
    });
    await channel.send({
      components: [del]
    })
    
    interaction.reply({
      content: `✅ Character Story Request ticket created successfully: <#${channel.id}>`,
      ephemeral: true,
    });
  }
}

/*module.exports = {
  customId: "character_story",
  async execute(interaction) {
    const characterName = interaction.fields.getTextInputValue("ic_name");
    const story = interaction.fields.getTextInputValue("cs_content");
    const discordId = interaction.user.id;

    console.log("Received Inputs:");
    console.log("Discord ID:", discordId);
    console.log("Character Name:", characterName);

    const isValid = await validateICOwner(discordId, characterName);
    if (!isValid) {
      console.error(
        `Validation failed for Discord ID: ${discordId}, Character Name: ${characterName}`
      );
      return interaction.reply({
        content: "❌ Nama karakter bukan milik Anda!",
        ephemeral: true,
      });
    }

    console.log("Validation succeeded!");

    try {
      const query = `SELECT characterstory FROM players WHERE username = ?`;
      const [results] = await pool.query(query, [characterName]);

      console.log("Query Results:", results); // Debugging log
      if (results.length > 0 && Number(results[0].characterstory) === 1) {
        console.log(`Character ${characterName} already has a story.`);
        return interaction.reply({
          content: `❌ Karakter **${characterName}** sudah memiliki character story!`,
          ephemeral: true,
        });
      }
    } catch (error) {
      console.error("Database query error:", error);
      return interaction.reply({
        content: "❌ Terjadi kesalahan saat memeriksa character story!",
        ephemeral: true,
      });
    }

    const dataPath = "./database/data/pending_requests.json";
    let data;
    try {
      data = JSON.parse(
        readFileSync(dataPath, "utf8") || '{"pendingRequests": []}'
      );

      const isPending = data.pendingRequests.some(
        (req) => req.characterName === characterName && req.status === "pending"
      );

      if (isPending) {
        console.log(`Character ${characterName} is already pending.`);
        return interaction.reply({
          content: `❌ Karakter **${characterName}** sedang dalam proses pengecekan oleh admin!`,
          ephemeral: true,
        });
      }
    } catch (error) {
      console.error("Error reading JSON file:", error);
      data = { pendingRequests: [] };
    }

    data.pendingRequests.push({
      characterName,
      story,
      discordId,
      timestamp: new Date().toISOString(),
      status: "pending",
    });

    try {
      writeFileSync(dataPath, JSON.stringify(data, null, 2));
      console.log("Data successfully saved to JSON!");
    } catch (error) {
      console.error("Error writing to JSON file:", error);
      return interaction.reply({
        content: "❌ Gagal menyimpan data ke sistem!",
        ephemeral: true,
      });
    }

    const embed = new EmbedBuilder()
      .setColor("#4A90E2")
      .setTitle("New Character Story Registration")
      .setDescription(
        `Pendaftaran baru untuk **${characterName}** telah diajukan.\n\n` +
          `**Story**:\n${story}`
      )
      .addFields(
        { name: "Nama IC", value: characterName, inline: true },
        { name: "Diajukan Oleh", value: `<@${discordId}>`, inline: true }
      )
      .setTimestamp()
      .setFooter({
        text: `Diajukan oleh ${interaction.user.tag}`,
        iconURL: interaction.user.displayAvatarURL(),
      });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`accept_cs_${characterName}`)
        .setLabel("Terima")
        .setStyle(ButtonStyle.Success)
        .setEmoji("✅"),
      new ButtonBuilder()
        .setCustomId(`reject_cs_${characterName}`)
        .setLabel("Tolak")
        .setStyle(ButtonStyle.Danger)
        .setEmoji("❎")
    );

    const adminChannel = interaction.client.channels.cache.get(
      db.channel.adminLogsCS
    );
    if (!adminChannel) {
      console.error("Admin Logs Channel not found!");
      return interaction.reply({
        content: "❌ Channel admin logs tidak ditemukan!",
        ephemeral: true,
      });
    }

    await adminChannel.send({ embeds: [embed], components: [row] });

    return interaction.reply({
      content:
        "✅ Character story berhasil didaftarkan dan menunggu review admin!",
      ephemeral: true,
    });
  },
};
*/








/* const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const {
  saveReportData,
  getUserReport,
  deleteReportData,
} = require("../../functions/reportHandler");

module.exports = {
  customId: "reportBugModal",
  async execute(interaction) {
    const userId = interaction.user.id;

    // Cek apakah user sudah memiliki laporan aktif
    const existingReport = getUserReport(userId);
    if (existingReport) {
      return interaction.reply({
        content: "❌ You already have an active bug report ticket!",
        ephemeral: true,
      });
    }

    const bugTitle = interaction.fields.getTextInputValue("bugTitle");
    const bugDescription =
      interaction.fields.getTextInputValue("bugDescription");
    const bugEvidence = interaction.fields.getTextInputValue("bugEvidence");

    const channelName = `bug-${bugTitle.replace(/\s+/g, "-").toLowerCase()}`;
    const channel = await interaction.guild.channels.create({
      name: channelName,
      type: 0,
      parent: db.channel.category.reports,
      permissionOverwrites: [
        {
          id: interaction.guild.roles.everyone.id,
          deny: ["ViewChannel"],
        },
        {
          id: userId,
          allow: ["ViewChannel", "SendMessages", "ReadMessageHistory"],
        },
      ],
    });

    const embed = new EmbedBuilder()
      .setTitle(`Bug Report: ${bugTitle}`)
      .setColor("#FF0000")
      .setDescription(bugDescription)
      .addFields({ name: "Evidence", value: bugEvidence })
      .setFooter({ text: `Reported by ${interaction.user.tag}` })
      .setTimestamp();

    const deleteButton = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("deleteBugTicket")
        .setLabel("Delete Ticket")
        .setStyle(ButtonStyle.Danger)
    );

    await channel.send({
      content: `Bug report by <@${userId}>`,
      embeds: [embed],
      components: [deleteButton],
    });

    saveReportData(userId, bugTitle, bugDescription, bugEvidence);

    interaction.reply({
      content: `✅ Bug report ticket created successfully: <#${channel.id}>`,
      ephemeral: true,
    });
  },
};
*/