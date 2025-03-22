let db = require("../database/index.js");
const GeminiAI = require("../functions/gemini.js")

const toggleChatAi = db.config.chatAi;
const Channels = db.channel.chatAi;
const apikey = "AIzaSyCy2tCZupKWqsJENh6K9E08AIAbsERGnEE"

module.exports = {
  name: "messageCreate",
  async execute(message) {
    if (!message.guild || message.author.bot) {
      return;
    }
    if (message.channel.id !== Channels) {
      return;
    }
    if (message.content == "!togchat") {
      if (!message.member.permissions.has("ADMINISTRATOR")) {
        return 
      }
      db.config.chatAi = !db.config.chatAi;

      
      return message.reply(`Chat AI telah ${db.config.chatAi ? "diaktifkan" : "dinonaktifkan"}.`);
    } 
    if (!toggleChatAi) {
      return;
    }
    const chatAi = new GeminiAI(apikey);
    const prompt = message.content.trim();
    try {
    chatAi.generateContent(prompt).then(async(result) => {
      try {
          message.reply(result)
        } catch (err) {
          await message.reply("Terjadi kesalahan.")
          console.log(err)
        }
      })
    } catch (err) {
      message.reply("Terjadi kesalahan.")
      console.log(err)
    }
  },
};