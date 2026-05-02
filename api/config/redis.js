const redis = require('redis');

require('dotenv').config();

const { REDISHOST, REDISPWD, REDISPORT } = process.env;
const NODE_ENV = process.env.NODE_ENV

const client =
    NODE_ENV === "development" ? redis.createClient({
            socket: {
                host: "127.0.0.1",
                port: 6379,
            },
        }) : redis.createClient({
            username: "default",
            password: REDISPWD,
            socket: {
                host: REDISHOST,
                port: Number(REDISPORT),
                tls: false,
            }, });

module.exports = client