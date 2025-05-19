const { log } = require("./utils/log.js");
const { formatNumber } = require("./utils/format.js");
const { getBackground, getColor } = require("./utils/bg.js");
const { getSillyImage, getSillyFont } = require("./utils/imageUtils");
const { validateHex } = require("./utils/validate.js");
const { getNameSpacing, getSupporterSpacingFlag } = require("./utils/spacing.js");
const renderErrorCard = require("./renderers/errorCard");

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
