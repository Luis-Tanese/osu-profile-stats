const { log } = require("./utils.js");

const renderRankHistoryGraph = (rankHistory) => {
    const data = rankHistory.data;

    if (!data || data.length === 0) {
        return `
        <svg xmlns="http://www.w3.org/2000/svg" width="800" height="100">
        </svg>
        `;
    }

    const svgWidth = 800;
    const svgHeight = 100;
    const padding = 20;

    const minRank = Math.min(...data);
    const maxRank = Math.max(...data);

    if (minRank === maxRank) {
        const flatLineY = svgHeight - padding - (svgHeight - 2 * padding) / 2;
        const flatLineRender = `
        <svg xmlns="http://www.w3.org/2000/svg" width="${svgWidth}" height="${svgHeight}">
            <line 
                x1="${padding}" 
                y1="${flatLineY}" 
                x2="${svgWidth - padding}" 
                y2="${flatLineY}" 
                stroke="yellow" 
                stroke-width="2" 
            />
        </svg>
        `;
        return flatLineRender;
    }

    const normalize = (value) => {
        return (value - minRank) / (maxRank - minRank);
    };

    const points = data.map((rank, index) => {
        const x =
            (index / (data.length - 1)) * (svgWidth - 2 * padding) + padding;
        const y =
            svgHeight - padding - normalize(rank) * (svgHeight - 2 * padding);
        return { x, y };
    });

    const pathData = points
        .map((point, index) => {
            return index === 0
                ? `M ${point.x}, ${point.y}`
                : `L ${point.x}, ${point.y}`;
        })
        .join(" ");

    /* const render = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${svgWidth}" height="${svgHeight}">
    <g transform="rotate(180, ${svgWidth / 2}, ${
        svgHeight / 2
    }) scale(-1, 1) translate(-${svgWidth}, 0)">
        <path d="${pathData}" stroke="yellow" fill="none" stroke-width="2" stroke-linejoin="round" stroke-dasharray="1000" stroke-dashoffset="1000">
            <animate attributeName="stroke-dashoffset" from="1000" to="0" dur="1s" repeatCount="1" fill="freeze" />
        </path>
        
    </g>
    </svg>
    `; */

    const render = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${svgWidth}" height="${svgHeight}">
    <g transform="rotate(180, ${svgWidth / 2}, ${
        svgHeight / 2
    }) scale(-1, 1) translate(-${svgWidth}, 0)">
        <path d="${pathData}" stroke="yellow" fill="none" stroke-width="2" stroke-linejoin="round" />
    </g>
    </svg>
    `;

    return render;
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
