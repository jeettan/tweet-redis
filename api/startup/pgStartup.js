const pg = require('../config/pg.js')

async function getPgVersion() {

    const result = await pg.query('SELECT version()');
    console.log(result.rows[0].version);

    const check_user_table = await pg.query(`
    SELECT EXISTS ( SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users'
  )`)

    const check_tweets_table = await pg.query(`
    SELECT EXISTS ( SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'tweets'
  )`)

    const check_likes_table = await pg.query(`
    SELECT EXISTS ( SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'tweets'
  )`)

    if (check_user_table.rows[0].exists == false) {

        await pg.query(`CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        first_name VARCHAR(50),
        last_name VARCHAR(50),
        username VARCHAR(50),
        password VARCHAR(50)
        );`)
    }

    if (check_tweets_table.rows[0].exists == false) {

        await pg.query(`CREATE TABLE tweets (
    id SERIAL PRIMARY KEY,
    title VARCHAR(50),
    tweet VARCHAR(280),
    date VARCHAR(50),
    user_id INTEGER
);`)
    }

    if (check_likes_table.rows[0].exists == false) {

        await pg.query(`CREATE TABLE likes (
        id SERIAL PRIMARY KEY,
        user_id INTEGER,
        post_id INTEGER
    );`);

    }

}

module.exports = getPgVersion