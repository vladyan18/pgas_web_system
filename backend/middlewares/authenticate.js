const passport = require('passport');

module.exports = async function(req, res, next) {
    const username = req.body.username;
    const password = req.body.password;
    let st = username;
    if (st.indexOf('@') !== -1) {
        st = username.substring(0, username.indexOf('@'));
    }
    const adUsername = st + '@ad.pu.ru';

    const opts = {
        ldap: {
            url: process.env.LDAP_URL,
            baseDN: 'dc=ad,dc=pu,dc=ru', username: adUsername, password: password,
        },
    };
    try {
        passport.authenticate('ActiveDirectory', opts, (err, user, info) => {
            if (err) {
                console.log('ERROR', err);
                return res.sendStatus(400);
            }

            if (!user) {
                user = {};
                user._json = {};
                user._json.sAMAccountName = st;
            }

            req.user = user;
            next();
        })(req, res);
    } catch (e) {
        console.error(e);
        return res.sendStatus(400);
    }
};