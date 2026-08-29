const redis = require('redis');

const redisUrl = process.env.REDIS_URL;

console.log('Initializing Redis client with URL:', redisUrl ? 'SET' : 'NOT SET');

if (!redisUrl) {
    console.error('ERROR: REDIS_URL is not set!');
}

const client = redis.createClient({
    url: redisUrl,
    socket: {
        reconnectStrategy: (retries) => {
            if (retries > 10) {
                console.error('Redis reconnection failed after 10 attempts');
                return new Error('Redis reconnection failed');
            }
            return retries * 100;
        }
    }
});

client.on('error', (err) => {
    console.error('Redis Client Error:', err);
});

client.on('connect', () => {
    console.log('Redis Client Connected');
});

client.on('reconnecting', () => {
    console.log('Redis Client Reconnecting');
});

client.connect().then(() => {
    console.log('Redis connected successfully');
}).catch((err) => {
    console.error('Failed to connect to Redis:', err.message);
});

module.exports = client;