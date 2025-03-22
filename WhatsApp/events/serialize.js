const { getContentType, downloadContentFromMessage } = require("@whiskeysockets/baileys");
const { decodeJid, downloadMedia } = require('../functions/functions.js')

class Serialize {
  constructor(message, conn, store) {
    this.key = message.key;
    this.messageTimestamp = message.messageTimestamp;
    this.pushName = message.pushName;
    this.message = message.message;
    this.savedb = {}; 
    if(this.key) {
      this.id = this.key.id;
      this.fromMe = this.key.fromMe;
      this.isGroup = this.key?.remoteJid.endsWith("@g.us");
      this.chat = decodeJid(
        this.key?.remoteJid ||
        (this.key?.remoteJid && this.key?.remoteJid !== "status@broadcast") ||
        ""
      );
      this.sender = decodeJid(
        (this.key?.fromMe && this.conn?.user.id) ||
        this.participant ||
        this.key.participant ||
        this.chat ||
        ""
      );
    }
    if(this.message) {
      if(this.message?.messageContextInfo) delete this.message.messageContextInfo;
      if(this.message?.senderKeyDistributionMessage) delete this.message.senderKeyDistributionMessage;
      this.type = getContentType(this.message);
      if(this.type === "ephemeralMessage") {
        this.message = this.message[this.type].message;
        const tipe = Object.keys(this.message)[0];
        this.type = tipe;
        if(tipe === "viewOnceMessage") {
          this.message = this.message[this.type].message;
          this.type = getContentType(this.message);
        }
      }
      if(this.type === "viewOnceMessage") {
        this.message = this.message[this.type].message;
        this.type = getContentType(this.message);
      }
      this.mtype = Object.keys(this.message).filter(
        (v) => v.includes("Message") || 
        v.includes("conversation")
      )[0];
      this.mentions = this.message[this.type]?.contextInfo ? this.message[this.type]?.contextInfo.mentionedJid : null;
      try {
        const quoted = this.message[this.type]?.contextInfo;
        if(quoted.quotedMessage["ephemeralMessage"]) {
          const tipe = Object.keys(quoted.quotedMessage.ephemeralMessage.message)[0];
          if(tipe === "viewOnceMessage") {
            this.quoted = {
              type: "view_once",
              stanzaId: quoted.stanzaId,
              participant: decodeJid(quoted.participant),
              message: quoted.quotedMessage.ephemeralMessage.message.viewOnceMessage.message,
            };
          } else {
            this.quoted = {
              type: "ephemeral",
              stanzaId: quoted.stanzaId,
              participant: decodeJid(quoted.participant),
              message: quoted.quotedMessage.ephemeralMessage.message,
            };
          };
        } else if(quoted.quotedMessage["viewOnceMessage"]) {
          this.quoted = {
            type: "view_once",
            stanzaId: quoted.stanzaId,
            participant: decodeJid(quoted.participant),
            message: quoted.quotedMessage.viewOnceMessage.message,
          };
        } else {
          this.quoted = {
            type: "normal",
            stanzaId: quoted.stanzaId,
            participant: decodeJid(quoted.participant),
            message: quoted.quotedMessage,
          };
        }
        this.quoted.fromMe = this.quoted.participant === decodeJid(conn.user.id);
        this.quoted.mtype = Object.keys(this.quoted.message).filter(
          (v) => v.includes("Message") ||
          v.includes("conversation")
        )[0];
        this.quoted.text = this.quoted.message[this.quoted.mtype]?.text ||
          this.quoted.message[this.quoted.mtype]?.description ||
          this.quoted.message[this.quoted.mtype]?.caption ||
          this.quoted.message[this.quoted.mtype]?.hydratedTemplate?.hydratedContentText ||
          this.quoted.message[this.quoted.mtype]?.editedMessage?.extendedTextMessage?.text ||
          this.quoted.message[this.quoted.mtype] ||
          "";
        this.quoted.key = {
          id: this.quoted.stanzaId,
          fromMe: this.quoted.fromMe,
          remoteJid: this.chat,
        };
        this.quoted.delete = () => conn.sendMessage(this.chat, { delete: this.quoted.key });
        this.quoted.download = (pathFile) => downloadMedia(this.quoted.message, pathFile);
        this.quoted.react = (text) => conn.sendMessage(this.chat, { 
          react: { 
            text, 
            key: this.quoted.key 
          } 
        });
        this.quoted.getObj = store.messages[this.chat].get(this.quoted.stanzaId)
        if(this.quoted.getObj) {
          let attribute = this.quoted.getObj
          this.mObj = new Map()
          if(this.mObj) {
            this.mObj.key = attribute.key
            if(this.mObj.key) {
              this.mObj.chat = attribute.remoteJid
              this.mObj.fromMe = attribute.fromMe
              this.mObj.id = attribute.id
              this.mObj.participant = attribute.participant
            };
            this.mObj.timestamp = attribute.messageTimestamp
            this.mObj.pushName = attribute.pushName
            this.mObj.broadcast = attribute.broadcast
            let media = ['stickerMessage', 'imageMessage', 'videoMessage', 'contactMessage', 'locationMessage', 'audioMessage', 'documentMessage', 'productMessage', 'orderMessage', 'interactiveMessage', 'pollCreationMessage', 'liveLocationMessage', 'viewOnceMessageV2', 'extendedTextMessage', 'documentWithCaptionMessage', 'conversation' ];
            try {
              if(attribute.message[this.type] === null) {
                this.mObj.message = attribute.message?.[media.filter(v => v === this.quoted?.mtype)[0]]
              } else { 
                this.mObj.message = attribute.message?.[this.type]
              };
            } catch (error) {
              return 'pending'
            };
          };
        };
      } catch {
        this.quoted = null;
      }
      this.body = this.message?.conversation ||
        this.message?.[this.type]?.text ||
        this.message?.[this.type]?.caption ||
        this.message?.[this.type]?.editedMessage?.extendedTextMessage?.text ||
        (this.type === "listResponseMessage" &&
        this.message?.[this.type]?.singleSelectReply?.selectedRowId) ||
        (this.type === "buttonsResponseMessage" &&
        this.message?.[this.type]?.selectedButtonId) ||
        (this.type === "templateButtonReplyMessage" && this.message?.[this.type]?.selectedId) ||
        "";
      this.msg = (this.type == 'viewOnceMessage' ? 
        this.message?.[this.type].message[getContentType(message[this.type].message)] : 
        this.message?.[this.type])
      this.text = this.msg?.text || 
        this.msg?.caption || 
        this.message?.conversation ||
        this.msg?.contentText || 
        this.msg?.selectedDisplayText ||
        this.msg?.title || 
        '';
      this.budy = (this.type === 'conversation') ?
        this.message.conversation : 
        (this.type == 'imageMessage') ? 
        this.message.imageMessage.caption :
        (this.type == 'videoMessage') ? 
        this.message.videoMessage.caption : 
        (this.type == 'extendedTextMessage') ? 
        this.message.extendedTextMessage.text :
        ''.slice(1).trim().split(/ +/).shift().toLowerCase()
      this.prefix = /^[/\.!#]/.test(this.budy) ? 
        this.budy.match(/^[/\.!#]/) :
        '-';
      this.cmd = (this.type === 'conversation' && 
        this.message.conversation.startsWith(this.prefix)) ?
        this.message.conversation : 
        (this.type == 'imageMessage' &&
        this.message.imageMessage.caption.startsWith(this.prefix)) ? 
        this.message.imageMessage.caption : 
        (this.type == 'videoMessage' &&
        this.message.videoMessage.caption.startsWith(this.prefix)) ?
        this.message.videoMessage.caption : 
        (this.type == 'extendedTextMessage' && 
        this.message.extendedTextMessage.text.startsWith(this.prefix)) ? 
        this.message.extendedTextMessage.text :
        (this.type == 'buttonsResponseMessage' &&
        this.message.buttonsResponseMessage.selectedButtonId) ?
        this.message.buttonsResponseMessage.selectedButtonId : 
        (this.type == 'listResponseMessage') ?
        this.message.listResponseMessage.singleSelectReply.selectedRowId :
        (this.type == 'templateButtonReplyMessage' && 
        this.message.templateButtonReplyMessage.selectedId) ? 
        this.message.templateButtonReplyMessage.selectedId :
        (this.type === 'messageContextInfo') ?
        (this.message.buttonsResponseMessage?.selectedButtonId ||
        this.message.listResponseMessage?.singleSelectReply.selectedRowId ||
        this.text) :
        '';
      this.args = this.cmd.trim().split(/ +/).slice(1);
      this.query = this.args.join(" ");
      this.command = this.cmd.slice(1).trim().split(/ +/).shift().toLowerCase();
      this.quots = this.quoted ? this.quoted : this;
      this.mime = (this.quots.msg || 
        this.quots).mimetype || 
        this.quots.mediaType || 
        "";
      this.validGroup = (id,array) => {
        for (var i = 0; i <array.length; i++) {
          if(array[i]==id) {
            return !0
          };
        };
        return !1
      };
      this.editMessage = (text, keys) => {
        return conn.sendMessage(this.chat, { text, mentions: [this.sender, ...text.matchAll(/@([0-9]{5,16}|0)/g)].map((v) => v[1] + "@s.whatsapp.net"), edit: keys, ...options }, { quoted: this, ...options })
      };
      this.reply = (text, options = {}) => {
        return conn.sendMessage(this.chat, { text, mentions: [this.sender, ...text.matchAll(/@([0-9]{5,16}|0)/g)].map((v) => v[1] + "@s.whatsapp.net"), ...options }, { quoted: this, ...options })
      };
      this.download = (pathFile) => downloadMedia(this.message, pathFile);
      this.react = (text) => conn.sendMessage(this.chat, { react: { text, key: this.key } });
    };
    return this;
  };
};
module.exports = Serialize