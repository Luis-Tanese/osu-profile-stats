const renderMiniCard = require("./renderers/miniCard.js");
const renderFullCard = require("./renderers/fullCard.js");
const renderErrorCard = require("./renderers/errorCard.js");

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
        throw new Error(
            "Failed to render card. Check the console for details."
        );
    }
};

module.exports = {
    renderCard,
    renderErrorCard,
};
