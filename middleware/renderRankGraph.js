const { log } = require("./utils.js");

const renderRankHistoryGraph = (rankHistory, x = 80, y = 80, width = 180, height = 40) => {
    const data = rankHistory.data || [];

    if (!data.length) {
        return `<g transform="translate(${x}, ${y})"></g>`;
    }

    const padding = 5;
    const minRank = Math.min(...data);
    const maxRank = Math.max(...data);
    const normalize = (value) => (value - minRank) / (maxRank - minRank);

    const points = data.map((rank, index) => {
        const px = (index / (data.length - 1)) * (width - 2 * padding) + padding;
        const py = height - padding - normalize(rank) * (height - 2 * padding);
        return `${px},${py}`;
    });

    const pathData = points
        .map((point, index) => (index === 0 ? `M ${point}` : `L ${point}`))
        .join(" ");

    return `
    <g transform="translate(${x}, ${y}) rotate(180, ${width / 2}, ${height / 2}) scale(-1, 1)">
        <path d="${pathData}" 
              stroke="yellow" 
              fill="none" 
              stroke-width="2" 
              stroke-linejoin="round" 
              stroke-dasharray="1000" 
              stroke-dashoffset="1000">
            <animate attributeName="stroke-dashoffset" from="1000" to="0" dur="1s" repeatCount="1" fill="freeze" />
        </path>
        ${points
            .map(
                (point) => `
        <circle cx="${point.split(",")[0]}" cy="${point.split(",")[1]}" r="2" fill="yellow" />
        `
            )
            .join("")}
    </g>`;
};


/* const rankHistory = {
    mode: "mania",
    data: [
        93740, 93788, 93842, 93905, 93975, 94039, 94102, 94143, 94202, 94264,
        94319, 94376, 94458, 94525, 94590, 94651, 94714, 94759, 94819, 94899,
        94977, 95028, 95088, 95146, 95201, 95263, 95344, 95409, 95472, 95539,
        95643, 95726, 95779, 95824, 95878, 95930, 95993, 96041, 96115, 96168,
        96230, 96281, 96324, 76051, 76128, 76216, 76327, 76442, 76541, 76623,
        76704, 76789, 76867, 76989, 77072, 77145, 77222, 77295, 77347, 77415,
        77540, 77614, 77674, 77742, 77830, 77921, 78010, 78079, 78147, 78205,
        78263, 78338, 78378, 78465, 78542, 78606, 78684, 78758, 78810, 78829,
        78892, 78209, 77911, 77863, 77897, 77968, 78036, 77938, 76882, 76929,
    ],
};

log(renderRankHistoryGraph(rankHistory)); */

module.exports = renderRankHistoryGraph;
