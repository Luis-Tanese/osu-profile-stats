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
        const contentType = res.headers["content-type"];
        const base64 = Buffer.from(res.data, "binary").toString("base64");
        return `data:${contentType};base64,${base64}`;
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
        const bgTypes = ["default", "bg1", "bg2", "bg3"];
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

module.exports = { log, formatNumber, getBackground, getSillyImage, getSillyFont, getColor, validateHex };
