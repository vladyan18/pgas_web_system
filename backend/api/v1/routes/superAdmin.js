'use strict';
const express = require('express');
// eslint-disable-next-line new-cap
const router = express.Router();
const adminService = require('../../../services/admin');
const facultyService = require('../../../services/faculty');
const superAdminAuthCheck = require('../../../middlewares/authCheck').superAdmin;

router.get('/confitmationsStatistics', superAdminAuthCheck,
    async function(req, res) {
        const result = await adminService.getconfitmationsStatistics();
        res.status(200).send(result);
    });

router.get('/purgeConfirmations', superAdminAuthCheck,
    async function(req, res) {
        const result = await adminService.purgeConfirmations();
        res.status(200).send(result);
    });

router.get('/getData', superAdminAuthCheck,
    async function(req, res) {
        const result = await adminService.getData();
        res.status(200).send(JSON.stringify(result));
    });

router.post('/createFaculty', superAdminAuthCheck,
    async function(req, res) {
        const result = await facultyService.createFaculty(req.body);
        res.status(200).send(result);
    });

/*
router.get('/recalculate', superAdminAuth, adminController.recalculate);

router.post('/createAdmin', superAdminAuth, adminController.createAdmin);

*/

module.exports = router;
