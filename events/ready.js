const { startAutoUpdate } = require("../functions/connect");
const fs = require('fs')
const db = require('../database/index.js')
const samp = require('samp-query');
const connection = {
  host: db.config.server.serverIP,
  port: db.config.server.serverPort
}

module.exports = {
  name: "ready",
  once: true,
  execute(client) {
    console.log(`Logged in as ${client.user.tag}!`);
    client.user.setActivity("GarudaPride");

    startAutoUpdate(client); 
    function StatusActivityUpdate() {
      samp(connection, (error, response) => {
        if(error) {
          client.user.setActivity('GarudaPride Roleplay Maintance')
        } else {
          client.user.setActivity('GarudaPride Roleplay ' + response.online + ' Players')
        }
      })
    } 
    setInterval(StatusActivityUpdate, 20000);
  },
};
