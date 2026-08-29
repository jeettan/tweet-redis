const { Pool } = require('pg')
const { PGURL } = process.env;

const pg = new Pool({
    connectionString: `${PGURL}`
    /*
    ssl: {
        rejectUnauthorized: false
    }
        */
})

module.exports = pg
