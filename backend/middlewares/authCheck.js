const db = require('../dataLayer');
const { AccessLevels } = require('../../common/consts');
const { rightsCheck } = require('../helpers');

function userAccessFactory(negativeCb) {
    return (req, res, next) => {
        if (req.isAuthenticated()) {
            next();
        } else {
            return negativeCb(res);
        }
    };
}

module.exports.user = userAccessFactory((res) => res.sendStatus(401));

module.exports.registration = userAccessFactory((res) => res.redirect('/login'));


function checkAccessFactory(accessLevel) {
    return async (req, res, next) => {
        if (!req.isAuthenticated()) {
            return res.sendStatus(401);
        }

        let id;
        if (req.user._json && req.user._json.email) {
            id = req.user._json.email;
        } else id = req.user.user_id;

        const user = await db.findUserById(id);

        if (rightsCheck.hasAccessLevel(user, accessLevel)) {
            next();
        } else {
            return res.redirect('/404');
        }
    };
}

module.exports.observer = checkAccessFactory(AccessLevels.OBSERVER);

module.exports.moderator = checkAccessFactory(AccessLevels.MODERATOR);

module.exports.admin = checkAccessFactory(AccessLevels.ADMIN);

module.exports.superAdmin = checkAccessFactory(AccessLevels.SUPERADMIN);
