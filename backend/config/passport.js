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
        if (profile._json && profile._json.email) id = profile._json.email
        else id = profile.user_id
      if(!await db.isUser(id)){
        await db.createUser({Role : "User", id: id, Ball: 0,  Achievement: [], Registered: false})
      }


      return done(null, profile)
    }
  )

  passport.use(strategy)

  passport.serializeUser( async function (user, done) {
    if (user._json && user._json.email) id = user._json.email
    else id = user.user_id
    r = await db.isRegistered(id)
    user.Registered = r;
    done(null, user)
  })
  
  passport.deserializeUser(function (user, done) {
      done(null, user)
  })

module.exports = passport
