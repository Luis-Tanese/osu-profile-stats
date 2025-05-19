const Redis = require("ioredis");
const { log } = require("../middleware/utils.js");
const { dateTan } = require("datetan");

const redis = new Redis(process.env.REDIS_URL);

redis.on("connect", () => {
	log(`[${dateTan(new Date(), "YYYY-MM-DD HH:mm:ss:ms Z", "en-us")}][REDIS] Connected to Redis yippie!!! ＞︿＜`);
});

redis.on("error", (err) => {
	log(`[${dateTan(new Date(), "YYYY-MM-DD HH:mm:ss:ms Z", "en-us")}][REDIS] Error: ${err.message} :(`);
});

module.exports = redis;
