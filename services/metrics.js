const { dateTan } = require("datetan");

const metrics = {
    requests: 0,
    cardsRendered: 0,
    errors: 0,
    startTime: `${dateTan(new Date(), "YYYY-MM-DD HH:mm:ss:ms Z", "en-us")}`,
    origins: {},
    responseTimes: {
        avg: 0,
        count: 0,
        total: 0,
    },
    pathPerformance: {},
};

module.exports = { metrics };
