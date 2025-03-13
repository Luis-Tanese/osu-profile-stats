require("dotenv").config();
const express = require("express");
const axios = require("axios");
const Redis = require("ioredis");
const path = require("path");
const nocache = require("nocache");
const renderCard = require("./middleware/cardRenderer.js");
const { log, renderErrorCard } = require("./middleware/utils.js");
const { dateTan } = require("datetan");
const cors = require("cors");
const renderRankHistoryGraph = require("./middleware/renderRankGraph.js");
const { resourceUsage } = require("process");

const app = express();
const redis = new Redis(process.env.REDIS_URL);
const OSU_AUTH_URL = "https://osu.ppy.sh/oauth/token";
const OSU_API_BASE_URL = "https://osu.ppy.sh/api/v2";

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

const metrics = {
    requests: 0,
    cardsRendered: 0,
    errors: 0,
    startTime: `${dateTan(new Date(), "YYYY-MM-DD HH:mm:ss:ms Z", "en-us")}`,
};

app.use((req, res, next) => {
    metrics.requests++;
    next();
});

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/api", (req, res) => {
    res.json({
        message: "Welcome to the silly api, here is some info:",
        endpoints: {
            profileStats: {
                url: "/api/profile-stats/:username",
                method: "GET",
                info: "Gets profile stats",
                params: {
                    username: "The osu username (required)",
                    playmode:
                        "The playmode (osu, taiko, catch, mania), if it's empty, it will be inferred from the default game mode from the user's profile.",
                    background:
                        "Background type (default, bg1, bg2, bg3, bg4, bg5 or color)",
                    hex: "Hex color code when background=color",
                    version: "Version of the card (new or full)",
                    height: "Custom height for teh card",
                    supporter: "Show supporter tag (true or false)",
                    team: "Show team flag (true or false)",
                },
                example:
                    "/api/profile-stats/tanese?playmode=mania&background=bg4&version=new",
            },
            userData: {
                url: "/api/user-data/:username",
                method: "GET",
                info: "Gets user data",
                params: {
                    username: "The osu username (required)",
                    playmode:
                        "The playmode (osu, taiko, catch, mania), if it's empty, it will be inferred from the default game mode from the user's profile.",
                },
                example: "/api/user-data/tanese?playmode=mania",
            },
            rankGraph: {
                url: "/api/rank-graph/:username",
                method: "GET",
                info: "Gets a SVG graph of a user's rank history",
                params: {
                    username: "The osu username (required)",
                    playmode:
                        "The playmode (osu, taiko, catch, mania), if it's empty, it will be inferred from the default game mode from the user's profile.",
                    width: "Width of the graph in pixels, defaults to 800",
                    height: "Height of the graph in pixels, defaults to 100",
                },
                example:
                    "/api/rank-graph/tanese?playmode=mania&width=800&height=100",
            },
            api: {
                url: "/api",
                method: "GET",
                info: "Gets info about the api",
            },
            health: {
                url: "/health",
                method: "GET",
                info: "Gets health of the api",
            },
        },
        repository: "https://github.com/Luis-Tanese/osu-profile-stats",
    });
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

        if (!username) {
            const errorCard = await renderErrorCard(
                120,
                400,
                "Username is required"
            );
            res.setHeader("Content-Type", "image/svg+xml");
            return res.status(400).send(errorCard);
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
            const errorCard = await renderErrorCard(
                120,
                400,
                "Failed to auth with osu API"
            );
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
                const errorCard = await renderErrorCard(
                    120,
                    400,
                    `User "${username}" not found`
                );
                res.setHeader("Content-Type", "image/svg+xml");
                return res.status(404).send(errorCard);
            }
        } catch (fetchError) {
            const errorMessage =
                fetchError.response?.status === 404
                    ? `User "${username}" not found`
                    : `Failed to fetch data for user "${username}"`;

            log(
                `[${dateTan(
                    new Date(),
                    "YYYY-MM-DD HH:mm:ss:ms Z",
                    "en-us"
                )}][ERROR] ${errorMessage}`
            );

            const errorCard = await renderErrorCard(120, 400, errorMessage);
            res.setHeader("Content-Type", "image/svg+xml");
            return res
                .status(fetchError.response?.status || 500)
                .send(errorCard);
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
        metrics.cardsRendered++;

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

        let originalWidth = 400;
        let originalHeight = req.query.version === "full" ? 200 : 120;
        const requestedHeight =
            parseInt(req.query.height, 10) || originalHeight;
        const scaleFactor = requestedHeight / originalHeight;
        const resizedWidth = originalWidth * scaleFactor;

        const errorMessage = error.message || "An unexpected error occurred";
        const errorCard = await renderErrorCard(
            requestedHeight,
            resizedWidth,
            errorMessage
        );

        res.setHeader("Content-Type", "image/svg+xml");
        res.status(500).send(errorCard);
    }
});

app.get("/api/user-data/:username", async (req, res) => {
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

        res.status(500).json({
            error: "An unexpected error occurred",
        });
    }
});

app.get("/api/rank-graph/:username", async (req, res) => {
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

        res.status(500).json({ error: "Failed to generate rank graph" });
    }
});

app.get("/health", (req, res) => {
    const redisStatus = redis.status === "ready";

    const osuStatus = async () => {
        try {
            const token = await getOsuToken();
            return !!token;
        } catch (error) {
            return false;
        }
    };

    const isHealthy = redisStatus;

    res.status(isHealthy ? 200 : 503).json({
        ok: isHealthy,
        uptime: process.uptime(),
        timestamp: `${dateTan(
            new Date(),
            "YYYY-MM-DD HH:mm:ss:ms Z",
            "en-us"
        )}`,
        metrics: {
            requests: metrics.requests,
            cardsRendered: metrics.cardsRendered,
            errors: metrics.errors,
            requestsPerMinute: (
                metrics.requests /
                (process.uptime() / 60)
            ).toFixed(2),
        },
        services: {
            redis: redisStatus,
            osu: osuStatus(),
        },
        memory: {
            rss: `${(process.memoryUsage().rss / 1024 / 1024).toFixed(2)} MB}`,
            heapTotal: `${(
                process.memoryUsage().heapTotal /
                1024 /
                1024
            ).toFixed(2)} MB`,
            heapUsed: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(
                2
            )} MB`,
            external: `${(process.memoryUsage().external / 1024 / 1024).toFixed(
                2
            )} MB`,
        },
    });
});

/* app.listen(3000, () => {
    log("Server running");
}); */

module.exports = app;
