module.exports = (req, res, next) => {
    if (req.user) {
        let id;
        if (req.user._json.email) {
            id = req.user._json.email;
        } else id = req.user.user_id;
        if (id) {
            req.userId = id;
        }
    }
    next();
};