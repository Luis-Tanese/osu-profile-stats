const renderRankHistoryGraph = require("./renderRankGraph.js");
const { formatNumber, getBackground } = require("./utils.js");

const renderCard = (data, background = "default", hex = null) => {
    const stats = data.statistics || {};
    const grades = ["SSH", "SS", "SH", "S", "A"];
    const gradeCounts = stats.grade_counts || {};
    const avatarUrl = data.avatar_url || "";
    const flagUrl = `https://osu.ppy.sh/images/flags/${data.country_code}.png`;
    const globalRank = stats.global_rank || "N/A";
    const countryRank = stats.country_rank || "N/A";
    const pp = stats.pp.toFixed(0) || "N/A";
    const rankedScore = stats.ranked_score || "N/A";
    const accuracy = stats.hit_accuracy?.toFixed(2) || "N/A";
    const playCount = stats.play_count || "N/A";
    const totalScore = stats.total_score || "N/A";
    const totalHits = stats.total_hits || "N/A";
    const maxCombo = stats.maximum_combo || "N/A";
    const replaysWatched = stats.replays_watched_by_others || "N/A";
    const playTime = Math.round((stats.play_time || 0) / 3600);
    const medals = data.user_achievements?.length || 0;
    const rankHistory = data.rank_history || [];

    // SVG Settings =^-^=
    const svgWidth = 400;
    const svgHeight = 200;

    // Background Settings 🗣🔥
    const backgroundType = getBackground(background, hex, svgWidth, svgHeight);

    // Grade Settings 👨‍🎓
    const gradeIconHeight = 12;
    const gradeIconWidth = 24;
    const gradeSpacing = 5;
    const totalGradesWidth =
        grades.length * (gradeIconWidth + gradeSpacing) - gradeSpacing;
    const gradeStartX = svgWidth - totalGradesWidth - 15;
    const gradeStartY = 165;
    let gradeIcons = "";
    let currentX = gradeStartX;
    for (const grade of grades) {
        const gradeCount = gradeCounts[grade.toLowerCase()] || 0;
        gradeIcons += `
            <g transform="translate(${currentX}, ${gradeStartY})">
                <image href="https://osu-profile-stats.vercel.app/assets/images/grades/${grade}.svg" height="${gradeIconHeight}px" width="${gradeIconWidth}px" />
                <text x="${gradeIconWidth / 2}" y="${
            gradeIconHeight + 10
        }" class="medium text ans" text-anchor="middle">${gradeCount}</text>
            </g>`;
        currentX += gradeIconWidth + gradeSpacing;
    }

    // Renderign the silly rank graph 👍
    const rankGraphSVG = renderRankHistoryGraph(rankHistory);

    // Play mode settings 🎹🍎1️⃣🥁
    const playMode = data.playmode || "osu";
    const playModeIcon = `https://osu-profile-stats.vercel.app/assets/images/icons/mode-${playMode}.png`;

    // Playstyles ⌨🐁✏🗑
    const playStyles = data.playstyle || [];
    const playStyleBoxX = 15;
    const playStyleBoxY = 100;
    const playStyleIconSize = 25;
    const playStylePadding = 7;
    let playStyleIcons = "";
    if (playStyles.length > 0) {
        playStyles.forEach((style, index) => {
            const row = Math.floor(index / 2);
            const col = index % 2;

            const x =
                playStyleBoxX + col * (playStyleIconSize + playStylePadding);
            const y =
                playStyleBoxY + row * (playStyleIconSize + playStylePadding);

            playStyleIcons += `
                <image href="https://osu-profile-stats.vercel.app/assets/images/icons/${style}.svg" x="${x}" y="${y}" width="${playStyleIconSize}" height="${playStyleIconSize}" />
            `;
        });
    }

    // Rendering this silly thing ＞︿＜
    const render = `
    <svg xmlns="http://www.w3.org/2000/svg" width="400" height="200">
    <defs>
        <clipPath id="clip-rounded">
            <rect width="${svgWidth}" height="${svgHeight}" rx="15" ry="15" />
        </clipPath>
        <clipPath id="clip-pfp">
            <rect x="15" y="15" width="50" height="50" rx="10" ry="10" />
        </clipPath>
    </defs>
    <style>
        @font-face {
            font-family: 'Torus';
            src: url('https://osu-profile-stats.vercel.app/assets/fonts/Torus-Regular.otf') format('opentype');
        }
        .text { fill:rgb(255, 255, 255); font-family: 'Torus', Arial, sans-serif; }
        .large { font-size: 12px; font-weight: bold; }
        .medium { font-size: 9px; }
        .small { font-size: 7px; }
        .ans { fill: rgb(247, 201, 221); }
    </style>
    ${backgroundType}
    <rect width="${svgWidth}" height="${svgHeight}" fill="rgba(0, 0, 0, 0.4)" clip-path="url(#clip-rounded)" />
    <image href="${avatarUrl}" clip-path="url(#clip-pfp)" x="15" y="15" width="50" height="50" />
    <image class="flag" href="${playModeIcon}" x="300" y="15" width="40" height="25" />
    <image class="flag" href="${flagUrl}" x="340" y="15" width="40" height="25" />
    <text x="80" y="30" class="text large">${data.username}</text>

    <text x="80" y="50" class="text medium">Global Rank</text>
    <text x="80" y="60" class="text medium ans">#${globalRank}</text>

    <text x="160" y="50" class="text medium">Country Rank</text>
    <text x="160" y="60" class="text medium ans">#${countryRank}</text>
    
    ${rankGraphSVG}

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
    <text x="120" y="185" class="text medium ans">${pp}</text>

    <text x="160" y="175" class="text medium">Total Play Time</text>
    <text x="160" y="185" class="text medium ans">${playTime} hours</text>

    
    ${gradeIcons}
    <text x="15" y="90" class="text medium">Playstyles</text>
    ${playStyleIcons}
    </svg>
    `;

    return render;
};

module.exports = renderCard;
