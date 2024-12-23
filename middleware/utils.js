const log = (string) => {
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

module.exports = { log, formatNumber, getBackground };
