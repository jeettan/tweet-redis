const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");

const pool = new Pool({
    connectionString: process.env.PGURL
});

async function initializeDatabase() {

    const schemaPath = path.join(__dirname, "schemas.sql");

    const schema = fs.readFileSync(schemaPath, "utf8");

    await pool.query(schema);

    console.log("Database schema initialized");
}

module.exports = {
    pool,
    initializeDatabase
};