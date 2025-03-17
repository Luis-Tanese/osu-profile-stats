require("dotenv").config();
const express = require("express");
const path = require("path");
const nocache = require("nocache");
const { log } = require("./middleware/utils.js");
const cors = require("cors");
const { metrics } = require("./services/metrics.js");

const mainRoute = require("./routes/main.js");
const profileStatsRoute = require("./routes/profileStats.js");
const userDataRoute = require("./routes/userData.js");
const rankGraphRoute = require("./routes/rankGraph.js");
const healthRoute = require("./routes/health.js");

const app = express();

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
 * Req tracking middleware
 * It just tracks what websites are using the API and which endpoints are being used.
 * This data is only used for understanding the usage patterns and improving code.
 * This helps me know which features are most valuable to users >.<
 */
app.use((req, res, next) => {
    req.startTime = Date.now();
    metrics.requests++;

    const referer = req.headers.referer || "direct";
    const requestPath = req.originalUrl;

    if (referer.includes("osu-profile-stats.vercel.app")) {
        metrics.origins["Own"] = (metrics.origins["Own"] || 0) + 1;
    } else {
        try {
            const domain = new URL(referer).hostname;
            metrics.origins[domain] = (metrics.origins[domain] || 0) + 1;

            if (!metrics.domainPaths) {
                metrics.domainPaths = {};
            }

            if (!metrics.domainPaths[domain]) {
                metrics.domainPaths[domain] = {};
            }

            const basePath = requestPath
                .split("?")[0]
                .split("/")
                .slice(0, 3)
                .join("/");
            metrics.domainPaths[domain][basePath] =
                (metrics.domainPaths[domain][basePath] || 0) + 1;
        } catch (error) {
            metrics.origins["Unknown"] = (metrics.origins["Unknown"] || 0) + 1;
        }
    }

    if (metrics.requestDetails) {
        delete metrics.requestDetails;
    }

    res.on("finish", () => {
        const duration = Date.now() - req.startTime;
        const path = req.originalUrl.split("?")[0];

        if (!metrics.responseTimes) {
            metrics.responseTimes = {
                avg: 0,
                count: 0,
                total: 0,
            };
        }

        metrics.responseTimes.count++;
        metrics.responseTimes.total += duration;
        metrics.responseTimes.avg =
            (metrics.responseTimes.total / metrics.responseTimes.count).toFixed(
                2
            ) + "ms";

        if (!metrics.pathPerformance) {
            metrics.pathPerformance = {};
        }

        if (!metrics.pathPerformance[path]) {
            metrics.pathPerformance[path] = {
                count: 0,
                total: 0,
                avg: 0,
                min: Number.MAX_VALUE,
                max: 0,
            };
        }

        metrics.pathPerformance[path].count++;
        metrics.pathPerformance[path].total += duration;
        metrics.pathPerformance[path].avg =
            (
                metrics.pathPerformance[path].total /
                metrics.pathPerformance[path].count
            ).toFixed(2) + "ms";
        metrics.pathPerformance[path].min = Math.min(
            metrics.pathPerformance[path].min,
            duration
        );
        metrics.pathPerformance[path].max = Math.max(
            metrics.pathPerformance[path].max,
            duration
        );
    });

    next();
});

app.use("/", mainRoute);
app.use("/api/profile-stats", profileStatsRoute);
app.use("/api/user-data", userDataRoute);
app.use("/api/rank-graph", rankGraphRoute);
app.use("/api/health", healthRoute);

// I was tired of commenting and uncommenting this bs.
if (process.env.NODE_ENV !== "production") {
    app.listen(3000, () => {
        log("Silly server running");
    });
} else {
    module.exports = app;
}
