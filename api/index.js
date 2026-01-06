const express = require('express');
const app = express();
const { v4: uuidv4 } = require("uuid");
const cookieParser = require("cookie-parser");
const redis = require('redis');

var session = require('express-session')

require('dotenv').config();

const port = process.env.port || 8080

const { neon } = require('@neondatabase/serverless');

const { PGHOST, PGDATABASE, PGUSER, PGPASSWORD, REDISHOST, REDISPWD } = process.env;

const client = redis.createClient({
    username: 'default',
    password: `${REDISPWD}`,
    socket: {
        host: `${REDISHOST}`,
        port: 12458
    }
});

async function connectToRedis() {

    client.on('error', err => console.log('Redis Client Error', err));

    await client.connect();

    await client.set('test', 'foo');
    const result = await client.get('test');
    console.log(result)
}

connectToRedis();

const sql = neon(
    `postgresql://${PGUSER}:${PGPASSWORD}@${PGHOST}/${PGDATABASE}?sslmode=require&channel_binding=require`
);

var cors = require('cors');

app.use(express.json());

app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        sameSite: false,
        maxAge: 1000 * 60 * 60 * 24
    }
}));

app.use(cors({
    origin: "http://localhost:3000",
    methods: ["POST", "PUT", "GET", "OPTIONS", "HEAD"],
    credentials: true
}));

async function getPgVersion() {
    const result = await sql`SELECT version()`;
    console.log(result[0]);
}

async function registerUser(fn, ln, user, pwd) {
    const res = await sql`INSERT INTO users (first_name, last_name, username, password) VALUES (${fn}, ${ln}, ${user}, ${pwd});`
}

app.get('/', (req, res) => {
    res.send('Hello World from Express!');
});

app.post('/register', async (req, res) => {

    try {
        console.log("Register endpoint hit")
        let k = await sql`SELECT * FROM users WHERE username = ${req.body.username}`;

        console.log("K length is", k.length)

        if (k.length === 0) {

            await registerUser(req.body.firstName, req.body.lastName, req.body.username, req.body.pwd);
            res.status(200).send("User registered successfully");

        } else {

            throw new Error("Username already exists")
        }

    } catch (err) {
        console.log(err)
        res.status(500).json({ error: err.message })

    }
});

app.post('/login', async (req, res) => {

    let k = await sql`SELECT * FROM users WHERE username = ${req.body.username} AND password= ${req.body.pwd}`;

    if (k.length > 0) {

        req.session.user = { id: k[0].id, username: k[0].username };
        res.send('Login success!')
    } else {
        res.status(401).json({ error: "Invalid credentials" })
    };
});


app.get('/profile', (req, res) => {

    if (req.session.user) {
        res.json({ loggedIn: true, user: req.session.user })
    } else {

        res.status(200).json({ loggedIn: false })
    }
})

app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
            res.send('Error destroying session');
        } else {
            res.send('Session destroyed');
        }
    });
});

async function updateRedis() {

    await client.flushAll();

    let k = await sql`
    SELECT 
        tweets.id,
        tweets.title,
        tweets.tweet,
        tweets.date,
        users.username
    FROM tweets
    JOIN users ON tweets.user_id = users.id`;

    for (i in k) {

        console.log(k[i])

        await client.set(
            `tweet:${k[i].id} `,
            JSON.stringify(k[i])
        );

        await client.sAdd('tweet_ids:all', k[i].id.toString());

    }

    console.log("Updated redis cache from Postgres")


}
app.get('/update-redis', async (req, res) => {

    updateRedis()
    res.send("Update redis endpoint")
})

app.get('/get-data-from-cache', async (req, res) => {

    const ids = await client.sMembers('tweet_ids:all');

    ids.sort((a, b) => b - a)

    if (ids == null) {
        updateRedis()
    }

    let tweets = []

    for (i in ids) {

        const tweetData = await client.get(`tweet:${ids[i]} `);

        tweet = JSON.parse(tweetData)

        tweets.push(tweet)
    }

    res.send(tweets)
})

app.post('/post-tweet', async (req, res) => {

    const today = new Date().toLocaleDateString("en-CA");

    let k = await sql`INSERT INTO tweets(title, tweet, date, user_id) VALUES(${req.body.title}, ${req.body.text}, ${today}, ${req.body.id})`

    await updateRedis()

    res.send("Tweet successfully posted")

})

app.listen(port, () => {
    console.log(`API listening at http://localhost:${port}`);
});

getPgVersion();
