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

module.exports = {
    validateHex,
};
