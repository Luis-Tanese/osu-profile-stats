const { getSillyImage } = require("./imageUtils.js");

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

		const selectedBg = bgTypes.includes(background) ? background : "default";
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

module.exports = {
	getBackground,
	getColor,
};
