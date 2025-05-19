/**
 * Just a helper function to format a number with commas as thousands separators
 * @param {number|string} value - Num to format
 * @returns {string} - Formatted num
 */
const formatNumber = (value) => {
	if (value === "N/A") return value;
	return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

module.exports = {
	formatNumber,
};
