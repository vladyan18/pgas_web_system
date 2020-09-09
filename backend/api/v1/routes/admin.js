'use strict';
const express = require('express');
// eslint-disable-next-line new-cap
const router = express.Router();
const adminAuthCheck = require('../../../middlewares/authCheck').admin;
const adminService = require('../../../services/admin');
const userService = require('../../../services/user');
const documentsService = require('../../../services/documents');

router.post('/comment', adminAuthCheck,
    async function(req, res) {
        await adminService.comment(req.body.Id, req.body.comment);
        res.sendStatus(200);
    });

router.post('/adm_update_achieve', adminAuthCheck,
    async function(req, res) {
        const achievement = req.body;
        await adminService.changeAchievement(achievement, req.userId);
        res.sendStatus(200);
    });

router.post('/AchSuccess', adminAuthCheck,
    async function(req, res) {
        await adminService.changeAchievementStatus(req.body.UserId, req.body.Id, 'Accept');
        res.sendStatus(200);
    });

router.post('/AchFailed', adminAuthCheck,
    async function(req, res) {
        await adminService.changeAchievementStatus(req.body.UserId, req.body.Id, 'Decline');
        res.sendStatus(200);
    });

router.get('/getUsersForAdmin', adminAuthCheck,
    async function(req, res) {
        const usersList = await adminService.getUsersForAdmin(req.query.faculty);
        res.send({Info: usersList});
    });

router.get('/user=*', adminAuthCheck, // TODO refactor
    async function(req, res) {
        const userId = await req.url.slice(6);
        const user = await userService.getUserInfo(userId);
        res.status(200).send(user);
    });

router.get('/checked', adminAuthCheck,
    async function(req, res) {
        const usersList = await adminService.getUsersForAdmin(req.query.faculty, true);
        res.send({Info: usersList});
    });

router.get('/getRating', adminAuthCheck,
    async function(req, res) {
        const users = await adminService.getRating(req.query.faculty);
        res.status(200).send({Users: users});
    });

router.post('/AddToRating', adminAuthCheck,
    async function(req, res) {
        await adminService.addUserToRating(req.body.Id);
        res.sendStatus(200);
    });

router.post('/RemoveFromRating', adminAuthCheck,
    async function(req, res) {
        await adminService.removeUserFromRating(req.body.Id);
        res.sendStatus(200);
    });

router.post('/setUser', adminAuthCheck,
    async function(req, res) {
        await adminService.changeUserRole(req.body.Id, false);
        res.sendStatus(200);
    });

router.post('/setAdmin', adminAuthCheck,
    async function(req, res) {
        await adminService.changeUserRole(req.body.Id, true);
        res.sendStatus(200);
    });

router.get('/getAdmins', adminAuthCheck,
    async function(req, res) {
        const users = await adminService.getAdmins();
        res.status(200).send({Users: users});
    });

router.get('/getResultTable', adminAuthCheck,
    async function(req, res) {
        const [filePromise, fileName] = await documentsService.getResultTable(req.query.faculty);

        res.attachment(fileName);
        res.send(await filePromise);
    });

router.get('/getStatistics', adminAuthCheck,
    async function(req, res) {
        const statistics = await adminService.getStatisticsForFaculty(req.query.faculty);
        res.status(200).send(statistics);
    });

router.get('/getHistory', adminAuthCheck, // TODO IMPLEMENT
    async function(req, res) {
        throw new Error('Not implemented');
    });

module.exports = router;
