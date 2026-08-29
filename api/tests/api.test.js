const request = require("supertest");
const app = require("../index");
const connectToRedis = require("../startup/redisStartup");
const client = require("../config/redis");
const pg = require("../config/pg")
const { updateRedis } = require("../routes/api");

jest.setTimeout(20000);

beforeAll(async () => {
    await connectToRedis();
});

afterAll(async () => {
    if (client && typeof client.isOpen === "boolean" && client.isOpen) {
        await client.quit();
    }
    await pg.query(`
        TRUNCATE TABLE
            likes,
            comments,
            tweets,
            users
        RESTART IDENTITY
        CASCADE
    `);

    await pg.end()
});

beforeEach(async () => {

    await client.flushDb();

    await pg.query(`
        TRUNCATE TABLE
            likes, comments, tweets, users
        RESTART IDENTITY CASCADE
    `);
});

async function registerAndLogin() {

    const agent = request.agent(app)

    await agent.post("/api/register").send({ username: "hello", pwd: "test", firstName: "Jeet", lastName: "Tan" })

    const login = await agent.post("/api/login").send({ username: "hello", pwd: "test" })

    return agent

}

describe("post tweet - POST /post-tweet", () => {

    test("creates a tweet", async () => {

        let agent = await registerAndLogin()

        const payload = {
            title: "Test tweet",
            text: "Test tweet",
            user_id: 1,
            shared_post: false
        };

        const response = await agent
            .post("/api/post-tweet")
            .send(payload);

        const get = await pg.query(`SELECT * FROM tweets`)

        let data = get.rows[0]

        const payloadCompare = {

            title: data['title'],
            text: data['tweet'],
            user_id: data['user_id'],
            shared_post: data['shared_post']
        }

        expect(response.status).toBe(200);
        expect(payload).toEqual(payloadCompare)

    });

    test("enter only title payload results in 400 error status", async () => {

        let agent = await registerAndLogin()

        const payload = {
            title: "Only title",

        };

        const response = await agent
            .post("/api/post-tweet")
            .send(payload);

        expect(response.status).toBe(400);

    });

    test("enter title and text without user_id results in 400 error", async () => {

        let agent = await registerAndLogin()

        const payload = {
            title: "Only title",
            text: "Test this",

        };

        const response = await agent
            .post("/api/post-tweet")
            .send(payload);

        expect(response.status).toBe(400);

    });

    test("enter title, text and user_id without shared_post field", async () => {

        let agent = await registerAndLogin()

        const payload = {
            title: "Only title",
            text: "Test this",
            user_id: 1

        };

        const response = await agent
            .post("/api/post-tweet")
            .send(payload);

        const req = await pg.query(`SELECT * FROM tweets`)

        let shared_post = req.rows[0].shared_post

        expect(shared_post).toBe(false);

    });

    test("Post a tweet without logging in should result in 401 unauthorized", async () => {

        const payload = {
            title: "Only title",
            text: "Test this",
            user_id: 1

        };

        const res = await request(app)
            .post("/api/post-tweet")
            .send(payload)

        expect(res.status).toEqual(401)

    })


});

describe("update redis - updateRedis()", () => {

    test("updates the redis tweet cache with no errors", async () => {

        await updateRedis();
        expect(client.isReady).toBe(true)
    });

    test("Redis maps out correct data from database", async () => {

        const today = new Date().toLocaleDateString("en-CA");

        //inserts user

        const userResult = await pg.query(`
        INSERT INTO users (username, password)
        VALUES ($1, $2)
        RETURNING id
    `, ["testuser", "password"]);

        const userId = userResult.rows[0].id;

        let payload = {
            "title": "Good tweet",
            "tweet": "Good tweet 2",
        }

        let returnId = await pg.query(`INSERT INTO tweets (title, tweet, date, user_id, shared_post)
           VALUES ($1, $2, $3, $4, $5) RETURNING id`, [payload["title"], payload["tweet"], today, userId, false])

        returnId = returnId.rows[0].id

        await updateRedis();

        let j = await client.get(`tweet:${returnId}`);
        let tweet_all = await client.sMembers("tweet_ids:all");

        j = JSON.parse(j)

        let payloadCompare = {

            "title": j["title"],
            "tweet": j["tweet"]
        }
        expect(client.isReady).toBe(true)
        expect(tweet_all.includes(returnId.toString())).toBe(true)
        expect(payload).toEqual(payloadCompare)

    });

    test("Redis can put inside its cache 10 items", async () => {

        const today = new Date().toLocaleDateString("en-CA");

        //inserts 1 user returned by userResult

        const userResult = await pg.query(`
        INSERT INTO users (username, password)
        VALUES ($1, $2)
        RETURNING id
    `, ["testuser", "password"]);

        const userId = userResult.rows[0].id;

        const tweetResult = await pg.query(`
    INSERT INTO tweets (title, tweet, date, user_id, shared_post)
    VALUES
        ($1, $2, $3, $4, $5),
        ($6, $7, $8, $9, $10),
        ($11, $12, $13, $14, $15),
        ($16, $17, $18, $19, $20),
        ($21, $22, $23, $24, $25),
        ($26, $27, $28, $29, $30),
        ($31, $32, $33, $34, $35),
        ($36, $37, $38, $39, $40),
        ($41, $42, $43, $44, $45),
        ($46, $47, $48, $49, $50)
    RETURNING id
`, [
            "Tweet 1", "This is tweet 1", today, userId, false,
            "Tweet 2", "This is tweet 2", today, userId, false,
            "Tweet 3", "This is tweet 3", today, userId, false,
            "Tweet 4", "This is tweet 4", today, userId, false,
            "Tweet 5", "This is tweet 5", today, userId, false,
            "Tweet 6", "This is tweet 6", today, userId, false,
            "Tweet 7", "This is tweet 7", today, userId, false,
            "Tweet 8", "This is tweet 8", today, userId, false,
            "Tweet 9", "This is tweet 9", today, userId, false,
            "Tweet 10", "This is tweet 10", today, userId, false
        ]);

        await updateRedis()

        let tweet_all = await client.sMembers("tweet_ids:all");

        const tweets = await Promise.all(tweet_all.map(async id => JSON.parse(await client.get(`tweet:${id}`))))

        expect(tweet_all.length).toEqual(tweetResult.rowCount)
        expect(tweets.length).toEqual(tweetResult.rowCount)

    });


    test("Redis will not pull tweets into cache without an existing reference user in users in table", async () => {

        const payload = {
            title: "Only title",
            text: "Test this",
            user_id: 1

        };

        await pg.query("INSERT INTO tweets (title, tweet, user_id) VALUES ($1, $2, $3)", [
            payload["title"], payload["text"], payload["user_id"]])

        await updateRedis()

        let tweet_all = await client.sMembers("tweet_ids:all");

        expect(tweet_all.length).toEqual(0)

    })


});

