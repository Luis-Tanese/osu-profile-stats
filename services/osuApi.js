const axios = require("axios");
const { log } = require("../middleware/utils.js");
const { dateTan } = require("datetan");
const { redis, isRedisConnected } = require("./redis");

let inMemoryToken = null;
let tokenExpiryTime = null;
let isFetchingToken = false;
let tokenPromise = null;

const OSU_AUTH_URL = "https://osu.ppy.sh/oauth/token";
const OSU_API_BASE_URL = "https://osu.ppy.sh/api/v2";

const fetchNewToken = async () => {
	try {
		const res = await axios.post(OSU_AUTH_URL, {
			client_id: process.env.OSU_CLIENT_ID,
			client_secret: process.env.OSU_CLIENT_SECRET,
			grant_type: "client_credentials",
			scope: "public",
		});

		const token = res.data.access_token;
		const expiresIn = res.data.expires_in;

		inMemoryToken = token;
		tokenExpiryTime = Date.now() + (expiresIn - 300) * 1000;

		if (isRedisConnected) {
			await redis.set("osuToken", token, "EX", expiresIn);
		}

		return token;
	} catch (error) {
		console.error("Failed to fetch osu! API token:", error);
		throw new Error("Could not authenticate with osu! API.");
	}
};

const getOsuToken = async () => {
	if (inMemoryToken && Date.now() < tokenExpiryTime) {
		return inMemoryToken;
	}

	if (isFetchingToken) {
		return await tokenPromise;
	}
	try {
		isFetchingToken = true;

		if (isRedisConnected) {
			const redisToken = await redis.get("osuToken");
			if (redisToken) {
				inMemoryToken = redisToken;
				tokenExpiryTime = Date.now() + (3600 - 300) * 1000;
				return redisToken;
			}
		}

		tokenPromise = fetchNewToken();
		const token = await tokenPromise;
		return token;
	} finally {
		isFetchingToken = false;
		tokenPromise = null;
	}
};

const fetchUserData = async (username, token, playmode) => {
	const cacheKey = `user-${username}-${playmode}`;

	if (isRedisConnected) {
		const cachedData = await redis.get(cacheKey);
		if (cachedData) {
			return JSON.parse(cachedData);
		}
	}

	const userRes = await axios.get(`${OSU_API_BASE_URL}/users/${username}`, {
		headers: { Authorization: `Bearer ${token}` },
	});

	const user = userRes.data;
	const inferredPlaymode = playmode || user.playmode || "osu";

	const statsRes = await axios.get(`${OSU_API_BASE_URL}/users/${username}/${inferredPlaymode}`, {
		headers: { Authorization: `Bearer ${token}` },
	});

	const result = { ...statsRes.data, playmode: inferredPlaymode };

	if (isRedisConnected) {
		await redis.set(cacheKey, JSON.stringify(result), "EX", 300);
	}

	return result;
};

module.exports = {
	getOsuToken,
	fetchUserData,
	OSU_AUTH_URL,
	OSU_API_BASE_URL,
};
