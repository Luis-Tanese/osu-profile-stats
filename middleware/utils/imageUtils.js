const axios = require("axios");

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
		return `data:font/otf;base64,${Buffer.from(res.data).toString("base64")}`;
	} catch (error) {
		console.error(`Failed to get silly font from ${url}:`, error);
		return "";
	}
};

module.exports = {
	getSillyImage,
	getSillyFont,
};
