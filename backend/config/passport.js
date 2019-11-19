const passport = require('passport');
const Auth0Strategy = require('passport-auth0');
const db = require('../controllers/dbController');
let ActiveDirectoryStrategy = require('./ldapstrategy');


facultiesMap = {
    'Факультет прикладной математики-процессов управления': 'ПМ-ПУ',
    'Юридический факультет': 'Юрфак'
}


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
    //console.log('SERIALIZE', user);
    let id = user._json.sAMAccountName;
    console.log('ID', id)
    if (!await db.isUser(id)) {
        let Type = user._json.department
        Type = Type[0].toString().toUpperCase() + Type.slice(1, Type.length)

        await db.createUser({
            Role: "User",
            id: id,
            LastName: user.name.lastName,
            FirstName: user.name.firstName,
            Patronymic: user.name.middleName,
            Course: user._json.title ? user._json.title[0] : undefined,
            Birthdate: user._json.description ? makeDate(user._json.description) : undefined,
            Type: Type? Type : undefined,
            Faculty: facultiesMap[user._json.company],
            SpbuId: user._json.mail,
            Ball: 0,
            Achievement: [],
            Registered: true});
        await db.migrate(id, user.name.lastName)
        r = false
    } else r = await db.isRegistered(id);
    user.Registered = r;
    let role = await db.getUserRights(id);
    user.Role = role.Role;
    user.Rights = role.Rights;
    user.user_id = id
    //console.log('SERIALIZED', user);
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
