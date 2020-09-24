'use strict';
const express = require('express');
// eslint-disable-next-line new-cap
const router = express.Router();
const authCheck = require('../../../middlewares/authCheck').user;
const superAuthCheck = require('../../../middlewares/authCheck').superAdmin;
const criteriasService = require('../../../services/criterias');

const path = require('path');
const fs = require('fs');
const upload = require(path.join(__dirname, '../../../config/multer'));
const uploadsPath = path.join(__dirname, '../../../docs/');
if (!fs.existsSync(uploadsPath)) {
    fs.mkdirSync(uploadsPath);
}

router.get('/getAllCriterias', superAuthCheck,
    async function(req, res) {
        try {
            const criterias = await criteriasService.getAllCriterias();
            if (criterias) {
                res.status(200).send(criterias);
            } else res.status(404).send({Error: 404});
        } catch (e) {
            res.status(500).send(e);
        }
    });

router.get('/getCriterias', authCheck,
    async function(req, res) {
        try {
            const criterias = await criteriasService.getRawCriteriasAndLimits(req.query.faculty);
            if (criterias) {
                res.status(200).send(criterias);
            } else res.status(404).send({Error: 404, facultyRawName: req.user.facultyRawName});
        } catch (e) {
            res.status(500).send(e);
        }
    });

router.get('/getCriteriasAndSchema', authCheck,
    async function(req, res) {
        try {
            const criteriasAndSchema = await criteriasService.getCriteriasAndSchema(req.query.faculty);
            if (criteriasAndSchema) {
                res.status(200).send(criteriasAndSchema);
            } else res.status(404).send({});
        } catch (e) {
            console.log(e);
            res.status(500).send(e);
        }
    });

router.post('/uploadCriterias', superAuthCheck,
    async function(req, res) {
        upload(req, res, async function(err) {
            if (err) {
                return res.status(400).send('ERROR: Max file size = 15MB');
            }

            const result = await criteriasService.uploadCriterias(req.file.path, req.body.faculty);
            res.status(200).send(result);
        });
    });

router.post('/saveCriterias', superAuthCheck,
    async function(req, res) {
        await criteriasService.saveCriterias(req.body.crits, req.body.faculty);
        return res.sendStatus(200);
    });

router.get('/getAnnotations', authCheck,
    async function(req, res) {
        const annotations = await criteriasService.getAnnotations(req.query.faculty);
        if (annotations) {
            res.status(200).send(annotations);
        } else res.sendStatus(404);
    });

router.post('/updateAnnotations', authCheck,
    async function(req, res) {
        await criteriasService.updateAnnotations(req.body.annotations, req.body.learningProfile, req.body.languagesForPublications, req.body.faculty);
        return res.sendStatus(200);
    });


module.exports = router;
