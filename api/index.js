const express = require('express');
const app = express();
var session = require('express-session')

const getPgVersion = require("./startup/pgStartup.js");
const connectToRedis = require("./startup/redisStartup.js");

require('dotenv').config();

const port = process.env.port || 8080
const apiRoutes = require("./routes/api.js");

var cors = require('cors');
app.use(express.json());
app.set("trust proxy", 1);

app.use(session({
    name: "connect.sid",
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
    origin: "http://localhost:3000",
    methods: ["POST", "PUT", "GET", "OPTIONS", "HEAD"],
    credentials: true
}));

getPgVersion();
connectToRedis();

app.use("/api", apiRoutes);

app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({
        error: err.message || "Internal Server Error"
    });
});

app.listen(port, () => {
    console.log(`API listening at http://localhost:${port}`);
});