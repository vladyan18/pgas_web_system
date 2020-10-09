'use strict';
const express = require('express');
// eslint-disable-next-line new-cap
const router = express.Router();
const adminAuthCheck = require('../../../middlewares/authCheck').admin;
const moderatorAuthCheck = require('../../../middlewares/authCheck').moderator;
const observerAuthCheck = require('../../../middlewares/authCheck').observer;
const adminService = require('../../../services/admin');
const userService = require('../../../services/user');
const documentsService = require('../../../services/documents');

router.post('/comment', moderatorAuthCheck,
    async function(req, res) {
        await adminService.comment(req.body.Id, req.body.comment);
        res.sendStatus(200);
    });

router.post('/adm_update_achieve', moderatorAuthCheck,
    async function(req, res) {
        const achievement = req.body;
        await adminService.changeAchievement(achievement, req.userId);
        res.sendStatus(200);
    });

router.post('/AchSuccess', moderatorAuthCheck,
    async function(req, res) {
        await adminService.changeAchievementStatus(req.body.UserId, req.body.Id, 'Accept');
        res.sendStatus(200);
    });

router.post('/AchFailed', moderatorAuthCheck,
    async function(req, res) {
        await adminService.changeAchievementStatus(req.body.UserId, req.body.Id, 'Decline');
        res.sendStatus(200);
    });

router.get('/getUsersForAdmin', observerAuthCheck,
    async function(req, res) {
        const usersList = await adminService.getUsersForAdmin(req.query.faculty);
        res.send({Info: usersList});
    });

router.get('/userForAdmin', moderatorAuthCheck, // TODO refactor
    async function(req, res) {
        const userId = await req.query.id;
        const user = await userService.getUserInfo(userId);
        if (user) {
            res.status(200).send(user);
        } else res.sendStatus(404);
    });

router.get('/checked', observerAuthCheck,
    async function(req, res) {
        const usersList = await adminService.getUsersForAdmin(req.query.faculty, true);
        res.send({Info: usersList});
    });

router.get('/getRating', observerAuthCheck,
    async function(req, res) {
        const users = await adminService.getRating(req.query.faculty);
        res.status(200).send({Users: users});
    });

router.post('/AddToRating', moderatorAuthCheck,
    async function(req, res) {
        await adminService.addUserToRating(req.body.Id);
        res.sendStatus(200);
    });

router.post('/RemoveFromRating', moderatorAuthCheck,
    async function(req, res) {
        await adminService.removeUserFromRating(req.body.Id);
        res.sendStatus(200);
    });

router.post('/setUserRole', adminAuthCheck,
    async function(req, res) {
        const newRole = req.body.newRole;
        await adminService.changeUserRole(req.userId, req.body.id, newRole, req.body.faculty);
        res.sendStatus(200);
    });

router.get('/getAdmins', adminAuthCheck,
    async function(req, res) {
        const admins = await adminService.getAdmins(req.query.faculty, req.userId);
        res.status(200).send(admins);
    });

router.get('/getResultTable', observerAuthCheck,
    async function(req, res) {
        const [filePromise, fileName] = await documentsService.getResultTable(req.query.faculty);

        res.attachment(fileName);
        res.send(await filePromise);
    });

router.get('/getStatistics', observerAuthCheck,
    async function(req, res) {
        const statistics = await adminService.getStatisticsForFaculty(req.query.faculty);
        res.status(200).send(statistics);
    });

router.get('/getHistory', moderatorAuthCheck, // TODO IMPLEMENT
    async function(req, res) {
        throw new Error('Not implemented');
    });

router.get('/subscribeOnUsersUpdates', observerAuthCheck,
    async function(req, res) {
       adminService.subscribeForUsersUpdate(req.query.faculty, false, req, res).then();
    });

module.exports = router;
