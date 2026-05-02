const pg = require('../config/pg.js');

async function getPgVersion() {
    try {
        const result = await pg.query('SELECT 1');
        console.log(result.rows[0].version);

        await pg.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        first_name VARCHAR(50),
        last_name VARCHAR(50),
        username VARCHAR(50),
        password VARCHAR(50)
      );
    `);

        await pg.query(`
      CREATE TABLE IF NOT EXISTS tweets (
        id SERIAL PRIMARY KEY,
        title VARCHAR(50),
        tweet VARCHAR(280),
        date VARCHAR(50),
        user_id INTEGER
      );
    `);

        await pg.query(`
      CREATE TABLE IF NOT EXISTS likes (
        id SERIAL PRIMARY KEY,
        user_id INTEGER,
        post_id INTEGER
      );
    `);

        console.log("Postgres startup check complete");
    } catch (err) {
        console.error("Postgres startup failed:", err.message);
    }
}

module.exports = getPgVersion;