const axios = require("axios");

const log = (string) => {
    console.log(string);
};

const getSillyImage = async (url) => {
    try {
        const res = await axios.get(url, { responseType: "arraybuffer" });
        const contentType = res.headers["content-type"];
        const base64 = Buffer.from(res.data, "binary").toString("base64");
        return `data:${contentType};base64,${base64}`;
    } catch (error) {
        console.error(`Failed to get silly image from ${url}:`, error);
        return "";
    }
};

const getSillyFont = async (url) => {
    try {
        const res = await axios.get(url, { responseType: "arraybuffer" });
        return `data:font/otf;base64,${Buffer.from(res.data).toString(
            "base64"
        )}`;
    } catch (error) {
        console.error(`Failed to get silly font from ${url}:`, error);
        return "";
    }
};

const formatNumber = (value) => {
    if (value === "N/A") return value;
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

const getBackground = async (background, hex = null, svgWidth, svgHeight) => {
    if (background === "color") {
        let hexSelected = hex;
        if (hexSelected === null) hexSelected = "f3f3f3f3f3";
        return `<rect width="${svgWidth}" height="${svgHeight}" fill="#${hexSelected}" clip-path="url(#clip-rounded)" />`;
    } else {
        const bgTypes = ["default", "bg1", "bg2", "bg3", "bg4", "bg5"];

        const selectedBg = bgTypes.includes(background)
            ? background
            : "default";
        const backgroundDataURI = await getSillyImage(
            `https://osu-profile-stats.vercel.app/assets/images/backgrounds/${selectedBg}.jpg`
        );

        return `<image href="${backgroundDataURI}" x="0" y="0" width="${svgWidth}" height="${svgHeight}" preserveAspectRatio="xMidYMid slice" clip-path="url(#clip-rounded)" />`;
    }
};

const getColor = (hex, svgWidth, svgHeight) => {
    let hexSelected = hex;
    if (hexSelected === null) hexSelected = "f3f3f3f3f3";
    return `<rect width="${svgWidth}" height="${svgHeight}" fill="#${hexSelected}" clip-path="url(#clip-rounded)" />`;
};

const validateHex = (hex) => {
    const isValidHex = /^([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(hex);
    if (!isValidHex) throw new Error(`Invalid hex color: ${hex}`);
    return hex;
};

const renderErrorCard = async (svgHeight = 120, svgWidth = 400) => {
    const backgroundType = await getBackground(
        "bg1",
        null,
        svgWidth,
        svgHeight
    );

    const render = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${svgWidth}" height="${svgHeight}">
    <defs>
        <clipPath id="clip-rounded">
            <rect width="${svgWidth}" height="${svgHeight}" rx="15" ry="15" />
        </clipPath>
    </defs>
    <style>
        .text { fill: rgb(255, 255, 255); font-family: Arial, sans-serif; }
        .large { font-size: 20px; }
    </style>
    ${backgroundType}
    <rect width="${svgWidth}" height="${svgHeight}" fill="rgba(0, 0, 0, 0.4)" clip-path="url(#clip-rounded)" />
    <text x="50%" y="50%" class="text large" dominant-baseline="middle" text-anchor="middle">
        An error occurred
    </text>
    </svg>
    `;

    return render;
};

const getNameSpacing = (length, supporterLevel = 0, username) => {
    let baseSpacing;
    switch (length) {
        case 3:
            baseSpacing = 35;
            break; //tested
        case 4:
            baseSpacing = 40;
            break; //tested
        case 5:
            baseSpacing = 45;
            break; //tested
        case 6:
            baseSpacing = 55;
            break; //tested
        case 7:
            baseSpacing = 70;
            break; //tested
        case 8:
            baseSpacing = 75;
            break; //tested
        case 9:
            baseSpacing = 80;
            break; //tested
        case 10:
            baseSpacing = 95;
            break; //tested
        case 11:
            baseSpacing = 100;
            break; //tested
        case 12:
            baseSpacing = 105;
            break; //tested
        case 13:
            baseSpacing = 125;
            break; //tested
        case 14:
            baseSpacing = 130;
            break; //not tested (I'm too lazy for this crap IVE BEEN HERE FOR 3 HOURS MAKING THIS ACTUALLY LOOK GOOD GODDAMIT I AM GOING INSANE)
        case 15:
            baseSpacing = 135;
            break; //tested
        default:
            baseSpacing = 35;
    }

    return (
        baseSpacing +
        getSupporterSpacing(supporterLevel) +
        capitalLetters(username)
    );
};

const getSupporterSpacing = (level) => {
    switch (level) {
        case 1:
            return 5;
        case 2:
            return 10;
        case 3:
            return 15;
        default:
            return 0;
    }
};

const capitalLetters = (username) => {
    return (username.match(/[A-Z]/g) || []).length * 2;
};

const getSupporterSpacingFlag = (level) => {
    switch (level) {
        case 1:
            return 27;
        case 2:
            return 33;
        case 3:
            return 45;
        default:
            return 0;
    }
};

module.exports = {
    log,
    formatNumber,
    getBackground,
    getSillyImage,
    getSillyFont,
    getColor,
    validateHex,
    renderErrorCard,
    getNameSpacing,
    getSupporterSpacingFlag,
};
