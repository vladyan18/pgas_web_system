const express = require('express')
const router = express.Router()
const userController = require('../controllers/userController.js')
const adminController = require('../controllers/adminController.js')

router.get('/getUserInfo', userController.dynamic)

router.post('/add_achieve', userController.addAchieve)

router.get('/getUsersForAdmin', adminController.dynamic)

router.post('/AchSuccess', adminController.AchSuccess)

router.post('/AchFailed', adminController.AchFailed)

router.get('/checked', adminController.Checked)

router.get('/getRating', adminController.getRating)

router.get('/user=*', adminController.allUsers)


module.exports = router