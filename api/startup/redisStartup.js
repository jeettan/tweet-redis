const client = require('../config/redis.js')

async function connectToRedis() {

    client.on('error', err => console.log('Redis Client Error', err));

    await client.connect();
    await client.set('test', 'Redis works!');
    const result = await client.get('test');
    console.log(result)
}

module.exports = connectToRedis