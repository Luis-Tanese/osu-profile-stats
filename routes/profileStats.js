const express = require("express");
const router = express.Router();
const { renderCard } = require("../middleware/cardRenderer.js");
const { log } = require("../middleware/utils.js");
const { renderErrorCard } = require("../middleware/cardRenderer.js");
const { dateTan } = require("datetan");
const { getOsuToken, fetchUserData } = require("../services/osuApi.js");
const { validateImageType } = require("../middleware/utils/validate.js");
const {
    processImageConversion,
    generateImageCacheKey,
} = require("../middleware/imageConverter.js");

const MIN_HEIGHT = 30;
const MAX_HEIGHT = 1000;
const DEFAULT_MINI_HEIGHT = 120;
const DEFAULT_FULL_HEIGHT = 200;
const MAX_USERNAME_LENGTH = 30;

const getRequestSource = (req) => {
    const referer = req.headers.referer || "direct";
    if (referer === "direct") return "Direct";

    try {
        if (referer.includes("osu-profile-stats.vercel.app")) {
            return "Internal (Editor)";
        }
        return new URL(referer).hostname;
    } catch (error) {
        return "Unknown";
    }
};

router.get("/:username", async (req, res) => {
    try {
        const { username } = req.params;
        let {
            playmode,
            background,
            hex,
            version,
            height,
            supporter,
            team,
            imageType,
        } = req.query;

        const source = getRequestSource(req);

        log(`[REQUEST] Profile stats for "${username}". Source: ${source}.`);

        let validatedImageType;
        try {
            validatedImageType = validateImageType(imageType);
        } catch (error) {
            const errorCard = await renderErrorCard(
                DEFAULT_MINI_HEIGHT,
                400,
                error.message
            );
            res.setHeader("Content-Type", "image/svg+xml");
            return res.status(400).send(errorCard);
        }

        if (!username || username.trim() === "") {
            const errorCard = await renderErrorCard(
                DEFAULT_MINI_HEIGHT,
                400,
                "Username is required"
            );
            res.setHeader("Content-Type", "image/svg+xml");
            return res.status(400).send(errorCard);
        }

        if (username.length > MAX_USERNAME_LENGTH) {
            const errorCard = await renderErrorCard(
                DEFAULT_MINI_HEIGHT,
                400,
                "Username is too long"
            );
            res.setHeader("Content-Type", "image/svg+xml");
            return res.status(400).send(errorCard);
        }

        const validVersions = ["mini", "full"];
        version = validVersions.includes(version) ? version : "mini";

        let defaultHeight;
        switch (version) {
            case "full":
                defaultHeight = DEFAULT_FULL_HEIGHT;
                break;
            default:
                defaultHeight = DEFAULT_MINI_HEIGHT;
        }

        let requestedHeight = parseInt(height, 10);

        if (
            isNaN(requestedHeight) ||
            requestedHeight < MIN_HEIGHT ||
            requestedHeight > MAX_HEIGHT
        ) {
            requestedHeight = defaultHeight;
        }

        const token = await getOsuToken();
        let userData;
        try {
            userData = await fetchUserData(username, token, playmode);
        } catch (fetchError) {
            const isUserNotFound = fetchError.response?.status === 404;
            const errorMessage = isUserNotFound
                ? `User "${username}" not found`
                : "Failed to fetch osu! data";
            const statusCode = isUserNotFound ? 404 : 500;

            log(`[ERROR] ${errorMessage}. Status: ${statusCode}`);
            const errorCard = await renderErrorCard(
                requestedHeight,
                400 * (requestedHeight / defaultHeight),
                errorMessage
            );

            res.setHeader("Content-Type", "image/svg+xml");
            if (validatedImageType !== "svg") {
                res.setHeader("X-Requested-Format", imageType);
                res.setHeader("X-Error-Fallback", "true");
            }
            return res.status(statusCode).send(errorCard);
        }

        const cardOptions = {
            background: background || undefined,
            hex: hex || undefined,
            version: version,
            supporter: supporter,
            team: team,
        };

        const cardSvgString = await renderCard(userData, cardOptions);

        const originalWidth = 400;
        let originalHeight;
        switch (version) {
            case "full":
                originalHeight = DEFAULT_FULL_HEIGHT;
                break;
            default:
                originalHeight = DEFAULT_MINI_HEIGHT;
        }
        const scaleFactor = requestedHeight / originalHeight;
        const resizedWidth = originalWidth * scaleFactor;

        const finalSvg = `
			<!-- Card Generated by https://osu-profile-stats.vercel.app -->
    		<!-- Made with ♥ by Tanese -->
            <svg xmlns="http://www.w3.org/2000/svg" 
                width="${resizedWidth}" 
                height="${requestedHeight}" 
                viewBox="0 0 ${originalWidth} ${originalHeight}">
                ${cardSvgString}
            </svg>
        `;

        if (validatedImageType !== "svg") {
            try {
                const cacheKey = generateImageCacheKey(
                    "profile-stats",
                    username,
                    {
                        playmode,
                        background,
                        hex,
                        version,
                        height,
                        supporter,
                        team,
                    },
                    validatedImageType
                );

                const conversionResult = await processImageConversion(
                    finalSvg,
                    validatedImageType,
                    {
                        width: Math.round(resizedWidth),
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
                    `[ERROR] Image conversion failed: ${conversionError.message}`
                );
                res.setHeader("Content-Type", "image/svg+xml");
                res.setHeader("Cache-Control", "public, max-age=300");
                res.setHeader("X-Conversion-Fallback", "true");
                res.setHeader("X-Requested-Format", imageType);
                res.send(finalSvg);
            }
        } else {
            res.setHeader("Content-Type", "image/svg+xml");
            res.setHeader("Cache-Control", "public, max-age=300");
            res.send(finalSvg);
        }
    } catch (error) {
        console.error(
            "An unexpected error occurred in /profile-stats route:",
            error
        );
        log(
            `[FATAL ERROR] Internal Server Error for request: ${req.originalUrl}. Error: ${error.message}`
        );

        const requestedHeight =
            parseInt(req.query.height, 10) || DEFAULT_MINI_HEIGHT;
        const requestedImageType = req.query.imageType;
        const errorCard = await renderErrorCard(
            requestedHeight,
            400 * (requestedHeight / DEFAULT_MINI_HEIGHT),
            "An unexpected error occurred"
        );

        res.setHeader("Content-Type", "image/svg+xml");
        if (requestedImageType && requestedImageType !== "svg") {
            res.setHeader("X-Requested-Format", requestedImageType);
            res.setHeader("X-Error-Fallback", "true");
        }
        res.status(500).send(errorCard);
    }
});

module.exports = router;
