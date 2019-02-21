const express = require('express')
const router = express.Router()
const path = require('path')
const passport = require('passport')
const frontendPath = path.join(__dirname, '../../frontend', '/build')

const auth = (req, res, next) => {
  if (req.isAuthenticated()) {

    if (req.user.Registered)
      next()
    else return res.redirect('/register')
  }
  else {
    return res.redirect('/login')
  }
}

const regAuth = (req, res, next) => {
    if (req.isAuthenticated()) {

        console.log(req.body)
       next()
    }
    else {
        return res.redirect('/login')
    }
}

const adminAuth = (req, res, next) => {
  console.log(req)
  if (req.isAuthenticated() && req.user._json.email === 'vladyan18@gmail.com') {
    next()
  }
  else {
    return res.redirect('/404')
  }
}

router.get('/', (req, res) => res.redirect('/home'))

router.get('/login', passport.authenticate('auth0', {
    scope: 'openid email profile'
  }), function (req, res) {
    res.redirect('/')
  });

router.get('/callback', function (req, res, next) {
    passport.authenticate('auth0', function (err, user, info) {
      if (err) { return next(err) }
      if (!user) { return res.redirect('/login') }
      console.log(user)
      req.logIn(user, function (err) {
        if (err) { return next(err) }
        const returnTo = req.session.returnTo
        delete req.session.returnTo
        res.redirect(returnTo || '/home')
      });
    })(req, res, next)
})  

router.get('/home', auth,  (req, res) => {
  res.sendFile(path.join(frontendPath, '/user_main.html'))
})

router.get('/register',regAuth, (req, res) => {
    res.sendFile(path.join(frontendPath, '/register.html'))
})


router.get('/upload',auth,(req, res) => {
  res.sendFile(path.join(frontendPath, '/add.html'))
})

router.get('/achievement/*',auth,(req, res) => {
    res.sendFile(path.join(frontendPath, '/achievement.html'))
})

router.get('/documents',auth,(req, res) => {
  res.sendFile(path.join(frontendPath, '/criterion.html'))
})

router.get('/logout', (req, res) => {
  req.session.destroy()
  req.logout()
  res.redirect('/home')
})

router.get('/admin',adminAuth, (req, res) => {
  res.sendFile(path.join(frontendPath, '/admin.html'))
})

router.get('/processed',adminAuth,(req, res) => {
  res.sendFile(path.join(frontendPath, '/processed.html'))
})

router.get('/rating',adminAuth, (req, res) => {
  res.sendFile(path.join(frontendPath, '/rating.html'))
})

router.get('/info',adminAuth, (req, res) => {
  res.sendFile(path.join(frontendPath, '/info.html'))
})


router.get('/user/*',adminAuth, (req, res) => {
  res.sendFile(path.join(frontendPath, '/profile_admin.html'))
})

router.get('*', function (req, res) {
  res.sendFile(path.join(frontendPath, '/404.html'))
})

module.exports = router
