'use strict';
const passport = require('passport');
const db = require('../dataLayer');
const ActiveDirectoryStrategy = require('./ldapstrategy');
const { Roles } = require('../../common/consts');

passport.use(new ActiveDirectoryStrategy({
  integrated: false,
  ldap: {
    url: process.env.LDAP_URL,
    baseDN: 'dc=ad,dc=pu,dc=com',
  },
}, function(profile, ad, done) {
  console.log('AD', profile, ad);
  if (profile) {
    return done(null, profile);
  } else return done(null, false);
}));


passport.serializeUser( async function(user, done) {
  const id = user._json.sAMAccountName.toLowerCase();
  const isUser = await db.isUser(id);
  let isRegistered = false;
  if (!isUser) {
    await db.createUser({
      Role: Roles.USER,
      id: id,
      SpbuId: id + '@student.spbu.ru',
      Ball: 0,
      Achievement: [],
      Registered: false,
    });
    await db.migrate(id);
  } else isRegistered = await db.isRegistered(id);
  user.Registered = isRegistered;
  user.user_id = id;
  console.log('User', id, 'successfuly logged in');
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

module.exports = passport;
