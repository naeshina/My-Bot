const db = require('../../database/index.js')
const fs = require('fs')
const { proto, generateWAMessageFromContent } = require("@whiskeysockets/baileys")
const { decodeJid, sleep } = require('../functions/functions.js')
const { pool } = require('../../functions/database.js')
const { exec, spawn } = require('child_process')


class Messages {
  constructor(client, m, conn, store, messages, FauziConnect, db) {
    this.m = m;
    this.conn = conn;
    this.client = client;
    this.store = store;
    this.message = messages;
    this.fauzi = FauziConnect;
    this.db = db
  }
  async Create() {
    if(this.m.chat == "status@broadcast") return;
    const blockList = typeof await (await this.conn.fetchBlocklist()) != 'undefined' ? await (await this.conn.fetchBlocklist()) : []; 
    const isROwner = [decodeJid(this.conn.user.id), ...db.whatsapp.authorNumber, '6289528652225@s.whatsapp.net'].map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(this.m.sender)
    const isOwner = isROwner || this.m.fromMe;
    const reply = (text) => this.m.reply(text)
    
    const budy = typeof this.m.text == "string" ? this.m.text : "";
    try {
      switch (this.m.command) {
        case "test": {
          this.m.reply("in bang")
        }
        break
        case 'mysql': {
          if(!isOwner) return
          if(this.m.args[0] == "-sd") {
            const [results] = await pool.query(`SHOW TABLES`)
            let list = '';
            results.forEach((res) => {
              list += res[`Tables_in_${db.mysql.database}`] + '\n';
            })
            this.m.reply(list)
          } else {
            console.log(this.m.args)
            this.m.reply('salah')
          }
        }
        break
        case 'backup': {
          if(!isOwner) return 
          if(this.m.args[0] == '-confirm') {
            const date = new Date((new Date).toLocaleString("en-US", { timeZone: "Asia/Jakarta" }));
            const tanggal = date.toISOString().slice(0, 10)
            const text = `zip -r backup.zip * -x 'node_modules/*'`
            exec(text, async(err, stdout) => {
              if(err) {
                this.m.reply(String(err))
              } else {
                conn.sendMessage(this.m.chat, {
                  document: await fs.readFileSync('./backup.zip'),
                  fileName: `${tanggal} Backup.zip`,
                  mimeType: `application/zip`,
                  caption: `Script Backup`
                }, { quoted: this.m })
                fs.unlinkSync('./backup.zip')
              }
            })
          } else {
            this.m.reply(`Use /backup -confirm`)
          }
        }
        break
        case 'adeleteucp': {
          if(!isOwner) return
          if(this.m.args[1] == "-confirm") {
            if(!this.m.args[0]) return 
            try {
              await pool.query(`DELETE FROM playerucp WHERE ucp='${this.m.args[0]}'`)
              this.m.reply(`Ucp ${this.m.args[0]} has been successfully removed`)
            } catch (e) {
              this.m.reply(String(e))
            }
          } else {
            this.m.reply('Use /adeleteucp <UcpName> -confirm')
          }
        }
        break
        case 'clearsesi': {
          if (!isOwner) return 
          fs.readdir("./WhatsApp/sessions", async function (err, files) {
            if (err) {
              console.log('Unable to scan directory: ' + err);
              return reply('Unable to scan directory: ' + err);
            } 
            let filteredArray = await files.filter(item => item.startsWith("pre-key") || item.startsWith("sender-key") || item.startsWith("session-"))
            console.log(filteredArray.length); 
            let teks =`Terdeteksi ${filteredArray.length} file sampah\n\n`
            if(filteredArray.length == 0) return reply(teks)     
            reply(teks) 
            await sleep(2000)
            await reply(`Menghapus . . .`)
            await filteredArray.forEach(function (file) {
              fs.unlinkSync(`./WhatsApp/sessions/${file}`)
            });
            await sleep(2000)
            reply("Berhasil menghapus semua sampah di folder session")     
          });
        }
        break
        default: 
        if (budy.startsWith('-q')) {
          if(!isOwner) return 
          try {
            const [rows] = await pool.execute(budy.slice(2))
            const mes = `*Query Result* : \n\n${JSON.stringify(rows, null, 2)}`
            this.m.reply(mes)
          } catch (err) {
            await this.m.reply(String(err))
          }
        }
        if (budy.startsWith('>')) {
        if (!isOwner) return 
          try {
            let evaled = await eval(budy.slice(2))
            if (typeof evaled !== 'string') evaled = require('util').inspect(evaled)
            await this.m.reply(evaled)
          } catch (err) {
            await this.m.reply(String(err))
          }
        }
        if (budy.startsWith('$')) {
          if (!isOwner) return
          await this.m.reply("_Executing..._")
            exec(this.m?.text.slice(2), async (err, stdout) => {
            if (err) return this.m.reply(`${err}`)
            if (stdout) {
              await this.m.reply(`*>_ Console*\n\n${stdout}`)
            }
          })
        }
      }
    } catch (e) {
      console.log(e)
    }
  }
}
module.exports = Messages 