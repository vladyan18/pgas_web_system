const express = require('express')
const router = express.Router()
const userController = require('../controllers/userController.js')
const adminController = require('../controllers/adminController.js')
const docxController = require('../controllers/docxController')
const facultyController = require('../controllers/facultyController')
const db = require('../controllers/dbController.js')

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

const regAuth = (req, res, next) => {
    if (req.isAuthenticated()) {
        console.log(req.body)
        next()
    }
    else {
        return res.redirect('/login')
    }
}

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

router.get('/getUserInfo', auth, userController.dynamic)

router.get('/getProfile', auth, userController.getProfile)

router.post('/comment', adminAuth, adminController.Comment)

router.post('/add_achieve', auth, userController.addAchieve)

router.post('/update_achieve', auth, userController.updateAchieve)

router.post('/delete_achieve', auth, userController.deleteAchieve)

router.get('/getAnket', auth, docxController.getAnket)

router.get('/getAch/', auth, userController.getAch)

router.post('/registerUser',regAuth, userController.registerUser)

router.post('/adm_update_achieve', adminAuth, adminController.updateAchieve)

router.get('/getUsersForAdmin', adminAuth, adminController.dynamic)

router.post('/AchSuccess', adminAuth, adminController.AchSuccess)

router.post('/AchFailed', adminAuth, adminController.AchFailed)

router.post('/AddToRating', adminAuth, adminController.AddToRating)

router.post('/RemoveFromRating', adminAuth, adminController.RemoveFromRating)

router.post('/setUser', adminAuth, adminController.setUser)

router.post('/setAdmin', adminAuth, adminController.setAdmin)

router.get('/checked', adminAuth, adminController.Checked)

router.get('/getFaculty', auth, facultyController.getFaculty)

router.get('/getRating', adminAuth, adminController.getRating)

router.get('/getAdmins',adminAuth, adminController.getAdmins)

router.get('/user=*',adminAuth, adminController.allUsers)

router.get('/getResultTable', adminAuth, docxController.getResultTable)


module.exports = router