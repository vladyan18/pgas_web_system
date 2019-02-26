const express = require('express')
const router = express.Router()
const path = require('path')
const passport = require('passport')
const frontendPath = path.join(__dirname, '../../frontend', '/build')
const db = require('../controllers/dbController.js')

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

const adminAuth = async (req, res, next) => {
  if (req.user._json && req.user._json.email)
    id = req.user._json.email
  else id = req.user.user_id
  let User = await db.findUserById(id)
  if (req.isAuthenticated() && User.Role === 'Admin') {
    next()
  }
  else {
    return res.redirect('/404')
  }
}

const superAdminAuth = async (req, res, next) => {
  if (req.user._json && req.user._json.email)
    id = req.user._json.email
  else id = req.user.user_id
  let User = await db.findUserById(id)
  if (req.isAuthenticated() && User.Role === 'SuperAdmin') {
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

router.get('/achievement/:id',
    async (req, res, next) => {
    if (req.user._json && req.user._json.email)
        id = req.user._json.email
    else id = req.user.user_id
    let User = await db.findUserById(id)
    console.log(req.params.id, User.Achievement)
    if (req.isAuthenticated() &&  (User.Achievement.some(o => o == req.params.id) || User.Role === 'Admin' || User.Role === 'SuperAdmin')) {
        next()
    }
    else {
        return res.redirect('/404')
    }},
    (req, res) => {
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

router.get('/superAdmin', superAdminAuth, (req,res)=>{
  res.sendFile(path.join(frontendPath, '/superAdmin.html'))
})

router.get('/superProcessed', superAdminAuth, (req,res)=>{
  res.sendFile(path.join(frontendPath, '/superProcessed.html'))
})

router.get('/superRating', superAdminAuth, (req,res)=>{
  res.sendFile(path.join(frontendPath, '/superRating.html'))
})

router.get('/admins', superAdminAuth, (req,res)=>{
  res.sendFile(path.join(frontendPath, '/adminList.html'))
})

router.get('*', function (req, res) {
  res.sendFile(path.join(frontendPath, '/404.html'))
})

module.exports = router
