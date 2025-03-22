const { jidDecode, downloadContentFromMessage, generateWAMessageFromContent, proto } = require("@whiskeysockets/baileys");
const fs = require('fs');
const path = require('path');
const util = require('util');

const promises = fs.promises;
const readdirSync = fs.readdirSync;
const statSync = fs.statSync;
const watchFile = fs.watchFile;

const dirname = path.dirname;
const join = path.join;
const basename = path.basename;

const promisify = util.promisify;


function decodeJid (jid) {
  if (/:\d+@/gi.test(jid)) {
    const decode = jidDecode(jid) || {};
    return (
      (decode.user && decode.server && decode.user + "@" + decode.server) ||
      jid
    ).trim();
  } else {
    return jid.trim();
  };
};

async function downloadMedia(message, pathFile) {
  const type = Object.keys(message)[0];
  const mimeMap = {
    imageMessage: "image",
    videoMessage: "video",
    stickerMessage: "sticker",
    documentMessage: "document",
    audioMessage: "audio",
  };
  try {
    if (pathFile) {
      const stream = await downloadContentFromMessage(message[type], mimeMap[type]);
      let buffer = Buffer.from([]);
      for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
      }
      await promises.writeFile(pathFile, buffer);
      return pathFile;
    } else {
      const stream = await downloadContentFromMessage(message[type], mimeMap[type]);
      let buffer = Buffer.from([]);
      for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
      };
      return buffer;
    };
  } catch (e) {
    Promise.reject(e);
  };
};

const sleep = async (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
} 

module.exports = { 
  decodeJid, 
  downloadMedia,
  sleep
}