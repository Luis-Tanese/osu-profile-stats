const express = require("express");
const router = express.Router();
const path = require("path");

router.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});

router.get("/editor", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "public", "editor.html"));
});

router.get("/api", (req, res) => {
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
                    height: "Custom height for the card",
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

module.exports = router;
