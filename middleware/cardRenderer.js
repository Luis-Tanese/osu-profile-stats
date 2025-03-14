const renderRankHistoryGraph = require("./renderRankGraph.js");
const {
    log,
    formatNumber,
    getBackground,
    getSillyImage,
    getSillyFont,
    getColor,
    validateHex,
    getNameSpacing,
    getSupporterSpacingFlag,
} = require("./utils.js");

/**
 * Main function to render a player's profile card
 * @param {Object} data - The player data from osu's API
 * @param {Object} options - Rendering options
 * @param {string} options.version - Card version ('full' for old style, anything else for new style)
 * @param {string} options.background - Background type
 * @param {string} options.hex - Hex color for color backgrounds
 * @param {string} options.supporter - Whether to show supporter tag
 * @param {string} options.team - Whether to show team flag
 * @returns {Promise<string>} - SVG markup for the profile card
 */
const renderCard = async (data, options = {}) => {
    const { version } = options;

    try {
        if (version === "full") {
            return await renderOldCard(data, options);
        } else {
            return await renderNewCard(data, options);
        }
    } catch (error) {
        console.error("Error rendering card:", error);
        throw new Error(
            "Failed to render card. Check the console for details."
        );
    }
};

/**
 * New render because old one was ugly, but you can still call it by making the version=full request in link (compact version)
 * @param {Object} data - The player data from osu's API
 * @param {Object} options - Rendering options
 * @param {string} options.background - Background type or image
 * @param {string} options.hex - Hex color for color backgrounds
 * @param {string} options.supporter - Whether to show supporter tag
 * @param {string} options.team - Whether to show team flag
 * @returns {Promise<string>} - SVG markup for the card
 */
