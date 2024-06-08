// middlewares/sessionMiddleware.js
const saveLastViewedProfileIndex = (req, res, next) => {
    const { lastViewedProfileIndex } = req.body;
    if (lastViewedProfileIndex !== undefined) {
        req.session.lastViewedProfileIndex = lastViewedProfileIndex;
    }
    next();
};

const getLastViewedProfileIndex = (req, res, next) => {
    req.lastViewedProfileIndex = req.session.lastViewedProfileIndex || 0;
    next();
};

module.exports = {
    saveLastViewedProfileIndex,
    getLastViewedProfileIndex
};
