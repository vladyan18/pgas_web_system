const db = require('./../controllers/dbController');
const passport = require('passport');

module.exports.authenticate = async function(username, password) {
    console.log(username, password);
    const st = username.substring(0, username.indexOf('@'));
    const adUsername = st + '@ad.pu.ru';

    const opts = {
        ldap: {
            url: process.env.LDAP_URL,
            baseDN: 'dc=ad,dc=pu,dc=ru', username: adUsername, password: password,
        },
    };
    return new Promise(((resolve, reject) => {
        passport.authenticate('ActiveDirectory', opts, (err, user, info) => {
            if (err) {
                console.log('ERROR', err);
                reject(err);
            }

            if (!user) {
                user = {};
                user._json = {};
                user._json.sAMAccountName = st;
            }
            console.log('USER', user);
            resolve(user);
        })();
    }))
};