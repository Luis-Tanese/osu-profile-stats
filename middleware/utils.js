const axios = require("axios");
const { dateTan } = require("datetan");

const log = (string, type = "log") => {
    
    console.log(string);
};

const formatNumber = (value) => {
    if (value === "N/A") return value;
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

const getBackground = (background, hex = null, svgWidth, svgHeight) => {
    if (background === "color") {
        let hexSelected = hex;
        if (hexSelected === null) hexSelected = "f3f3f3f3f3"
        return `<rect width="${svgWidth}" height="${svgHeight}" fill="#${hexSelected}" clip-path="url(#clip-rounded)" />`;
    } else {
        const bgTypes = ["default", "bg1", "bg2", "bg3"];
        const selectedBg = bgTypes.includes(background) ? background : "default";

        return `<image href="/assets/images/backgrounds/${selectedBg}.jpg" x="0" y="0" width="${svgWidth}" height="${svgHeight}" preserveAspectRatio="xMidYMid slice" clip-path="url(#clip-rounded)" />`;
    }
};

const toBase64 = async (url) => {
    try {
        const res = await axios.get(url, { responseType: "arraybuffer" });
        const buffer = Buffer.from(res.data, "binary");
        const mimeType = res.headers["Content-Type"];
        return `data:${mimeType};base64,${buffer.toString("base64")}`;
    } catch (error) {
        log(`[${dateTan(
                new Date(),
                "YYYY-MM-DD HH:mm:ss:ms Z",
                "en-us"
            )}][ERROR] Failed to fetch resource at ${url}: ${error}`, "error");
        return "";
    }
};

module.exports = { log, formatNumber, getBackground, toBase64 };
