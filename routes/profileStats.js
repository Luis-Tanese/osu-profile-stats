const express = require("express");
const router = express.Router();
const { renderCard } = require("../middleware/cardRenderer.js");
const { log } = require("../middleware/utils.js");
const { renderErrorCard } = require("../middleware/cardRenderer.js");
const { dateTan } = require("datetan");
const { getOsuToken, fetchUserData } = require("../services/osuApi.js");

router.get("/:username", async (req, res) => {
	try {
		const username = req.params.username;
		const { playmode, background, hex, version, height, supporter, team } = req.query;

		const referer = req.headers.referer || "direct";
		let source = "Unknown";

		if (referer.includes("osu-pofile-stats.vercel.app")) {
			source = "own";
		} else {
			try {
				source = new URL(referer).hostname;
			} catch (error) {
				source = "Unknown";
			}
		}

		log(
			`[${dateTan(
				new Date(),
				"YYYY-MM-DD HH:mm:ss:ms Z",
				"en-us"
			)}][REQUEST] Profile stats request received for ${username} with playmode=${playmode} and background=${background}. Source: ${source}.`
		);

		if (!username) {
			const errorCard = await renderErrorCard(120, 400, "Username is required");
			res.setHeader("Content-Type", "image/svg+xml");
			return res.status(400).send(errorCard);
		}

		const token = await getOsuToken();
		if (!token) {
			log(`[${dateTan(new Date(), "YYYY-MM-DD HH:mm:ss:ms Z", "en-us")}][ERROR] Failed to auth with osu API.`);
			const errorCard = await renderErrorCard(120, 400, "Failed to auth with osu API");
			res.setHeader("Content-Type", "image/svg+xml");
			return res.status(500).send(errorCard);
		}

		let userData;
		try {
			userData = await fetchUserData(username, token, playmode);
			if (!userData) {
				log(
					`[${dateTan(
						new Date(),
						"YYYY-MM-DD HH:mm:ss:ms Z",
						"en-us"
					)}][ERROR] User data for ${username} not found.`
				);
				const errorCard = await renderErrorCard(120, 400, `User "${username}" not found`);
				res.setHeader("Content-Type", "image/svg+xml");
				return res.status(404).send(errorCard);
			}
		} catch (fetchError) {
			const errorMessage =
				fetchError.response?.status === 404
					? `User "${username}" not found`
					: `Failed to fetch data for user "${username}"`;

			log(`[${dateTan(new Date(), "YYYY-MM-DD HH:mm:ss:ms Z", "en-us")}][ERROR] ${errorMessage}`);

			const errorCard = await renderErrorCard(120, 400, errorMessage);
			res.setHeader("Content-Type", "image/svg+xml");
			return res.status(fetchError.response?.status || 500).send(errorCard);
		}

		log(
			`[${dateTan(
				new Date(),
				"YYYY-MM-DD HH:mm:ss:ms Z",
				"en-us"
			)}][RENDER] Rendering silly profile card for ${username}.`
		);

		const card = await renderCard(userData, {
			background: background || undefined,
			hex: hex || undefined,
			version: version || "new",
			supporter: supporter,
			team: team,
		});

		let originalWidth, originalHeight;

		if (version === "full") {
			originalWidth = 400;
			originalHeight = 200;
		} else {
			originalWidth = 400;
			originalHeight = 120;
		}

		const requestedHeight = parseInt(height, 10) || originalHeight;
		const scaleFactor = requestedHeight / originalHeight;
		const resizedWidth = originalWidth * scaleFactor;

		const resizedSvg = `
            <svg xmlns="http://www.w3.org/2000/svg" 
                 width="${resizedWidth}" 
                 height="${requestedHeight}" 
                 viewBox="0 0 ${originalWidth} ${originalHeight}">
                ${card}
            </svg>
        `;

		res.setHeader("Content-Type", "image/svg+xml");
		res.send(resizedSvg);

		log(
			`[${dateTan(
				new Date(),
				"YYYY-MM-DD HH:mm:ss:ms Z",
				"en-us"
			)}][RESPONSE] Profile card for ${username} sent successfully ＞︿＜.`
		);
	} catch (error) {
		console.error(error);

		log(
			`[${dateTan(new Date(), "YYYY-MM-DD HH:mm:ss:ms Z", "en-us")}][ERROR] Internal Server Error for request: ${
				req.originalUrl
			}, Params for request: ${JSON.stringify(req.query)}`
		);

		let originalWidth = 400;
		let originalHeight = req.query.version === "full" ? 200 : 120;
		const requestedHeight = parseInt(req.query.height, 10) || originalHeight;
		const scaleFactor = requestedHeight / originalHeight;
		const resizedWidth = originalWidth * scaleFactor;

		const errorMessage = error.message || "An unexpected error occurred";
		const errorCard = await renderErrorCard(requestedHeight, resizedWidth, errorMessage);

		res.setHeader("Content-Type", "image/svg+xml");
		res.status(500).send(errorCard);
	}
});

module.exports = router;
