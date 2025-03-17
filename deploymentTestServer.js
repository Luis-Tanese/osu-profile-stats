require("dotenv").config();
const express = require("express");
const axios = require("axios");
const path = require("path");
const nocache = require("nocache");
const renderCard = require("./middleware/cardRenderer.js");
const { log, renderErrorCard } = require("./middleware/utils.js");
const { dateTan } = require("datetan");
const cors = require("cors");

const app = express();
const OSU_AUTH_URL = "https://osu.ppy.sh/oauth/token";
const OSU_API_BASE_URL = "https://osu.ppy.sh/api/v2";

// simple metrics so you can test yo stuff
const metrics = {
    requests: 0,
    cardsRendered: 0,
    errors: 0,
    startTime: `${dateTan(new Date(), "YYYY-MM-DD HH:mm:ss:ms Z", "en-us")}`,
    origins: {},
};

app.use(
    cors({
        origin: "*",
        methods: ["GET"],
        allowedHeaders: ["Content-Type"],
    })
);

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

/**
 * Simple req tracking
 * Only tracks basic data since I won't make it super duper detailed like on production
 */
app.use((req, res, next) => {
    metrics.requests++;
    
    const referer = req.headers.referer || "direct";
    
    try {
        if (referer !== "direct") {
            const domain = new URL(referer).hostname;
            metrics.origins[domain] = (metrics.origins[domain] || 0) + 1;
        } else {
            metrics.origins["direct"] = (metrics.origins["direct"] || 0) + 1;
        }
    } catch (error) {
        metrics.origins["Unknown"] = (metrics.origins["Unknown"] || 0) + 1;
    }
    
    next();
});

const getOsuToken = async () => {
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

    return res.data.access_token;
};

const fetchUserData = async (username, token, playmode) => {
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

    return { ...statsRes.data, playmode: inferredPlaymode };
};

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/api/profile-stats/:username", async (req, res) => {
    try {
        const username = req.params.username;
        const { playmode, background, hex, version, height, supporter, team } =
            req.query;

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
            )}][RENDER] Rendering profile card for ${username}.`
        );

        metrics.cardsRendered++;

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
        metrics.errors++;

        log(
            `[${dateTan(
                new Date(),
                "YYYY-MM-DD HH:mm:ss:ms Z",
                "en-us"
            )}][ERROR] Internal Server Error for request: ${
                req.originalUrl
            }, Params for request: ${JSON.stringify(req.query)}`
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

// simple health endpoint so you can track with metrics
app.get("/api/health", (req, res) => {
    res.json({
        ok: true,
        uptime: process.uptime(),
        timestamp: `${dateTan(new Date(), "YYYY-MM-DD HH:mm:ss:ms Z", "en-us")}`,
        metrics: {
            info: "Basic usage statistics",
            requests: metrics.requests,
            cardsRendered: metrics.cardsRendered,
            errors: metrics.errors,
            requestsPerMinute: (metrics.requests / (process.uptime() / 60)).toFixed(2),
            origins: metrics.origins
        }
    });
});

// uncomment only for local testing (tip: select all and uncomment/comment with alt + shift + a ;) )
/* app.listen(3000, () => {
    log("Development server running on port 3000");
}); */

module.exports = app;
