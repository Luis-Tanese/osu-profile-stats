const renderRankHistoryGraph = require("../renderRankGraph.js");
const { formatNumber, getBackground, getColor, validateHex, getNameSpacing } = require("../utils");
const { getSillyImage, getSillyFont } = require("../utils/imageUtils.js");
const { BASE_URL } = require("../../config.js");

/**
 * Renders the old style profile card (full version with more details)
 * @param {Object} data - The player data from osu's API
 * @param {Object} options - Rendering options
 * @param {string} options.background - Background type or image
 * @param {string} options.hex - Hex color for color backgrounds
 * @param {string} options.supporter - Whether to show supporter badge
 * @param {string} options.team - Whether to show team flag
 * @returns {Promise<string>} - SVG markup for the old style profile card
 */
const renderFullCard = async (data, options = {}) => {
	const { background = null, hex = null, supporter, team } = options;
	const stats = data.statistics || {};
	const grades = ["SSH", "SS", "SH", "S", "A"];
	const gradeCounts = stats.grade_counts || {};
	const avatarUrl = data.avatar_url || "";
	const flagUrl = `https://osu.ppy.sh/images/flags/${data.country_code}.png`;
	const globalRank = stats.global_rank || "N/A";
	const countryRank = stats.country_rank || "N/A";
	const pp = stats.pp ? stats.pp.toFixed(0) : "N/A";
	const rankedScore = stats.ranked_score || "N/A";
	const accuracy = stats.hit_accuracy ? stats.hit_accuracy.toFixed(2) : "N/A";
	const playCount = stats.play_count || "N/A";
	const totalScore = stats.total_score || "N/A";
	const totalHits = stats.total_hits || "N/A";
	const maxCombo = stats.maximum_combo || "N/A";
	const replaysWatched = stats.replays_watched_by_others || "N/A";
	const playTime = Math.round((stats.play_time || 0) / 3600);
	const medals = data.user_achievements?.length || 0;
	const supporterLevel = data.support_level || 0;
	const rankHistory = data.rank_history || [];
	const teamData = data.team || {};

	const svgWidth = 400;
	const svgHeight = 200;

	const showSupporter = supporter !== "false" && supporterLevel > 0;
	const showTeam = team !== "false" && teamData?.flag_url;

	const playmode = data.playmode || "osu";
	const playmodeIconURL = `${BASE_URL}/assets/images/icons/mode-${playmode}.png`;
	const torusFontURL = `${BASE_URL}/assets/fonts/Torus-Regular.otf`;
	const supporterUrl = `${BASE_URL}/assets/images/icons/supporter_${supporterLevel}.svg`;
	const defaultCoverURL = `${BASE_URL}/assets/images/backgrounds/default.jpeg`;
	const playStyles = data.playstyle || [];

	const assetPromises = [
		getSillyImage(avatarUrl),
		getSillyImage(flagUrl),
		getSillyImage(playmodeIconURL),
		getSillyFont(torusFontURL),
		showTeam ? getSillyImage(teamData.flag_url) : Promise.resolve(null),
		showSupporter ? getSillyImage(supporterUrl) : Promise.resolve(null),
		!background ? getSillyImage(data.cover?.url || defaultCoverURL) : Promise.resolve(null),
		background ? getBackground(background, hex, svgWidth, svgHeight) : Promise.resolve(null),
	];

	grades.forEach((grade) => {
		assetPromises.push(getSillyImage(`${BASE_URL}/assets/images/grades/${grade}.svg`));
	});
	playStyles.forEach((style) => {
		assetPromises.push(getSillyImage(`${BASE_URL}/assets/images/icons/${style}.svg`));
	});

	const allAssets = await Promise.all(assetPromises);

	const [
		avatarDataURI,
		flagDataURI,
		playmodeIconDataURI,
		torusDataURI,
		teamFlagDataURI,
		supporterDataURI,
		coverImageDataURI,
		backgroundType,
	] = allAssets;

	const gradeIcons = {};
	grades.forEach((grade, index) => {
		gradeIcons[grade] = allAssets[8 + index];
	});
	const playStyleIcons = {};
	playStyles.forEach((style, index) => {
		playStyleIcons[style] = allAssets[8 + grades.length + index];
	});

	const finalBackground = background
		? backgroundType
		: `<image x="0" y="0" href="${coverImageDataURI}" width="${svgWidth}" height="${svgHeight}" preserveAspectRatio="xMidYMid slice" clip-path="url(#clip-rounded)" />`;

	const usernameX = 80;
	const usernameWidth = getNameSpacing(data.username.length, 0, data.username);
	const teamX = usernameX + usernameWidth;
	const teamWidth = 20;
	const supporterX = showTeam ? teamX + teamWidth + 5 : teamX;
	const rankGraphSVG = renderRankHistoryGraph(rankHistory);
	const rankGraphDataURI = `data:image/svg+xml;base64,${Buffer.from(rankGraphSVG).toString("base64")}`;

	const gradeIconHeight = 12;
	const gradeIconWidth = 24;
	const gradeSpacing = 5;
	const totalGradesWidth = grades.length * (gradeIconWidth + gradeSpacing) - gradeSpacing;
	const gradeStartX = svgWidth - totalGradesWidth - 15;
	const gradeStartY = 165;
	let gradeIconsRender = "";
	let currentX = gradeStartX;
	for (const grade of grades) {
		const gradeCount = gradeCounts[grade.toLowerCase()] || 0;
		gradeIconsRender += `
            <g transform="translate(${currentX}, ${gradeStartY})">
                <image href="${gradeIcons[grade]}" height="${gradeIconHeight}px" width="${gradeIconWidth}px" />
                <text x="${gradeIconWidth / 2}" y="${
			gradeIconHeight + 10
		}" class="medium text ans" text-anchor="middle">${gradeCount}</text>
            </g>`;
		currentX += gradeIconWidth + gradeSpacing;
	}

	const playStyleBoxX = 15;
	const playStyleBoxY = 100;
	const playStyleIconSize = 25;
	const playStylePadding = 7;
	let playStyleIconsRender = "";
	playStyles.forEach((style, index) => {
		const row = Math.floor(index / 2);
		const col = index % 2;
		const x = playStyleBoxX + col * (playStyleIconSize + playStylePadding);
		const y = playStyleBoxY + row * (playStyleIconSize + playStylePadding);
		playStyleIconsRender += `<image href="${playStyleIcons[style]}" x="${x}" y="${y}" width="${playStyleIconSize}" height="${playStyleIconSize}" />`;
	});

	const render = `
    <svg xmlns="http://www.w3.org/2000/svg" width="400" height="200">
    <defs>
        <clipPath id="clip-rounded">
            <rect width="${svgWidth}" height="${svgHeight}" rx="15" ry="15" />
        </clipPath>
        <clipPath id="clip-pfp">
            <rect x="15" y="15" width="50" height="50" rx="10" ry="10" />
        </clipPath>
        ${
			showTeam
				? `<clipPath id="clip-team-flag"><rect x="${teamX}" y="20" width="20" height="12" rx="3" ry="3" /></clipPath>`
				: ""
		}
    </defs>
    <style>
        @font-face {
            font-family: 'Torus';
            src: url('${torusDataURI}') format('opentype');
            font-display: block;
        }
        .text { fill:rgb(255, 255, 255); font-family: 'Torus', Arial, sans-serif; }
        .large { font-size: 12px; }
        .medium { font-size: 9px; }
        .small { font-size: 7px; }
        .ans { fill: rgb(247, 201, 221); }
    </style>
    ${finalBackground}
    <rect width="${svgWidth}" height="${svgHeight}" fill="rgba(0, 0, 0, 0.4)" clip-path="url(#clip-rounded)" />
    <image href="${avatarDataURI}" clip-path="url(#clip-pfp)" x="15" y="15" width="50" height="50" />
    <image class="flag" href="${playmodeIconDataURI}" x="300" y="15" width="40" height="25" />
    <image class="flag" href="${flagDataURI}" x="340" y="15" width="40" height="25" />

    <text x="${usernameX}" y="30" class="text large">${data.username}</text>
    ${
		showTeam
			? `<image href="${teamFlagDataURI}" height="12" x="${teamX}" y="20" preserveAspectRatio="xMidYMid meet" clip-path="url(#clip-team-flag)" />`
			: ""
	}
    ${showSupporter ? `<image href="${supporterDataURI}" height="12" x="${supporterX}" y="20" />` : ""}

    <text x="80" y="50" class="text medium">Global Rank</text>
    <text x="80" y="60" class="text medium ans">#${formatNumber(globalRank)}</text>

    <text x="160" y="50" class="text medium">Country Rank</text>
    <text x="160" y="60" class="text medium ans">#${formatNumber(countryRank)}</text>

    <image href="${rankGraphDataURI}" x="80" y="80" width="180" height="40" />

    <text x="290" y="65" class="text small">Ranked Score</text>
    <text x="290" y="75" class="text small ans">${formatNumber(rankedScore)}</text>
    <text x="290" y="90" class="text small">Accuracy</text>
    <text x="290" y="100" class="text small ans">${accuracy}%</text>
    <text x="290" y="115" class="text small">Play Count</text>
    <text x="290" y="125" class="text small ans">${formatNumber(playCount)}</text>
    <text x="290" y="140" class="text small">Total Score</text>
    <text x="290" y="150" class="text small ans">${formatNumber(totalScore)}</text>
    <text x="80" y="130" class="text small">Total Hits</text>
    <text x="80" y="140" class="text small ans">${formatNumber(totalHits)}</text>
    <text x="80" y="155" class="text small">Max Combo</text>
    <text x="80" y="165" class="text small ans">${formatNumber(maxCombo)}</text>
    <text x="80" y="180" class="text small">Replays Watched</text>
    <text x="80" y="190" class="text small ans">${formatNumber(replaysWatched)}</text>
    <text x="180" y="130" class="text small">Play Time</text>
    <text x="180" y="140" class="text small ans">${formatNumber(playTime)} hours</text>
    <text x="180" y="155" class="text small">Medals</text>
    <text x="180" y="165" class="text small ans">${formatNumber(medals)}</text>
    <text x="180" y="180" class="text small">Performance</text>
    <text x="180" y="190" class="text small ans">${formatNumber(pp)}pp</text>

    ${playStyleIconsRender}
    ${gradeIconsRender}
    </svg>
    `;

	return render;
};

module.exports = renderFullCard;
