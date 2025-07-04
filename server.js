require("dotenv").config();
const express = require("express");
const path = require("path");
const { log } = require("./middleware/utils.js");
const cors = require("cors");

const mainRoute = require("./routes/main.js");
const profileStatsRoute = require("./routes/profileStats.js");
const userDataRoute = require("./routes/userData.js");
const rankGraphRoute = require("./routes/rankGraph.js");

const app = express();

app.use(
	cors({
		origin: "*",
		methods: ["GET"],
		allowedHeaders: ["Content-Type"],
	})
);

app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "assets")));

/* Removed the health thingy because it was useless since I'm running this project on vercel */

app.use("/", mainRoute);
app.use("/api/profile-stats", profileStatsRoute);
app.use("/api/user-data", userDataRoute);
app.use("/api/rank-graph", rankGraphRoute);

// I was tired of commenting and uncommenting this bs.
if (process.env.NODE_ENV !== "production") {
	app.listen(3000, () => {
		log("Silly server running @ http://localhost:3000");
	});
} else {
	module.exports = app;
}