const renderNewCard = async (data, options = {}) => {
    const { background = null, hex = null, supporter, team } = options;
    const username = data.username || "Silly";
    const stats = data.statistics || {};
    const avatarUrl = data.avatar_url || "";
    const flagUrl = `https://osu.ppy.sh/images/flags/${data.country_code}.png`;
    const globalRank = stats.global_rank || "N/A";
    const countryRank = stats.country_rank || "N/A";
    const pp = stats.pp.toFixed(0) || "N/A";
    const accuracy = stats.hit_accuracy?.toFixed(2) || "N/A";
    const level = stats.level?.current || "N/A";
    const playmode = data.playmode || "osu";
    const playCount = stats.play_count || "N/A";
    const supporterLevel = data.support_level || 0;
    const rankHistory = data.rank_history || [];
    const teamData = data.team;

    const svgWidth = 400;
    const svgHeight = 120;

    let backgroundType;
    if (!background) {
        const bgURI = await getSillyImage(
            data.cover?.url ||
                "https://osu-profile-stats.vercel.app/assets/images/backgrounds/default.jpeg"
        );
        backgroundType = `<image x="0" y="0" href="${bgURI}" width="${svgWidth}" height="${svgHeight}" preserveAspectRatio="xMidYMid slice" clip-path="url(#clip-rounded)" />`;
    } else if (background === "color") {
        if (hex) validateHex(hex);
        backgroundType = getColor(hex, svgWidth, svgHeight);
    } else {
        backgroundType = await getBackground(
            background,
            hex,
            svgWidth,
            svgHeight
        );
    }

    const avatarDataURI = avatarUrl ? await getSillyImage(avatarUrl) : "";

    const flagDataURI = await getSillyImage(flagUrl);
    const playmodeIconURL = `https://osu-profile-stats.vercel.app/assets/images/icons/mode-${playmode}.png`;
    const playmodeIconDataURI = await getSillyImage(playmodeIconURL);
    const torusDataURI = await getSillyFont(
        "https://osu-profile-stats.vercel.app/assets/fonts/Torus-Regular.otf"
    );

    const showSupporter = supporter !== "false" && supporterLevel > 0;
    const showTeam = team !== "false" && teamData?.flag_url;

    let teamFlagDataURI = null;
    if (showTeam) {
        teamFlagDataURI = await getSillyImage(teamData.flag_url);
    }

    const supporterUrl = `https://osu-profile-stats.vercel.app/assets/images/icons/supporter_${supporterLevel}.svg`;
    const supporterDataURI = await getSillyImage(supporterUrl);

    const usernameX = 120;
    const usernameWidth = getNameSpacing(username.length, 0, username);

    const teamX = usernameX + usernameWidth;
    const teamWidth = 25;

    const supporterX = showTeam ? teamX + teamWidth + 5 : teamX;

    /* const supporterX =
        120 + getNameSpacing(username.length, supporterLevel, username);

    const teamX = showSupporter
        ? supporterX + getSupporterSpacingFlag(supporterLevel)
        : 120 + getNameSpacing(username.length, supporterLevel, username); */

    const rankGraphSVG = renderRankHistoryGraph(rankHistory);
    const rankGraphDataURI = `data:image/svg+xml;base64,${Buffer.from(
        rankGraphSVG
    ).toString("base64")}`;

    const render = `
    <!-- Card Generated by https://osu-profile-stats.vercel.app -->
    <!-- Made with ♥ by Tanese -->
    <svg xmlns="http://www.w3.org/2000/svg" width="${svgWidth}" height="${svgHeight}">
    <defs>
        <clipPath id="clip-rounded">
            <rect width="${svgWidth}" height="${svgHeight}" rx="15" ry="15" />
        </clipPath>
        <clipPath id="clip-pfp">
            <rect x="10" y="10" width="100" height="100" rx="10" ry="10" />
        </clipPath>
        ${
            showTeam
                ? `
            <clipPath id="clip-team-flag">
                <rect x="${teamX}" y="17" width="25" height="15" rx="3" ry="3" />
            </clipPath>
            `
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
        .massive { font-size: 17px; }
        .large { font-size: 13px; }
        .medium { font-size: 9px; }
        .small { font-size: 7px; }
        .ans { fill: rgb(247, 201, 221); }
    </style>
    ${backgroundType}
    <rect x="0" y="70" width="${svgWidth}" height="${
        svgHeight - 70
    }" fill="rgba(10, 10, 29, 0.7)" clip-path="url(#clip-rounded)" />
    <rect width="${svgWidth}" height="${svgHeight}" fill="rgba(0, 0, 0, 0.4)" clip-path="url(#clip-rounded)" />

    <image href="${avatarDataURI}" clip-path="url(#clip-pfp)" x="10" y="10" width="100" height="100" />

    <text x="${usernameX}" y="30" class="text massive">${username}</text>
    ${
        showTeam
            ? `
        <image href="${teamFlagDataURI}" height="15" x="${teamX}" y="17" preserveAspectRatio="xMidYMid meet" clip-path="url(#clip-team-flag)" />
        `
            : ""
    }

    ${
        showSupporter
            ? `
        <image href="${supporterDataURI}" height="15" x="${supporterX}" y="17" />
        `
            : ""
    }

    <image href="${flagDataURI}" x="360" y="20" width="25" height="20" />
    <text x="${
        360 - (countryRank.toString().length * 8 + 5)
    }" y="32.5" class="text medium">#${formatNumber(countryRank)}</text>

    <image href="${playmodeIconDataURI}" x="360" y="50" width="25" height="20" />
    <text x="${
        360 - (level.toString().length * 8 + 8)
    }" y="62.5" class="text medium">Lv.${level}</text>

    <image href="${rankGraphDataURI}" x="120" y="40" height="24" width="190" />

    <line x1="120" y1="75" x2="180" y2="75" stroke="purple" stroke-width="2" />
    <text x="120" y="90" class="text medium">Ranking</text>
    <text x="120" y="105" class="text large">#${formatNumber(globalRank)}</text>

    <line x1="200" y1="85" x2="230" y2="85" stroke="red" stroke-width="1" />
    <text x="200" y="95" class="text small">pp</text>
    <text x="200" y="105" class="text small">${formatNumber(pp)}</text>

    <line x1="250" y1="85" x2="290" y2="85" stroke="lightgreen" stroke-width="1" />
    <text x="250" y="95" class="text small">Accuracy</text>
    <text x="250" y="105" class="text small">${accuracy}%</text>

    <line x1="310" y1="85" x2="350" y2="85" stroke="yellow" stroke-width="1" />
    <text x="310" y="95" class="text small">Play Count</text>
    <text x="310" y="105" class="text small">${formatNumber(playCount)}</text>

    </svg>
    `;

    return render;
};

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
const renderOldCard = async (data, options = {}) => {
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

    const showSupporter = supporter !== "false" && supporterLevel > 0;
    const showTeam = team !== "false" && teamData?.flag_url;

    let teamFlagDataURI = null;
    if (showTeam) {
        teamFlagDataURI = await getSillyImage(teamData.flag_url);
    }

    const usernameX = 80;
    const usernameWidth = getNameSpacing(
        data.username.length,
        0,
        data.username
    );

    const teamX = usernameX + usernameWidth;
    const teamWidth = 20;

    const supporterX = showTeam ? teamX + teamWidth + 5 : teamX;

    const avatarDataURI = avatarUrl ? await getSillyImage(avatarUrl) : "";
    const flagDataURI = await getSillyImage(flagUrl);
    const playmode = data.playmode || "osu";
    const playmodeIconURL = `https://osu-profile-stats.vercel.app/assets/images/icons/mode-${playmode}.png`;
    const playmodeIconDataURI = await getSillyImage(playmodeIconURL);
    const rankGraphSVG = renderRankHistoryGraph(rankHistory);
    const rankGraphDataURI = `data:image/svg+xml;base64,${Buffer.from(
        rankGraphSVG
    ).toString("base64")}`;
    const gradeIcons = {};
    for (const grade of grades) {
        const gradeURL = `https://osu-profile-stats.vercel.app/assets/images/grades/${grade}.svg`;
        gradeIcons[grade] = await getSillyImage(gradeURL);
    }
    const playStyles = data.playstyle || [];
    const playStyleIcons = {};
    for (const style of playStyles) {
        const styleURL = `https://osu-profile-stats.vercel.app/assets/images/icons/${style}.svg`;
        playStyleIcons[style] = await getSillyImage(styleURL);
    }
    const torusDataURI = await getSillyFont(
        "https://osu-profile-stats.vercel.app/assets/fonts/Torus-Regular.otf"
    );
    const supporterUrl = `https://osu-profile-stats.vercel.app/assets/images/icons/supporter_${supporterLevel}.svg`;
    const supporterDataURI = await getSillyImage(supporterUrl);

    const svgWidth = 400;
    const svgHeight = 200;

    let backgroundType;
    if (!background) {
        const bgURI = await getSillyImage(
            data.cover?.url ||
                "https://osu-profile-stats.vercel.app/assets/images/backgrounds/default.jpeg"
        );
        backgroundType = `<image x="0" y="0" href="${bgURI}" width="${svgWidth}" height="${svgHeight}" preserveAspectRatio="xMidYMid slice" clip-path="url(#clip-rounded)" />`;
    } else if (background === "color") {
        if (hex) validateHex(hex);
        backgroundType = getColor(hex, svgWidth, svgHeight);
    } else {
        backgroundType = await getBackground(
            background,
            hex,
            svgWidth,
            svgHeight
        );
    }

    const gradeIconHeight = 12;
    const gradeIconWidth = 24;
    const gradeSpacing = 5;
    const totalGradesWidth =
        grades.length * (gradeIconWidth + gradeSpacing) - gradeSpacing;
    const gradeStartX = svgWidth - totalGradesWidth - 15;
    const gradeStartY = 165;
    let gradeIconsRender = "";
    let currentX = gradeStartX;
    for (const grade of grades) {
        const gradeCount = gradeCounts[grade.toLowerCase()] || 0;
        gradeIconsRender += `
            <g transform="translate(${currentX}, ${gradeStartY})">
                <image href="${
                    gradeIcons[grade]
                }" height="${gradeIconHeight}px" width="${gradeIconWidth}px" />
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

        playStyleIconsRender += `
            <image href="${playStyleIcons[style]}" x="${x}" y="${y}" width="${playStyleIconSize}" height="${playStyleIconSize}" />
        `;
    });

    const render = `
    <!-- Card Generated by https://osu-profile-stats.vercel.app -->
    <!-- Made with ♥ by Tanese -->
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
                ? `
                <clipPath id="clip-team-flag">
                    <rect x="${teamX}" y="20" width="20" height="12" rx="3" ry="3" />
                </clipPath>
                `
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
    ${backgroundType}
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
    ${
        showSupporter
            ? `<image href="${supporterDataURI}" height="12" x="${supporterX}" y="20" />`
            : ""
    }

    <text x="80" y="50" class="text medium">Global Rank</text>
    <text x="80" y="60" class="text medium ans">#${formatNumber(
        globalRank
    )}</text>

    <text x="160" y="50" class="text medium">Country Rank</text>
    <text x="160" y="60" class="text medium ans">#${formatNumber(
        countryRank
    )}</text>

    <image href="${rankGraphDataURI}" x="80" y="80" width="180" height="40" />

    <text x="290" y="65" class="text small">Ranked Score</text>
    <text x="343" y="65" class="text small ans">${formatNumber(
        rankedScore
    )}</text>

    <text x="290" y="75" class="text small">Accuracy</text>
    <text x="343" y="75" class="text small ans">${accuracy}%</text>

    <text x="290" y="85" class="text small">Play Count</text>
    <text x="343" y="85" class="text small ans">${formatNumber(
        playCount
    )}</text>

    <text x="290" y="95" class="text small">Total Score</text>
    <text x="343" y="95" class="text small ans">${formatNumber(
        totalScore
    )}</text>

    <text x="290" y="105" class="text small">Total Hits</text>
    <text x="343" y="105" class="text small ans">${formatNumber(
        totalHits
    )}</text>

    <text x="290" y="115" class="text small">Max Combo</text>
    <text x="343" y="115" class="text small ans">${formatNumber(
        maxCombo
    )}</text>

    <text x="290" y="125" class="text small">Replays Seen</text>
    <text x="343" y="125" class="text small ans">${formatNumber(
        replaysWatched
    )}</text>


    <text x="80" y="175" class="text medium">Medals</text>
    <text x="80" y="185" class="text medium ans">${medals}</text>

    <text x="120" y="175" class="text medium">pp</text>
    <text x="120" y="185" class="text medium ans">${formatNumber(pp)}</text>

    <text x="160" y="175" class="text medium">Total Play Time</text>
    <text x="160" y="185" class="text medium ans">${formatNumber(
        playTime
    )} hours</text>

    
    ${gradeIconsRender}
    <text x="15" y="90" class="text medium">Playstyles</text>
    ${playStyleIconsRender}
    </svg>
    `;

    return render;
};

module.exports = renderCard;
