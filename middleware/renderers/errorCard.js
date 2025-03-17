const { getBackground } = require("../utils/bg.js");

/**
 * Renders an error card with a specific error message
 * @param {number} svgHeight - Height of the error card
 * @param {number} svgWidth - Width of the error card
 * @param {string} errorMessage - Specific error message to display
 * @returns {Promise<string>} - SVG markup for the error card
 */
const renderErrorCard = async (
    svgHeight = 120,
    svgWidth = 400,
    errorMessage = "An error occurred"
) => {
    const backgroundType = await getBackground(
        "bg4",
        null,
        svgWidth,
        svgHeight
    );

    const maxCharsPerLine = 40;
    const words = errorMessage.split(" ");
    const lines = [];
    let currentLine = "";

    words.forEach((word) => {
        if ((currentLine + " " + word).length <= maxCharsPerLine) {
            currentLine += (currentLine ? " " : "") + word;
        } else {
            lines.push(currentLine);
            currentLine = word;
        }
    });
    if (currentLine) {
        lines.push(currentLine);
    }

    const lineHeight = 25;
    const startY = svgHeight / 2 - ((lines.length - 1) * lineHeight) / 2;

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

    ${lines
        .map(
            (line, index) => `
        <text 
            x="50%" 
            y="${startY + index * lineHeight}" 
            class="text large" 
            dominant-baseline="middle" 
            text-anchor="middle"
        >
            ${line}
        </text>
    `
        )
        .join("")}
    </svg>
    `;

    return render;
};

module.exports = renderErrorCard;
