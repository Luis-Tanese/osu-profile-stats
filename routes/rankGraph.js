const express = require("express");
const router = express.Router();
const { log } = require("../middleware/utils.js");
const { dateTan } = require("datetan");
const renderRankHistoryGraph = require("../middleware/renderRankGraph.js");
const { getOsuToken, fetchUserData } = require("../services/osuApi.js");

router.get("/:username", async (req, res) => {
    try {
        const username = req.params.username;
        const { playmode, width = 800, height = 100 } = req.query;

        log(
            `[${dateTan(
                new Date(),
                "YYYY-MM-DD HH:mm:ss:ms Z",
                "en-us"
            )}][REQUEST] Rank graph request received for ${username} with playmode=${playmode}.`
        );

        if (!username) {
            log(
                `[${dateTan(
                    new Date(),
                    "YYYY-MM-DD HH:mm:ss:ms Z",
                    "en-us"
                )}][ERROR] Username is required.`
            );

            return res.status(400).json({ error: "Username is required" });
        }

        const token = await getOsuToken();
        if (!token) {
            log(
                `[${dateTan(
                    new Date(),
                    "YYYY-MM-DD HH:mm:ss:ms Z",
                    "en-us"
                )}][ERROR] Failed to auth with osu API.`
            );

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
            return res
                .status(404)
                .json({ error: `User "${username}" not found` });
        }

        const rankHistory = userData.rank_history;

        if (
            !rankHistory ||
            !rankHistory.data ||
            rankHistory.data.length === 0
        ) {
            return res
                .status(404)
                .json({ error: "No rank history data available" });
        }

        const graph = renderRankHistoryGraph(rankHistory);

        const requestedWidth = parseInt(width, 10);
        const requestedHeight = parseInt(height, 10);

        const resizedSvg = `
            <svg xmlns="http://www.w3.org/2000/svg" 
                 width="${requestedWidth}" 
                 height="${requestedHeight}" 
                 viewBox="0 0 800 100">
                ${graph}
            </svg>
        `;

        res.setHeader("Content-Type", "image/svg+xml");
        res.send(resizedSvg);

        log(
            `[${dateTan(
                new Date(),
                "YYYY-MM-DD HH:mm:ss:ms Z",
                "en-us"
            )}][RESPONSE] Rank graph for ${username} sent successfully ＞︿＜.`
        );
    } catch (error) {
        console.error(error);

        log(
            `[${dateTan(
                new Date(),
                "YYYY-MM-DD HH:mm:ss:ms Z",
                "en-us"
            )}][ERROR] Internal Server Error for request: ${
                req.originalUrl
            }, Params for request: ${JSON.stringify(req.query)}`
        );

        res.status(500).json({ error: "Failed to generate rank graph" });
    }
});

module.exports = router;
