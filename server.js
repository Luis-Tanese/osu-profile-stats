require("dotenv").config();
const express = require("express");
const axios = require("axios");
const Redis = require("ioredis");
const path = require("path");
const renderCard = require("./middleware/cardRenderer.js");
const { log } = require("./middleware/utils.js");
const { dateTan } = require("datetan");

const app = express();
const redis = new Redis(process.env.REDIS_URL);
const OSU_AUTH_URL = "https://osu.ppy.sh/oauth/token";
const OSU_API_BASE_URL = "https://osu.ppy.sh/api/v2";

app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "assets")));

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
    await redis.set(cacheKey, JSON.stringify(result), "EX", 1800);
    log(
        `[${dateTan(
            new Date(),
            "YYYY-MM-DD HH:mm:ss:ms Z",
            "en-us"
        )}][CACHE] User data for ${username} (playmode: ${inferredPlaymode}) cached in Redis for 30 minutes.`
    );
    return result;
};

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/api/profile-stats/:username", async (req, res) => {
    try {
        const username = req.params.username;
        const { playmode, background, hex } = req.query;
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
        const card = await renderCard(
            userData,
            background || undefined,
            hex || undefined
        );

        res.setHeader("Content-Type", "image/svg+xml");
        res.send(card);
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
        res.status(500).send("Internal Server Error");
    }
});

//app.listen(3000);
module.exports = app;