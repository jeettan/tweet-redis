require("./config/config");

const express = require('express');
const app = express();
var session = require('express-session')

const { RedisStore } = require("connect-redis");

const client = require('./config/redis.js')
const apiRoutes = require("./routes/api.js");

var cors = require('cors');
app.use(express.json());
app.set("trust proxy", 1);

app.use(session({
    name: "connect.sid",
    store: new RedisStore({
        client: client,
        prefix: "sess:",
        ttl: 60 * 60 * 24
    }),
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24

    }
}));


app.use(cors({
    origin: ["http://localhost:3000", "tweet-redis.vercel.app"],
    methods: ["POST", "PUT", "GET", "OPTIONS", "HEAD"],
    credentials: true
}));


app.use("/api", apiRoutes);

app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({
        error: err.message || "Internal Server Error"
    });
});

module.exports = app