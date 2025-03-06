const axios = require("axios");

/**
 * Logs a silly message (Just using it cuz smol)
 * @param {string} string - The message to log
 */
const log = (string) => {
    console.log(string);
};

/**
 * Gets a image from a URL and converts into a base64 data URI
 * @param {string} url - The url of the image (duh)
 * @returns {Promise<string>} - The base64-encoded data URI
 */
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

/**
 * Same thing as getSillyImage but now im too lazy to merge them both
 * @param {string} url - The url of the font (^___^)
 * @returns {Promise<string>} - The base64-encoded data URI
 */
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

/**
 * Just a helper function to format a number with commas as thousands separators
 * @param {number|string} value - Num to format
 * @returns {string} - Formatted num
 */
const formatNumber = (value) => {
    if (value === "N/A") return value;
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

/**
 * This gets the background element for the card
 * @param {string} background - Bg type or name
 * @param {string|null} hex - The hex color code (for color backgrounds)
 * @param {number} svgWidth - The width of the svg
 * @param {number} svgHeight - The height of the svg
 * @returns {Promise<string>} - Markup for the backgroud
 */
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

/**
 * Gets the color element for the card
 * @param {string|null} hex - The hex color code
 * @param {number} svgWidth - The width of the svg
 * @param {number} svgHeight - The height of the svg
 * @returns {string} - Markup for the color
 */
const getColor = (hex, svgWidth, svgHeight) => {
    let hexSelected = hex;
    if (hexSelected === null) hexSelected = "f3f3f3f3f3";
    return `<rect width="${svgWidth}" height="${svgHeight}" fill="#${hexSelected}" clip-path="url(#clip-rounded)" />`;
};

/**
 * Simply validates a hex color code
 * @param {string} hex - The hex color code
 * @returns {string} - The validated hex color code
 */
const validateHex = (hex) => {
    const isValidHex = /^([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(hex);
    if (!isValidHex) throw new Error(`Invalid hex color: ${hex}`);
    return hex;
};
/**
 * Renders an error card with a specific error message
 * @param {number} svgHeight - Height of the error card
 * @param {number} svgWidth - Width of the error card
 * @param {string} errorMessage - Specific error message to display
 * @returns {Promise<string>} - SVG markup for the error card
 */
const renderErrorCard = async (svgHeight = 120, svgWidth = 400, errorMessage = "An error occurred") => {
    const backgroundType = await getBackground(
        "bg4",
        null,
        svgWidth,
        svgHeight
    );

    const maxCharsPerLine = 40;
    const words = errorMessage.split(' ');
    const lines = [];
    let currentLine = '';

    words.forEach(word => {
        if ((currentLine + ' ' + word).length <= maxCharsPerLine) {
            currentLine += (currentLine ? ' ' : '') + word;
        } else {
            lines.push(currentLine);
            currentLine = word;
        }
    });
    if (currentLine) {
        lines.push(currentLine);
    }

    const lineHeight = 25;
    const startY = (svgHeight / 2) - ((lines.length - 1) * lineHeight / 2);

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
    <rect width="${svgWidth}" height="${svgHeight}" fill="rgba(0, 0, 0, 0.6)" clip-path="url(#clip-rounded)" />

    ${lines.map((line, index) => `
        <text 
            x="50%" 
            y="${startY + (index * lineHeight)}" 
            class="text large" 
            dominant-baseline="middle" 
            text-anchor="middle"
        >
            ${line}
        </text>
    `).join('')}
    </svg>
    `;

    return render;
};

/**
 * Calculates the appropriate spacing for a username based on its length and character composition. This took me so long to figure out and tweak it out, and it is still not perfect, but we roll with it
 * @param {number} length - The length of the username
 * @param {number} supporterLevel - The supporter level (not used and im lazy to remove it)
 * @param {string} username - The username to calculate spacing for
 * @returns {number} - The calculated width for the username
 */
const getNameSpacing = (length, supporterLevel = 0, username) => {
    let baseWidth = length * 8;

    const capitalCount = (username.match(/[A-Z]/g) || []).length;
    baseWidth += capitalCount * 2.5;

    const wideCharCount = (username.match(/[MWmw]/g) || []).length;
    baseWidth += wideCharCount * 3;

    const mediumCharCount = (username.match(/[OQGD]/g) || []).length;
    baseWidth += mediumCharCount * 1.25;

    const narrowCharCount = (username.match(/[ilIjtf]/g) || []).length;
    baseWidth -= narrowCharCount * 2;

    const padding = length > 10 ? 8 : 15;

    return baseWidth + padding;
};

/**
 * Gets the appropriate spacing for a flag to the supporter tag
 * @param {number} level - The supporter level
 * @returns {number} - The calculated width for the supporter level flag
 */
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
