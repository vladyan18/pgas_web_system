/** Express router providing html pages
 * @module pagesRouter
 * @requires express
 */


/**
 * express module
 * @const
 */
const express = require('express');

/**
 * Express router to mount html pages on.
 * @type {object}
 * @const
 */
const router = express.Router();
const path = require('path');
const passport = require('passport');
const frontendPath = path.join(__dirname, '../../frontend', '/build');
const db = require('../controllers/dbController.js');
const fs = require('fs');

/**
 * If not authenticated, redirect to /login <br/>
 *
 * If not registered, redirect to /register
 *
 * @function auth
 * */
const auth = (req, res, next) => {
    if (req.isAuthenticated()) {
        if (req.user.Registered)
            next();
        else return res.redirect('/register')
    }
    else {
        return res.redirect('/login')
    }
};

/**
 * If not authenticated, redirect to /login <br/>
 *
 * @function regAuth
 * */
const regAuth = (req, res, next) => {
    if (req.isAuthenticated()) {
        next()
    }
    else {
        return res.redirect('/login')
    }
};

/**
 * If not authenticated, or do not have Admin rigths, redirect to 404

 * @function adminAuth
 * */
const adminAuth = async (req, res, next) => {
    if (req.user._json && req.user._json.email)
        id = req.user._json.email;
    else id = req.user.user_id;
    let User = await db.findUserById(id);
    if (req.isAuthenticated() && (User.Role === 'Admin' || User.Role === 'SuperAdmin')) {
        next()
    }
    else {
        return res.redirect('/404')
    }
};

/**
 * If not authenticated, or do not have SuperAdmin rigths, redirect to 404

 * @function adminAuth
 * */
const superAdminAuth = async (req, res, next) => {
    if (req.user._json && req.user._json.email)
        id = req.user._json.email;
    else id = req.user.user_id;
    let User = await db.findUserById(id);
    if (req.isAuthenticated() && User.Role === 'SuperAdmin') {
        next()
    }
    else {
        return res.redirect('/404')
    }
};

/**
 * Route serving redirect to home
 * @name Redirect to home
 * @path {GET} /
 */
router.get('/', (req, res) => res.redirect('/home'));

router.post('/login', async function (req, res) {
    let errState = false
    console.log('LOGIN', req.body.username);
    let opts = {
        ldap: {
            url: process.env.LDAP_URL,
            baseDN: 'dc=ad,dc=pu,dc=ru', username: req.body.username, password: req.body.password
        }
    };
    passport.authenticate('ActiveDirectory', opts,  (err, user, info) => {
        if (err) {
            console.log('ERROR', err);
            if(errState) return
            errState = true
            return res.redirect('/login');
        }

        if (!user) {
            if(errState) return
            errState = true
            return res.redirect('/login')
        }
        req.logIn(user, async function (err) {
            if (err) {
                console.log('ERR', err)
            }
            console.log('LOGGED', user);
            const returnTo = req.session.returnTo;
            delete req.session.returnTo;
            res.redirect(returnTo || '/home')
        })
    })(req, res)
});

/**
 * Route serving callback from auth0
 * @name Auth callback
 * @path {GET} /callback
 */
router.get('/callback', function (req, res, next) {
    passport.authenticate('auth0', function (err, user, info) {
        if (err) { return next(err) }
        if (!user) { return res.redirect('/login') }
        req.logIn(user, function (err) {
            if (err) { return next(err) }
            const returnTo = req.session.returnTo;
            delete req.session.returnTo;
            res.redirect('http://localhost:3000')
        });
    })(req, res, next)
});


var homepage = fs.readFileSync(path.join(frontendPath, '/user_main.html')).toString();

/**
 * Route serving home page
 * @name get/home
 * @path {GET} /home
 * @auth
 */
router.get('/home', auth,  (req, res) => {
    res.sendFile(path.join(frontendPath, '/user_main.html'))
});

/**
 * Route serving register page
 * @name Register page
 * @path {GET} /register
 * @auth not registered can get this page
 */
router.get('/register',regAuth, (req, res) => {
    res.sendFile(path.join(frontendPath, '/register.html'))
});


router.get('/upload',auth,(req, res) => {
    res.sendFile(path.join(frontendPath, '/add.html'))
});

