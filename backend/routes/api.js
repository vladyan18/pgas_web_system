const express = require('express')
const router = express.Router()
const userController = require('../controllers/userController.js')

router.post('/addNote', userController.addNote )

router.post('/searchNote', userController.searchNote )

router.get('/showMyNotes', userController.getNotes)

router.get('/showMySearchNotes', userController.getSearchNotes)

router.get('/HelloMyDearUser', userController.getUser)

router.post('/deleteNote', userController.deleteNote)

module.exports = router