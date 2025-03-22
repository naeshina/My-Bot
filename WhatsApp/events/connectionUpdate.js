class connectionUpdate {
  constructor(update, DiscordWhatsAppConnection, client) {
    this.start = DiscordWhatsAppConnection;
    this.update = update;
    this.client = client
    const { connection, lastDisconnect } = this.update
    switch (connection) {
      case 'connecting': {
        console.info('Connecting To WhatsApp . . .')
      }
      break
      case 'open': {
        console.log(`Connected To (${this.client.wa.user.name}) WhatsApp Bot`)
      }
      break
      case 'close': {
        console.info('Connection Closed, Reconnecting . . .')
        console.log(lastDisconnect)
        this.start()
      }
      break
    }
  }
}
module.exports = connectionUpdate;