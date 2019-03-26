/** Express router providing API
 * @module API
 * @requires express
 * @requires userController
 */

/**
 * express module
 * @const
 */
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController.js');
const adminController = require('../controllers/adminController.js');
const docxController = require('../controllers/docxController');
const facultyController = require('../controllers/facultyController');
const notifyController = require('../controllers/notificationController');
const historyController = require('../controllers/historyNotesController');
const db = require('../controllers/dbController.js');

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
 * Route serving user info (with achieves)
 * @name getUserInfo
 * @path {GET} /getUserInfo
 * @auth
 * @see module:userController~dynamic
 */
router.get('/getUserInfo', auth, userController.dynamic);

/**
 * Route serving user info (without achieves)
 * @name getProfile
 * @path {GET} /getProfile
 * @auth
 * @see module:userController~getProfile
 */
router.get('/getProfile', auth, userController.getProfile);

/**
 * Add comment
 * @name comment
 * @path {POST} /comment
 * @auth adminAuth required
 */
router.post('/comment', adminAuth, adminController.Comment);

/**
 * Add achievement
 * @name add_achieve
 * @path {POST} /add_achieve
 * @auth
 * @see module:userController~addAchieve
 */
router.post('/add_achieve', auth, userController.addAchieve);

/**
 * Change achievement
 * @name update_achieve
 * @path {POST} /update_achieve
 * @auth
 * @see module:userController~updateAchieve
 */
router.post('/update_achieve', auth, userController.updateAchieve);

/**
 * Delete achievement
 * @name delete_achieve
 * @path {POST} /delete_achieve
 * @auth
 * @see module:userController~deleteAchieve
 */
router.post('/delete_achieve', auth, userController.deleteAchieve);

/**
 * Download anket
 * @name getAnket
 * @path {GET} /getAnket
 * @auth
 */
router.get('/getAnket', auth, docxController.getAnket);

/**
 * Get achievement for user
 * @name getAch
 * @path {GET} /getAch
 * @auth
 * @see module:userController~getAch
 */
router.get('/getAch/', auth, userController.getAch);

/**
 * Register user after login or profile edition
 * @name registerUser
 * @path {POST} /registerUser
 * @auth regAuth required
 * @see module:userController~registerUser
 */
router.post('/registerUser', regAuth, userController.registerUser);

/**
 * Save changes in achievement which admin did
 * @name adm_update_achieve
 * @path {POST} /adm_update_achieve
 * @auth adminAuth required
 */
router.post('/adm_update_achieve', adminAuth, adminController.updateAchieve);

/**
 * Get all new candidates for admin
 * @name getUsersForAdmin
 * @path {GET} /getUsersForAdmin
 * @auth adminAuth required
 */
router.get('/getUsersForAdmin', adminAuth, adminController.dynamic);

/**
 * Approve achievement
 * @name AchSuccess
 * @path {POST} /AchSuccess
 * @auth adminAuth required
 */
router.post('/AchSuccess', adminAuth, adminController.AchSuccess);

/**
 * Decline achievement
 * @name AchFailed
 * @path {POST} /AchFailed
 * @auth adminAuth required
 */
router.post('/AchFailed', adminAuth, adminController.AchFailed);

/**
 * Add user to rating
 * @name AddToRating
 * @path {POST} /AddToRating
 * @auth adminAuth required
 */
router.post('/AddToRating', adminAuth, adminController.AddToRating);

/**
 * Remove user from rating
 * @name RemoveFromRating
 * @path {POST} /RemoveFromRating
 * @auth adminAuth required
 */
router.post('/RemoveFromRating', adminAuth, adminController.RemoveFromRating);

/**
 * Set role as user
 * @name setUser
 * @path {POST} /setUser
 * @auth adminAuth required
 */
router.post('/setUser', adminAuth, adminController.setUser);

/**
 * Set role as admin
 * @name setAdmin
 * @path {POST} /setAdmin
 * @auth adminAuth required
 */
router.post('/setAdmin', adminAuth, adminController.setAdmin);

/**
 * Get current candidates for admin
 * @name checked
 * @path {GET} /checked
 * @auth adminAuth required
 */
router.get('/checked', adminAuth, adminController.Checked);

router.get('/getFaculty', auth, facultyController.getFaculty);

/**
 * Get current rating for admin
 * @name getRating
 * @path {GET} /getRating
 * @auth adminAuth required
 */
router.get('/getRating', adminAuth, adminController.getRating);

router.get('/getAdmins', adminAuth, adminController.getAdmins);

/**
 * Get user data for admin
 * @name user
 * @path {GET} /user=*
 * @auth adminAuth required
 */
router.get('/user=*', adminAuth, adminController.getUser);

/**
 * Toggle hide state of candidate
 * @name toggleHide
 * @path {POST} /toggleHide
 * @auth adminAuth required
 */
router.post('/toggleHide', adminAuth, adminController.toggleHide);

/**
 * Register as listener for users data updates
 * @name waitForUpdates
 * @path {GET} /waitForUpdates
 * @auth adminAuth required
 */
router.get('/waitForUpdates', adminAuth, adminController.waitForUpdates);

/**
 * Register as listener for notifications
 * @name waitForNotify
 * @path {GET} /waitForNotify
 * @auth adminAuth required
 */
router.get('/waitForNotify', adminAuth, notifyController.waitForNotifies);

/**
 * Download .xlsx table with final results
 * @name getResultTable
 * @path {GET} /getResultTable
 * @auth adminAuth required
 */
router.get('/getResultTable', adminAuth, docxController.getResultTable);

/**
 * Get actions history data
 * @name getHistory
 * @path {GET} /getHistory
 * @auth adminAuth required
 */
router.get('/getHistory', adminAuth, historyController.GetHistory);


module.exports = router;