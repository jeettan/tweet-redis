const redis = require('redis');

const { REDISURL } = process.env

const client = redis.createClient({
    url: process.env.REDIS_URL
})

module.exports = client