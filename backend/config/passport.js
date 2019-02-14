const passport = require('passport')
const Auth0Strategy = require('passport-auth0')
const db = require('../controllers/dbController')

var strategy = new Auth0Strategy(
    {
        domain: 'drokonor.eu.auth0.com',
        clientID: 'V7HEut6unEZMggGBcI6IZsTWvZpoHwCg',
        clientSecret: 't_f_uG7bQx_srBT6LJ4CdATHk3Lp5_567jAapYUn0JC7YABwERYqrg2LrPI5Bjdg',
        callbackURL:
            process.env.AUTH0_CALLBACK_URL || '/callback'
    },
    async function (accessToken, refreshToken, extraParams, profile, done) {

        if(!await db.isUser(profile.id)){
            await db.createUser({Token: profile.id, FirstName : profile.name.givenName, LastName: profile.name.familyName})
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