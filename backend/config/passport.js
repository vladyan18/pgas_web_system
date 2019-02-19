const passport = require('passport')
const Auth0Strategy = require('passport-auth0')
const db = require('../controllers/dbController')

var strategy = new Auth0Strategy(
    {
      domain: 'auction.eu.auth0.com',
      clientID: 'I87ucuIlQ2Wx9X12z1cjJiDC4214290i',
      clientSecret: '-drLRTUhYhiWXc2m7kj2iuWconNFd05Zesj-aMkrmpqmofYTnxs7FLQtiOeZ69yE',
      callbackURL:
        process.env.AUTH0_CALLBACK_URL || '/callback'
    },
    async function (accessToken, refreshToken, extraParams, profile, done) {
      if(!await db.isUser(profile._json.email)){
        await db.createUser({Role : "User", id: profile._json.email, FirstName : profile.name.givenName, LastName: profile.name.familyName, Ball: 0,  Achievement: []})
      }
      return done(null, profile)
    }
  )

  passport.use(strategy)

  passport.serializeUser(function (user, done) {
    done(null, user)
  })
  
  passport.deserializeUser(function (user, done) {
    done(null, user)
  })

module.exports = passport