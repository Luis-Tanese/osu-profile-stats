const express = require("express");
const router = express.Router();
const { dateTan } = require("datetan");
const { metrics } = require("../services/metrics.js");
const redis = require("../services/redis");
const { getOsuToken } = require("../services/osuApi.js");

router.get("/", async (req, res) => {
    const redisStatus = redis.status === "ready";

    let osuStatus = false;
    try {
        const token = await getOsuToken();
        osuStatus = !!token;
    } catch (error) {
        osuStatus = false;
    }

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
            info: "Aggregated usage stats showing API usage and reliability. Tracks which features people find most useful, without collecting personal data.",
            requests: metrics.requests,
            cardsRendered: metrics.cardsRendered,
            errors: metrics.errors,
            requestsPerMinute: (
                metrics.requests /
                (process.uptime() / 60)
            ).toFixed(2),
            responseTimes: metrics.responseTimes || "No response time data yet",
            pathPerformance:
                metrics.pathPerformance || "No path performance data yet",
            origins: metrics.origins,
        },
        services: {
            redis: redisStatus,
            osu: osuStatus,
        },
        memory: {
            rss: `${(process.memoryUsage().rss / 1024 / 1024).toFixed(2)} MB`,
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

module.exports = router;
