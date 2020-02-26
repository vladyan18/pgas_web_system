'use strict'
const passport = require('passport');
const db = require('../controllers/dbController');
let ActiveDirectoryStrategy = require('./ldapstrategy');

passport.use(new ActiveDirectoryStrategy({
    integrated: false,
    ldap: {
        url: process.env.LDAP_URL,
        baseDN: 'dc=ad,dc=pu,dc=com',
    }
}, function (profile, ad, done) {
    console.log('AD', ad);
    if (profile)
        return done(null, profile);
    else return (null, false)
}));


passport.serializeUser( async function (user, done) {
    const id = user._json.sAMAccountName;
    const isUser = await db.isUser(id);
    console.log('SpbuID', id + '@student.spbu.ru', 'IsUser:', isUser);
    let isRegistered = false;
    if (!isUser) {
            await db.createUser({
                Role: "User",
                id: id,
		SpbuId: id + '@student.spbu.ru',
                Ball: 0,
                Achievement: [],
                Registered: false
            });
            await db.migrate(id);
    } else isRegistered = await db.isRegistered(id);
    user.Registered = isRegistered;
    let role = await db.getUserRights(id);
    if (role) {
        user.Role = role.Role;
        user.Rights = role.Rights;
    }
    user.user_id = id;
    console.log('User', id, 'successfuly logged in');
    done(null, user)
});

passport.deserializeUser(function (user, done) {
    done(null, user)
});

module.exports = passport;