describe("get tweets - GET /get-tweets-from-cache", () => {

    test("pulls tweets from cache if cache is empty but data exists in database", async () => {

        const agent = request.agent(app)

        await agent.post("/api/register").send({ username: "hello", pwd: "test", firstName: "Jeet", lastName: "Tan" })

        const login = await agent.post("/api/login").send({ username: "hello", pwd: "test" })

        expect(login.status).toBe(200)

        const userResult = await pg.query(`
        INSERT INTO users (username, password)
        VALUES ($1, $2)
        RETURNING id
    `, ["testuser", "password"]);

        const userId = userResult.rows[0].id;

        let payload = {
            "title": "Good tweet",
            "tweet": "Good tweet 2",
        }

        await pg.query(`INSERT INTO tweets (title, tweet, user_id)
           VALUES ($1, $2, $3) `, [payload["title"], payload["tweet"], userId])

        const response = await agent
            .get("/api/get-tweets-from-cache").expect(200).then(res => {

                expect(res.body[0]["title"]).toBe(payload["title"])
                expect(res.body[0]["tweet"]).toBe(payload["tweet"])

            }
            )
    })

    test("pulls tweets from cache WITHOUT a login should display a 401 unauthorized error", async () => {

        const res = await request(app).get("/api/get-tweets-from-cache").expect(401)

    })


})

describe("session ID - test sessionID", () => {

    test("session id saved successfully in redis on user login ", async () => {

        const agent = request.agent(app)

        await agent.post("/api/register").send({ username: "hello", pwd: "test", firstName: "Jeet", lastName: "Tan" })

        const login = await agent.post("/api/login").send({ username: "hello", pwd: "test" })

        expect(login.status).toBe(200)

        const sessionCookie = login.headers["set-cookie"]?.find(cookie => cookie.startsWith("connect.sid="))
        expect(sessionCookie).toBeDefined()

        const encodedSession = sessionCookie.split(";")[0].split("=")[1]
        const sessionId = decodeURIComponent(encodedSession).slice(2).split(".")[0]

        expect(await client.exists(`sess:${sessionId}`)).toBe(1)

    })

    test("logout destroys session id in redis", async () => {

        const agent = request.agent(app)

        await agent.post("/api/register").send({ username: "hello", pwd: "test", firstName: "Jeet", lastName: "Tan" })

        const login = await agent.post("/api/login").send({ username: "hello", pwd: "test" })

        expect(login.status).toBe(200)

        const sessionCookie = login.headers["set-cookie"]?.find(cookie => cookie.startsWith("connect.sid="))
        expect(sessionCookie).toBeDefined()

        const encodedSession = sessionCookie.split(";")[0].split("=")[1]
        const sessionId = decodeURIComponent(encodedSession).slice(2).split(".")[0]

        const logout = await agent.get("/api/logout")

        expect(await client.exists(`sess:${sessionId}`)).toBe(0)
    })

    test("/profile returns the logged-in user", async () => {

        const agent = request.agent(app)

        await agent.post("/api/register").send({ username: "hello", pwd: "test", firstName: "Jeet", lastName: "Tan" })
        const login = await agent.post("/api/login").send({ username: "hello", pwd: "test" })

        expect(login.status).toBe(200)

        const profile = await agent.get("/api/profile")

        expect(profile.status).toBe(200)
        expect(profile.body).toEqual({
            loggedIn: true,
            user: { id: 1, username: "hello" }
        })
    })

})