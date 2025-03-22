const { pool } = require("./database");

async function getUserData(discordId) {
  const query =
    "SELECT playerucp, verifycode FROM playerucp WHERE DiscordID= ?";
  const [rows] = await pool.execute(query, [discordId]);
  return rows[0] || null;
}

async function getUserCharacters(ucpName) {
  if (!ucpName) {
    throw new Error("UCP Name tidak ditemukan.");
  }

  const query = "SELECT username FROM players WHERE ucp = ?";
  const [rows] = await pool.execute(query, [ucpName]);

  return rows.map((row) => row.username);
}

async function resendCode(userid) {
  const query =
    "SELECT * FROM playerucp WHERE DiscordID = ?";
  const [rows] = await pool.execute(query, [userid]);
  return rows[0] || null
}

module.exports = { getUserData, resendCode, getUserCharacters, };
