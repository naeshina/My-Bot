const mysql = require("mysql2/promise");
const db = require("../database/index.js");

const pool = mysql.createPool({
  host: db.mysql.host,
  user: db.mysql.user,
  password: db.mysql.password,
  database: db.mysql.database,
});

module.exports = { pool };
