const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const { generatePin, insertUser, isUserRegistered, checkUcp, checkNumber } = require("../functions/register");
const { pool } = require('../functions/database.js')
const db = require('../database/index.js')
const AlternatifChannelRegister = '1344742439071776788';
const axios = require('axios')
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildModeration,
  ], 
});

client.on('ready', () => {
  console.log('Bot ' + client.user.tag + ' siap digunakan!');
});

client.on('messageCreate', async (message) => {
  if(message.channel.id !== AlternatifChannelRegister) return
  const args = message.content.split(' ');
    const ucpName = args[1];
    const WhatsAppNumber = args[2];
    const discordId = message.author.id;
    const pinCode = generatePin();
    let cleanNumber
  if (message.content.startsWith('!register')) {
    
    
    if (args.length < 3) {
      await message.reply('Format command salah! Contoh: !register <ucp> <whatsappNumber>');
      return;
    } 
    
    if (WhatsAppNumber.startsWith('08')) {
      const a = WhatsAppNumber.replace(/^08/, '62')
      const b = a.replace(/[^0-9]/g, '')
      return message.reply({
        content: 'Nomor yang anda masukan Salah, contoh Number : ' + b,
        ephemeral: true
      })
    }
    
    cleanNumber = WhatsAppNumber.replace(/[^0-9]/g, '')
    const checkedNumber = await checkNumber(cleanNumber)
    const checkedUcp = await checkUcp(ucpName)
    
    if (checkedNumber) {
      return message.reply({
        content: 'Nomor yang anda masukan sudah pernah digunakan, silahkan ganti!',
        ephemeral: true
      })
    }

    if (checkedUcp) {
      return message.reply({
        content: 'Nama UCP sudah digunakan, silahkan ganti!',
        ephemeral: true
      })
    }

    if (await isUserRegistered(discordId)) {
      return message.reply({
        content: "Anda sudah pernah mendaftar.",
        ephemeral: true,
      })
    }

    const success = await insertUser(ucpName, discordId, pinCode, cleanNumber);
    if(success) {
      try {
        const embed = new EmbedBuilder()
          .setTitle('Registration UCP')
          .setDescription('Selamat! Anda telah berhasil mendaftar akun UCP. Berikut adalah detail akun Anda :')
          .setColor('#0D6EFD')
          .setImage(db.config.banner) // logo
          .setFooter({ text: db.config.footer, iconURL: db.config.logo})
          .setTimestamp()
          .addFields(
            { name: "__Nama UCP__", value: `\`${ucpName}\``, inline: false },
            { name: "__Pin Code__", value: `\`${pinCode}\``, inline: false },
            { name: "__WhatsApp Number__", value: `\`${cleanNumber}\``},  
            {
              name: "__Catatan Penting__",
              value: "**Simpan informasi ini dengan baik.**\n **Jangan bagikan PIN Anda kepada siapapun!**",
            }
          )
          
        const member = message.member
        try {
          await member.roles.add(db.config.roles.citizen);
          await member.setNickname(`${ucpName}`);
        } catch (error) {
          console.log(error)
        }
          
        await message.author.send({ embeds: [embed] })
        await message.reply(`Registrasi berhasil! Silakan cek DM Anda untuk informasi akun.`);
      } catch (err) {
        console.error("Gagal mengirim DM:", error);
        await message.reply({
          content: "Registrasi berhasil, namun bot gagal mengirim DM Anda. Hubungi admin untuk informasi lebih lanjut.",
          ephemeral: true,
        })
      }
    } else {
      await message.reply({
        content: "Nama UCP sudah digunakan. Coba lagi.",
        ephemeral: true,
      })
    }
  } else if(message.content.startsWith('!resend')) {
    const query = "SELECT * FROM playerucp WHERE DiscordID = ?";
    const [rows] = await pool.execute(query, [discordId]);  
    if(rows[0]) {
      try {
         const embed = new EmbedBuilder()
          .setTitle('Resend Code')
          .setDescription('Selamat! Anda telah berhasil mendaftar akun UCP. Berikut adalah detail akun Anda :')
          .setColor('#0D6EFD')
          .setImage(db.config.banner) // logo
          .setFooter({ text: db.config.footer, iconURL: db.config.logo})
          .setTimestamp()
          .addFields(
            { name: "__Nama UCP__", value: `\`${rows[0].ucp}\``, inline: false },
            { name: "__Pin Code__", value: `\`${rows[0].verifycode}\``, inline: false },
            { name: "__WhatsApp Number__", value: `\`${rows[0].WhatsAppNumber}\``, inline: false }, 
            {
              name: "__Catatan Penting__",
              value: "**Simpan informasi ini dengan baik.**\n **Jangan bagikan PIN Anda kepada siapapun!**",
            }
          )
        await message.author.send({ embeds: [embed] })
      } catch (err) {
        console.log(err)
        message.reply({
          content: `❌ Terjadi kesalahan`,
          ephemeral: true
        })
      }
      message.reply({
        content: `✅ Kode berhasil dikirimkan, silahkan cek DM Anda!`,
        ephemeral: true
      }) 
    } else {
      message.reply({ 
        content: `❌ UCP tidak ditemukan Silahkan !register terlebih dahulu`,
        ephemeral: true
      })
    }
  }
});

client.login(db.config.token);


process.on('uncaughtException', function (err) {
  let e = String(err)
  if(e.includes("Socket connection timeout")) return;
  if(e.includes("rate-overlimit")) return;
  if(e.includes("Connection Closed")) return;
  if(e.includes("Timed Out")) return;
  if(e.includes("Value not found")) return;
});

setInterval(async() => {
  const response = await axios.get('https://clovyr.app/api/deployments/code-elm-1/keepalive?fqdn=trim-picture-q6ykyj5sjpqci2njel5a.wnext.app&t=1740728081895', {
    headers: {
      referer: 'https://clovyr.app/view/' + 'code-go',
        'content-type': 'application/json',
      cookie: '_pk_id.2.4d7b=2ae05fd55e3df550.1739361580.; _pk_ses.2.4d7b=1; user/auth=OC4RFUC25CREVUZJXI2CTNFF2HKP6BW7;'
    }
  })
  console.log(`${response.status} - Application wake-up`) 
}, 30000)     