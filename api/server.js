require("./config/config");

const app = require("./index.js");
const { initializeDatabase } = require("./schemas/db");

const getPgVersion = require("./startup/pgStartup.js");
const connectToRedis = require("./startup/redisStartup.js");

const port = process.env.port || 8080;

async function startServer() {

    await initializeDatabase();
    await getPgVersion();
    await connectToRedis();

    app.listen(port, () => {
        console.log(`API listening at http://localhost:${port}`);
    });
}

startServer();