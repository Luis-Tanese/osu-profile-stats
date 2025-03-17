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
    getNameSpacing,
    getSupporterSpacingFlag,
};
