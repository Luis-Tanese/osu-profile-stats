const renderMiniCard = require("./renderers/miniCard.js");
const renderFullCard = require("./renderers/fullCard.js");
const renderErrorCard = require("./renderers/errorCard.js");

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
			return await renderFullCard(data, options);
		} else {
			return await renderMiniCard(data, options);
		}
	} catch (error) {
		console.error("Error rendering card:", error);
		throw new Error("Failed to render card. Check the console for details.");
	}
};

module.exports = {
	renderCard,
	renderErrorCard,
};
