require("dotenv").config();
const express = require("express");
const axios = require("axios");
const Redis = require("ioredis");
const path = require("path");
const nocache = require("nocache");
const renderCard = require("./middleware/cardRenderer.js");
const { log, renderErrorCard } = require("./middleware/utils.js");
const { dateTan } = require("datetan");

const app = express();
const redis = new Redis(process.env.REDIS_URL);
const OSU_AUTH_URL = "https://osu.ppy.sh/oauth/token";
const OSU_API_BASE_URL = "https://osu.ppy.sh/api/v2";

app.use(nocache());

app.use((req, res, next) => {
    res.setHeader(
        "Cache-Control",
        "no-store, no-cache, must-revalidate, proxy-revalidate"
    );
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    next();
});

app.use(
    express.static(path.join(__dirname, "public"), {
        setHeaders: (res) => {
            res.setHeader("Cache-Control", "no-store");
        },
    })
);

app.use(
    express.static(path.join(__dirname, "assets"), {
        setHeaders: (res) => {
            res.setHeader("Cache-Control", "no-store");
        },
    })
);

const getOsuToken = async () => {
    const cachedToken = await redis.get("osuToken");

    if (cachedToken) {
        log(
            `[${dateTan(
                new Date(),
                "YYYY-MM-DD HH:mm:ss:ms Z",
                "en-us"
            )}][CACHE] osuToken retrieved.`
        );
        return cachedToken;
    }

    log(
        `[${dateTan(
            new Date(),
            "YYYY-MM-DD HH:mm:ss:ms Z",
            "en-us"
        )}][REQUEST] Fetching osuToken from osu! API.`
    );

    const res = await axios.post(OSU_AUTH_URL, {
        client_id: process.env.OSU_CLIENT_ID,
        client_secret: process.env.OSU_CLIENT_SECRET,
        grant_type: "client_credentials",
        scope: "public",
    });

    const token = res.data.access_token;

    await redis.set("osuToken", token, "EX", 3600);

    log(
        `[${dateTan(
            new Date(),
            "YYYY-MM-DD HH:mm:ss:ms Z",
            "en-us"
        )}][CACHE] osuToken cached in Redis for 1 hour.`
    );

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
        //log(JSON.parse(cachedData));
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

    const statsRes = await axios.get(
        `${OSU_API_BASE_URL}/users/${username}/${inferredPlaymode}`,
        {
            headers: { Authorization: `Bearer ${token}` },
        }
    );

    const result = { ...statsRes.data, playmode: inferredPlaymode };

    await redis.set(cacheKey, JSON.stringify(result), "EX", 300);

    log(
        `[${dateTan(
            new Date(),
            "YYYY-MM-DD HH:mm:ss:ms Z",
            "en-us"
        )}][CACHE] User data for ${username} (playmode: ${inferredPlaymode}) cached in Redis for 5 minutes.`
    );
    //log(result);
    return result;
};

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/api/profile-stats/:username", async (req, res) => {
    try {
        const username = req.params.username;

        const { playmode, background, hex, version, height } = req.query;

        log(
            `[${dateTan(
                new Date(),
                "YYYY-MM-DD HH:mm:ss:ms Z",
                "en-us"
            )}][REQUEST] Profile stats request received for ${username} with playmode=${playmode} and background=${background}.`
        );

        const token = await getOsuToken();

        const userData = await fetchUserData(username, token, playmode);

        if (!userData) {
            log(
                `[${dateTan(
                    new Date(),
                    "YYYY-MM-DD HH:mm:ss:ms Z",
                    "en-us"
                )}][ERROR] User data for ${username} not found.`
            );
            return res.status(404).send("User not found");
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
            `[${dateTan(
                new Date(),
                "YYYY-MM-DD HH:mm:ss:ms Z",
                "en-us"
            )}][ERROR] Internal Server Error for request: ${
                req.originalUrl
            }, Params for request: ${req.query}`
        );

        let originalWidth, originalHeight;
        if (req.query.version === "full") {
            originalWidth = 400;
            originalHeight = 200;
        } else {
            originalWidth = 400;
            originalHeight = 120;
        }

        const requestedHeight =
            parseInt(req.query.height, 10) || originalHeight;
        const scaleFactor = requestedHeight / originalHeight;
        const resizedWidth = originalWidth * scaleFactor;

        const errorSvg = await renderErrorCard(requestedHeight, resizedWidth);

        res.setHeader("Content-Type", "image/svg+xml");
        res.status(500).send(errorSvg);
    }
});

/* app.listen(3000, () => {
    log("Server running");
}); */
module.exports = app;
