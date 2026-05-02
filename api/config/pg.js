const { Pool } = require('pg')

require("dotenv").config();

const { PGHOST, PGDATABASE, PGUSER, PGPASSWORD } = process.env;
const NODE_ENV = process.env.NODE_ENV

const pg = NODE_ENV == "development" ?
    new Pool({
        user: 'postgres',
        password: '12345',
        host: 'localhost',
        port: 5433,
        database: 'tweet_app'
    }) : new Pool({
        connectionString: `postgresql://${PGUSER}:${PGPASSWORD}@${PGHOST}/${PGDATABASE}?sslmode=require`,
        ssl: {
            rejectUnauthorized: false
        }
    })

module.exports = pg
