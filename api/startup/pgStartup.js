const pg = require('../config/pg.js');

async function getPgVersion() {
  try {
    const result = await pg.query('SELECT 1');
    if (result.rows[0]['?column?'] == 1) {

      console.log("PG works!")
    } else {

      throw new Error("PG Not working")
    }

    console.log("Postgres startup check complete");
  } catch (err) {
    console.error("Postgres startup failed:", err.message);
  }
}

module.exports = getPgVersion;