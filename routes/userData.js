const express = require("express");
const router = express.Router();
const { log } = require("../middleware/utils.js");
const { dateTan } = require("datetan");
const { getOsuToken, fetchUserData } = require("../services/osuApi.js");

router.get("/:username", async (req, res) => {
	try {
		const username = req.params.username;
		const { playmode } = req.query;

		log(
			`${dateTan(
				new Date(),
				"YYYY-MM-DD HH:mm:ss:ms Z",
				"en-us"
			)} [REQUEST] User data request received for ${username} with playmode=${playmode}.`
		);

		if (!username) {
			log(`[${dateTan(new Date(), "YYYY-MM-DD HH:mm:ss:ms Z", "en-us")}][ERROR] Username is required.`);

			return res.status(400).json({ error: "Username is required" });
		}

		const token = await getOsuToken();
		if (!token) {
			log(`[${dateTan(new Date(), "YYYY-MM-DD HH:mm:ss:ms Z", "en-us")}][ERROR] Failed to auth with osu API.`);

			return res.status(500).json({
				error: "Failed to auth with osu API",
			});
		}

		const userData = await fetchUserData(username, token, playmode);
		if (!userData) {
			log(
				`[${dateTan(
					new Date(),
					"YYYY-MM-DD HH:mm:ss:ms Z",
					"en-us"
				)}][ERROR] User data for ${username} not found.`
			);
			return res.status(404).json({ error: `User "${username}" not found` });
		}

		log(
			`[${dateTan(
				new Date(),
				"YYYY-MM-DD HH:mm:ss:ms Z",
				"en-us"
			)}][RESPONSE] User data for ${username} sent successfully ＞︿＜.`
		);

		res.json(userData);
	} catch (error) {
		console.error(error);

		log(
			`[${dateTan(new Date(), "YYYY-MM-DD HH:mm:ss:ms Z", "en-us")}][ERROR] Internal Server Error for request: ${
				req.originalUrl
			}, Params for request: ${JSON.stringify(req.query)}`
		);

		res.status(500).json({
			error: "An unexpected error occurred",
		});
	}
});

module.exports = router;
