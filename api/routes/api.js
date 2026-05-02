
const express = require("express");
const router = express.Router();
const pg = require('../config/pg.js')
const client = require('../config/redis.js')

const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

async function registerUser(fn, ln, user, pwd) {

    await pg.query(`INSERT INTO users (first_name, last_name, username, password) VALUES ($1, $2, $3, $4)`, [fn, ln, user, pwd]);
}

router.get('/', (req, res) => {
    res.send('Hello World from Express!');
});

router.post('/register', asyncHandler(async (req, res) => {

    console.log("Registering user..")

    let k = await pg.query(`SELECT * FROM users WHERE username = '${req.body.username}'`);
    k = k.rows

    if (k.length === 0) {

        await registerUser(req.body.firstName, req.body.lastName, req.body.username, req.body.pwd);
        res.status(200).send("User registered successfully");

    } else {

        res.status(400).json({ error: "Username already exists" })
    }


}))

router.post('/login', asyncHandler(async (req, res) => {

    console.log("User logging in..")

    if (!req.body.username || !req.body.pwd) return res.status(400).json({ error: "Missing username or password fields" })

    let k = await pg.query(`SELECT id, username FROM users WHERE username = $1 AND password = $2`, [req.body.username, req.body.pwd])
    k = k.rows

    if (k.length > 0) {

        req.session.user = { id: k[0].id, username: k[0].username };
        console.log("Login success", req.session.user.username)
        res.status(200).json('Login success!')
    } else {
        res.status(401).json({ error: "Invalid credentials" })
    };


}))


router.get('/profile', asyncHandler(async (req, res) => {

    if (!req.sessionID) {
        return res.status(200).json({ loggedIn: false });
    }

    const redis = await client.get(`sess:${req.sessionID}`)

    if (!redis) {
        return res.status(200).json({ loggedIn: false });
    }

    let user = JSON.parse(redis)
    user = user.user

    res.json({ loggedIn: true, user: user })

}))

router.get('/logout', (req, res) => {

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

    console.log("Updating redis..")

    await client.del('tweet_ids:all');
    const keys = await client.keys('tweet:*');

    if (keys.length > 0) {

        await client.del(keys)
    }

    let k = await pg.query(`
    SELECT 
        tweets.id,
        tweets.title,
        tweets.tweet,
        tweets.date,
        tweets.likes,
        users.username
    FROM tweets
    JOIN users ON tweets.user_id = users.id`)
    k = k.rows
    for (i in k) {

        await client.set(`tweet:${k[i].id}`, JSON.stringify(k[i]));

        await client.sAdd('tweet_ids:all', k[i].id.toString());

    }

    console.log("Updated redis cache from Postgres")
}

router.get('/update-redis', asyncHandler(async (req, res) => {

    updateRedis()
    res.send("Update redis endpoint")
}))

router.get('/get-tweets-from-cache', asyncHandler(async (req, res) => {

    const ids = await client.sMembers('tweet_ids:all');

    ids.sort((a, b) => b - a)

    if (!ids || ids.length === 0) {
        await updateRedis()
        ids = await client.sMembers('tweet_ids:all');
    }
    let tweets = []
    for (i in ids) {

        const tweetData = await client.get(`tweet:${ids[i]}`);
        tweet = JSON.parse(tweetData)
        tweets.push(tweet)
    }

    res.send(tweets)
}))

async function updateLikesRedis(qu) {

    let id = Number(qu)

    let q = await pg.query(`
            SELECT * FROM likes WHERE user_id=$1`, [id])

    q = q.rows

    let post_ids = []

    for (let item of q) {

        post_ids.push(item.post_id)

    }

    await client.set(`user:${qu}:likes`, JSON.stringify(post_ids))

}

router.get('/get-likes-from-cache', asyncHandler(async (req, res) => {

    if (!req.session.user.id) return

    let likes = await client.get(`user:${req.session.user.id}:likes`);

    if (!likes || likes.length === 0) {

        await updateLikesRedis(req.session.user.id)
        likes = await client.get(`user:${req.session.user.id}:likes`);

    }

    let parseLikes = JSON.parse(likes)
    res.status(200).json(parseLikes)

}))

router.post('/post-tweet', asyncHandler(async (req, res) => {

    const today = new Date().toLocaleDateString("en-CA");

    let k = await pg.query(`INSERT INTO tweets (title, tweet, date, user_id)
   VALUES ($1, $2, $3, $4)`, [req.body.title, req.body.text, today, req.body.id])

    await updateRedis()

    res.send("Tweet successfully posted")

}))

router.patch('/like-count', asyncHandler(async (req, res) => {

    let k = await pg.query(`UPDATE tweets SET likes = likes + $1 WHERE id = $2 `, [req.body.val, req.body.id]);
    await updateRedis()
    res.send("Updated likes success")

}))

router.get('/likes', asyncHandler(async (req, res) => {

    const userId = Number(req.query.user_id);

    console.log(userId)
    let k = await pg.query(`SELECT * FROM likes WHERE user_id = $1`, [userId]);
    res.send(k.rows)

}))

router.post('/likes', asyncHandler(async (req, res) => {

    await pg.query(`INSERT INTO likes (user_id, post_id) VALUES ($1,$2)`, [req.body.user_id, req.body.post_id]);
    await updateLikesRedis(req.body.user_id)
    await updateRedis()
    console.log("A user liked a post")
    res.send("A user liked a post")

}))

router.delete('/likes', asyncHandler(async (req, res) => {

    await pg.query(`DELETE FROM likes WHERE user_id = $1 AND post_id = $2`, [req.body.user_id, req.body.post_id]);
    await updateLikesRedis(req.body.user_id)
    await updateRedis()
    console.log("A user unliked a post..")
    res.send("A user unliked a post..")

}))

router.get('/likes-by-user-id', asyncHandler(async (req, res) => {

    const likes = await pg.query(`
    SELECT 
        tweets.title,
        tweets.tweet,
        users.username
    FROM likes
    JOIN tweets ON likes.post_id = tweets.id
    JOIN users ON tweets.user_id = users.id
    WHERE likes.user_id = $1
    `, [req.session.user.id]);

    console.log(likes.rows)

    res.send(likes.rows)

}))

module.exports = router