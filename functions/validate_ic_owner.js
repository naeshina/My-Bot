const { pool } = require("./database");

async function validateICOwner(discordId, characterName) {
  try {
    const [ucpRows] = await pool.query(
      "SELECT ucp FROM playerucp WHERE discordid = ?",
      [discordId]
    );

    if (ucpRows.length === 0) {
      console.error("Discord ID tidak ditemukan di tabel UCP");
      return false;
    }

    const ucpName = ucpRows[0].ucp;

    const [playerRows] = await pool.query(
      "SELECT COUNT(*) as count FROM players WHERE ucp = ? AND username = ?",
      [ucpName, characterName]
    );

    if (playerRows[0].count === 0) {
      console.error(
        `Nama karakter '${characterName}' tidak ditemukan untuk UCP '${ucpName}'`
      );
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error in validateICOwner:", error);
    return false;
  }
}

module.exports = { validateICOwner };
