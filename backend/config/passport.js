const passport = require('passport');
const Auth0Strategy = require('passport-auth0');
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

    let isRegistered = false;
    if (!isUser) {
            await db.createUser({
                Role: "User",
                id: id,
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
    done(null, user)
});

passport.deserializeUser(function (user, done) {
    done(null, user)
});

module.exports = passport;

function makeDate(d) {
    if (!d) return undefined;
    let date = d.split('.');
    return new Date(date[2] + '-' + date[1] + '-' + date[0])
}
