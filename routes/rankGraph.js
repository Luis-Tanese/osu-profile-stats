const express = require("express");
const router = express.Router();
const { log } = require("../middleware/utils.js");
const { dateTan } = require("datetan");
const renderRankHistoryGraph = require("../middleware/renderRankGraph.js");
const { getOsuToken, fetchUserData } = require("../services/osuApi.js");
const { validateImageType } = require("../middleware/utils/validate.js");
const {
    processImageConversion,
    generateImageCacheKey,
} = require("../middleware/imageConverter.js");

router.get("/:username", async (req, res) => {
    try {
        const username = req.params.username;
        const { playmode, width = 800, height = 100, imageType } = req.query;

        if (!username) {
            return res.status(400).json({ error: "Username is required" });
        }

        let validatedImageType;
        try {
            validatedImageType = validateImageType(imageType);
        } catch (error) {
            return res.status(400).json({
                error: error.message,
                provided: imageType,
                supported: ["svg", "png", "jpg", "jpeg"],
            });
        }

        const token = await getOsuToken();
        if (!token) {
            return res.status(500).json({
                error: "Failed to auth with osu API",
            });
        }

        const userData = await fetchUserData(username, token, playmode);
        if (!userData) {
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

        if (validatedImageType !== "svg") {
            try {
                const cacheKey = generateImageCacheKey(
                    "rank-graph",
                    username,
                    { playmode, width, height },
                    validatedImageType
                );

                const conversionResult = await processImageConversion(
                    resizedSvg,
                    validatedImageType,
                    {
                        width: requestedWidth,
                        height: requestedHeight,
                        cacheKey,
                    }
                );

                res.setHeader("Content-Type", conversionResult.contentType);
                res.setHeader("Cache-Control", "public, max-age=300");

                if (conversionResult.fromCache) {
                    res.setHeader("X-Cache-Status", "HIT");
                } else {
                    res.setHeader("X-Cache-Status", "MISS");
                }

                if (conversionResult.fallback) {
                    res.setHeader("X-Conversion-Fallback", "true");
                    res.setHeader("X-Requested-Format", imageType);
                }

                res.send(conversionResult.data);
            } catch (conversionError) {
                log(
                    `[ERROR] Rank graph image conversion failed: ${conversionError.message}`
                );
                res.setHeader("Content-Type", "image/svg+xml");
                res.setHeader("Cache-Control", "public, max-age=300");
                res.setHeader("X-Conversion-Fallback", "true");
                res.setHeader("X-Requested-Format", imageType);
                res.send(resizedSvg);
            }
        } else {
            res.setHeader("Content-Type", "image/svg+xml");
            res.setHeader("Cache-Control", "public, max-age=300");
            res.send(resizedSvg);
        }
    } catch (error) {
        console.error(error);

        log(`[ERROR] Internal Server Error for request: ${req.originalUrl}`);

        res.status(500).json({ error: "Failed to generate rank graph" });
    }
});

module.exports = router;
