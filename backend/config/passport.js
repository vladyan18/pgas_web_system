const passport = require('passport')
const Auth0Strategy = require('passport-auth0')
const db = require('../controllers/dbController')

var strategy = new Auth0Strategy(
    {
      domain: 'vladyan18.eu.auth0.com',
      clientID: 'GioyT7jHzp8opB8ZdMNeJsPRkID4RJNI',
      clientSecret: 'jrV4PqnRFNVTjWwm2IY0sJ405h1Shl_501JZ1teBjqHbSN_22h00BhsQNq2dG5IY',
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
