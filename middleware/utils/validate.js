const validateHex = (hex) => {
    const isValidHex = /^([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(hex);
    if (!isValidHex) throw new Error(`Invalid hex color: ${hex}`);
    return hex;
};

const validateImageType = (imageType) => {
    if (!imageType) return "svg";

    const normalized = imageType.toLowerCase().trim();
    const validTypes = ["svg", "png", "jpg", "jpeg"];

    if (!validTypes.includes(normalized)) {
        throw new Error(
            `Invalid imageType "${imageType}". Supported formats: ${validTypes.join(
                ", "
            )}`
        );
    }

    return normalized === "jpeg" ? "jpg" : normalized;
};

module.exports = {
    validateHex,
    validateImageType,
};
