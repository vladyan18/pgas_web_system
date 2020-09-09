const db = require('../controllers/dbController.js');

module.exports.user = (req, res, next) => {
    if (req.isAuthenticated()) {
        next();
    } else {
        return res.sendStatus(401);
    }
};

module.exports.admin = async (req, res, next) => {
    let id;
    if (req.user._json && req.user._json.email) {
        id = req.user._json.email;
    } else id = req.user.user_id;
    const User = await db.findUserById(id);
    if (req.isAuthenticated() && (User.Role === 'Admin' || User.Role === 'SuperAdmin')) {
        next();
    } else {
        return res.redirect('/404');
    }
};

module.exports.superAdmin = async (req, res, next) => {
    let id;
    if (req.user._json && req.user._json.email) {
        id = req.user._json.email;
    } else id = req.user.user_id;
    console.log(id);
    const User = await db.findUserById(id);
    console.log(User);
    if (req.isAuthenticated() && (User.Role === 'SuperAdmin')) {
        next();
    } else {
        return res.redirect('/404');
    }
};

module.exports.registration = (req, res, next) => {
    if (req.isAuthenticated()) {
        next();
    } else {
        return res.redirect('/login');
    }
};