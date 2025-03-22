const fs = require('fs')
const { join, dirname } = require('path')

const dirr = join(__dirname, 'data');
const file = {
  channel: join(dirr, "channel.json"),
  faq: join(dirr, "faq.json"),
  mysql: join(dirr, "mysql.json"),
  config: join(dirr, "settings.json"),
  whatsapp: join(dirr, "whatsapp.json")
}

fs.accessSync(file.channel)
fs.accessSync(file.faq)
fs.accessSync(file.mysql)
fs.accessSync(file.config)
fs.accessSync(file.whatsapp)

const db = {
  channel: JSON.parse(fs.readFileSync(file.channel)),
  faq: JSON.parse(fs.readFileSync(file.faq)),
  mysql: JSON.parse(fs.readFileSync(file.mysql)),
  config: JSON.parse(fs.readFileSync(file.config)),
  whatsapp: JSON.parse(fs.readFileSync(file.whatsapp))
}

setInterval(() => {
  fs.writeFileSync(file.channel, JSON.stringify(db.channel, null, 2));
  fs.writeFileSync(file.faq, JSON.stringify(db.faq, null, 2));
  fs.writeFileSync(file.mysql, JSON.stringify(db.mysql, null, 2));
  fs.writeFileSync(file.config, JSON.stringify(db.config, null, 2));
  fs.writeFileSync(file.whatsapp, JSON.stringify(db.whatsapp, null, 2));
}, 990)

module.exports = db