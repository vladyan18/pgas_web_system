const express = require('express')
const router = express.Router()
const userController = require('../controllers/userController.js')
const adminController = require('../controllers/adminController.js')
const docxController = require('../controllers/docxController')

router.get('/getUserInfo', userController.dynamic)

router.post('/add_achieve', userController.addAchieve)

router.post('/update_achieve', userController.updateAchieve)

router.get('/getAnket', docxController.getAnket)

router.get('/getAch/', userController.getAch)

router.post('/registerUser', userController.registerUser)

router.get('/getUsersForAdmin', adminController.dynamic)

router.post('/AchSuccess', adminController.AchSuccess)

router.post('/AchFailed', adminController.AchFailed)

router.get('/checked', adminController.Checked)

router.get('/getRating', adminController.getRating)

router.get('/user=*', adminController.allUsers)


module.exports = router