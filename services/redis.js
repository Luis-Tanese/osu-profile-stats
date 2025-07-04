const Redis = require("ioredis");
const { log } = require("../middleware/utils.js");
const { dateTan } = require("datetan");

let redis;
let isRedisConnected = false;

if (process.env.REDIS_URL) {
	redis = new Redis(process.env.REDIS_URL);

	redis.on("connect", () => {
		log(`[${dateTan(new Date(), "YYYY-MM-DD HH:mm:ss:ms Z", "en-us")}][REDIS] Connected to Redis yippie!!! ＞︿＜`);
		isRedisConnected = true;
	});

	redis.on("error", (err) => {
		log(
			`[${dateTan(new Date(), "YYYY-MM-DD HH:mm:ss:ms Z", "en-us")}][REDIS] Could not connect to Redis: ${
				err.message
			}. Running without cache.`
		);
		isRedisConnected = false;
	});
} else {
	log(
		`[${dateTan(
			new Date(),
			"YYYY-MM-DD HH:mm:ss:ms Z",
			"en-us"
		)}][REDIS] REDIS_URL not found. Running without cache.`
	);
}

module.exports = { redis, isRedisConnected };