/**
 * Route serving prims page
 * @name Prims page
 * @path {GET} /prims
 * @auth
 */
router.get('/prims',auth,(req, res) => {
    res.sendFile(path.join(frontendPath, '/prim.html'))
});

/**
 * Route serving profile page for user
 * @name Profile page
 * @path {GET} /profile
 * @auth
 */
router.get('/profile',auth,(req, res) => {
    res.sendFile(path.join(frontendPath, '/myprofile.html'))
});

/**
 * Route serving profile edition page fo user
 * @name Edit profile page
 * @path {GET} /editProfile
 */
router.get('/editProfile',auth,(req, res) => {
    res.sendFile(path.join(frontendPath, '/edit_myprofile.html'))
});

/**
 * Route serving achievement page for editing by user
 * @name Achievement user page
 * @path {GET} /achievement/:id
 * @params {String} :id ObjectID of achievement
 */
router.get('/achievement/:id',
    async (req, res, next) => {
        if (req.user._json && req.user._json.email)
            id = req.user._json.email;
        else id = req.user.user_id;
        let User = await db.findUserById(id);
        if (req.isAuthenticated() &&  (User.Achievement.some(o => o == req.params.id) || User.Role === 'Admin' || User.Role === 'SuperAdmin')) {
            next()
        }
        else {
            return res.redirect('/404')
        }},
    (req, res) => {
        res.sendFile(path.join(frontendPath, '/achievement.html'))
    });

/**
 * Route serving information page for user
 * @name Information page
 * @path {GET} /documents
 * @auth
 */
router.get('/documents',auth,(req, res) => {
    res.sendFile(path.join(frontendPath, '/criterion.html'))
});

/**
 * Route serving logout
 * @name Logout
 * @path {GET} /logout
 */
router.get('/logout', (req, res) => {
    req.session.destroy();
    req.logout();
    res.redirect('/home')
});

/**
 * Route serving admin default page
 * @name New candidates page
 * @path {GET} /admin
 * @auth AdminAuth required
 */
router.get('/admin',adminAuth, (req, res) => {
    res.sendFile(path.join(frontendPath, '/admin.html'))
});

/**
 * Route serving current candidates page for admin
 * @name Current candidates page
 * @path {GET} /processed
 * @auth AdminAuth required
 */
router.get('/processed',adminAuth,(req, res) => {
    res.sendFile(path.join(frontendPath, '/processed.html'))
});

/**
 * Route serving current candidates rating page for admin
 * @name Rating page
 * @path {GET} /rating
 * @auth AdminAuth required
 */
router.get('/rating',adminAuth, (req, res) => {
    res.sendFile(path.join(frontendPath, '/rating.html'))
});

/**
 * Route serving information page for admin
 * @name Information page
 * @path {GET} /info
 * @auth AdminAuth required
 */
router.get('/info',adminAuth, (req, res) => {
    res.sendFile(path.join(frontendPath, '/info.html'))
});

/**
 * Route serving history page for admin
 * @name Actions history page
 * @path {GET} /history
 * @auth AdminAuth required
 */
router.get('/history', adminAuth, (req, res) => {
    res.sendFile(path.join(frontendPath, '/adminHistory.html'))
});

/**
 * Route serving current achieves page for admin
 * @name All current achieves page for admin
 * @path {GET} /currentAchieves
 * @auth AdminAuth required
 */
router.get('/currentAchieves', adminAuth, (req, res) => {
    res.sendFile(path.join(frontendPath, '/currentAchieves.html'))
});

/**
 * Route serving user page for admin
 * @name User profile page for admin
 * @path {GET} /user/*
 * @auth AdminAuth required
 */
router.get('/user/*',adminAuth, (req, res) => {
    res.sendFile(path.join(frontendPath, '/profile_admin.html'))
});

router.get('/admins', superAdminAuth, (req, res)=>{
    res.sendFile(path.join(frontendPath, '/adminList.html'))
});

/**
 * Route serving not found
 * @name 404
 * @path {GET} /*
 */
router.get('*', function (req, res) {

    res.sendFile(path.join(frontendPath, '/404.html'))
});

module.exports = router;
