const axios = require("axios");
const { log } = require("../middleware/utils.js");
const { dateTan } = require("datetan");
const redis = require("./redis");

const OSU_AUTH_URL = "https://osu.ppy.sh/oauth/token";
const OSU_API_BASE_URL = "https://osu.ppy.sh/api/v2";

const getOsuToken = async () => {
	const cachedToken = await redis.get("osuToken");

	if (cachedToken) {
		log(`[${dateTan(new Date(), "YYYY-MM-DD HH:mm:ss:ms Z", "en-us")}][CACHE] osuToken retrieved.`);
		return cachedToken;
	}

	log(`[${dateTan(new Date(), "YYYY-MM-DD HH:mm:ss:ms Z", "en-us")}][REQUEST] Fetching osuToken from osu! API.`);

	const res = await axios.post(OSU_AUTH_URL, {
		client_id: process.env.OSU_CLIENT_ID,
		client_secret: process.env.OSU_CLIENT_SECRET,
		grant_type: "client_credentials",
		scope: "public",
	});

	const token = res.data.access_token;
	await redis.set("osuToken", token, "EX", 3600);

	log(`[${dateTan(new Date(), "YYYY-MM-DD HH:mm:ss:ms Z", "en-us")}][CACHE] osuToken cached in Redis for 1 hour.`);

	return token;
};

const fetchUserData = async (username, token, playmode) => {
	const cacheKey = `user-${username}-${playmode}`;
	const cachedData = await redis.get(cacheKey);

	if (cachedData) {
		log(
			`[${dateTan(
				new Date(),
				"YYYY-MM-DD HH:mm:ss:ms Z",
				"en-us"
			)}][CACHE] User data for ${username} (playmode: ${playmode}) retrieved from Redis.`
		);
		return JSON.parse(cachedData);
	}

	log(
		`[${dateTan(
			new Date(),
			"YYYY-MM-DD HH:mm:ss:ms Z",
			"en-us"
		)}][REQUEST] Fetching user data for ${username} from API.`
	);

	const userRes = await axios.get(`${OSU_API_BASE_URL}/users/${username}`, {
		headers: { Authorization: `Bearer ${token}` },
	});

	const user = userRes.data;
	const inferredPlaymode = playmode || user.playmode || "osu";

	const statsRes = await axios.get(`${OSU_API_BASE_URL}/users/${username}/${inferredPlaymode}`, {
		headers: { Authorization: `Bearer ${token}` },
	});

	const result = { ...statsRes.data, playmode: inferredPlaymode };
	await redis.set(cacheKey, JSON.stringify(result), "EX", 300);

	log(
		`[${dateTan(
			new Date(),
			"YYYY-MM-DD HH:mm:ss:ms Z",
			"en-us"
		)}][CACHE] User data for ${username} (playmode: ${inferredPlaymode}) cached in Redis for 5 minutes.`
	);

	return result;
};

module.exports = {
	getOsuToken,
	fetchUserData,
	OSU_AUTH_URL,
	OSU_API_BASE_URL,
};
