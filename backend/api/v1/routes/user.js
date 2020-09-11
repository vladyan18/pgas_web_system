'use strict';
const express = require('express');
// eslint-disable-next-line new-cap
const router = express.Router();
const authCheck = require('../../../middlewares/authCheck').user;
const regCheck = require('../../../middlewares/authCheck').registration;
const userService = require('../../../services/user');
const documentService = require('../../../services/documents');
const facultyService = require('../../../services/faculty');
const fs = require('fs');
const path = require('path');
const uploadConfirmation = require( '../../../config/confirmationMulter');
const uploadsConfirmationsPath = path.join(__dirname, '../../../static/confirmations'); //TODO
if (!fs.existsSync(uploadsConfirmationsPath)) {
    fs.mkdirSync(uploadsConfirmationsPath);
}


router.get('/isAuth',
    async function(req, res) {
        if (req.isAuthenticated()) {
            res.json({
                success: true,
                message: 'user has successfully authenticated',
                role: req.user.Role,
                rights: req.user.Rights,
                cookies: req.cookies,
            });
        } else res.status(401).send();
    });

router.get('/getRights', authCheck,
    async function(req, res) {
        const rights = await userService.getUserRights(req.userId);
        if (rights) {
            res.status(200).send({Role: rights.Role, Rights: rights.Rights});;
        } else {
            res.status(404).send({Error: 404});
        }
    });

router.get('/getUserInfo', authCheck,
    async function(req, res) {
        const userInfo = await userService.getUserInfo(req.userId);
        if (userInfo) {
            res.status(200).send(userInfo);
        } else {
            res.status(404).send({Error: 404});
        }
    });

router.get('/getArchivedAchievements', authCheck,
    async function(req, res) {
        const achievements = await userService.getArchivedAchievements(req.userId);
        if (achievements) {
            res.status(200).send(achievements);
        } else res.status(404).send({Error: 404});
    });

router.get('/getProfile', authCheck,
    async function(req, res) {
        const profile = await userService.getProfile(req.userId);
        if (profile) {
            res.status(200).send(profile);
        } else res.status(404).send({Error: 404, facultyRawName: req.user.facultyRawName});
    });

router.post('/registerUser', regCheck,
    async function(req, res) {
        try {
            const userData = req.body;
            console.log('New registration: ', userData);
            await userService.registerUser(req.userId, userData, req.session);
            res.sendStatus(200);
        } catch (err) {
            console.log(err);
            res.status(500).send(err);
        }
    });

router.post('/add_achieve', authCheck,
    async function(req, res) {
        const achievement = req.body.data;
        try {
            await userService.addAchievement(req.userId, achievement);
        } catch (error) {
            console.log(error);
            if (error.name === 'TypeError') {
                return res.sendStatus(400);
            } else throw error;
        }

        res.sendStatus(200);
    });

router.post('/update_achieve', authCheck,
    async function(req, res) {
        const achievement = req.body.data;
        const achId = req.body.achId;
        try {
            await userService.updateAchievement(req.userId, achId, achievement);
        } catch (error) {
            if (error.name === 'TypeError') {
                res.sendStatus(400);
            } else throw error;
        }
        res.sendStatus(200);
    });

router.post('/delete_achieve', authCheck,
    async function(req, res) {
        try {
            const result = await userService.deleteAchievement(req.userId, req.body.achId);
            if (result) {
                res.sendStatus(200);
            } else {
                res.sendStatus(404);
            }
        } catch (err) {
            console.log(err);
            res.status(500).send(err);
        }
    });

router.get('/getAch/', authCheck,
    async function(req, res) {
        const id = req.query.achievement;
        const ach = await userService.getAchievement(id);
        res.status(200).send(ach);
    });

router.post('/add_file_for_confirmation', authCheck,
    async function(req, res) {
        uploadConfirmation(req, res, async function(err) {
            if (err) {
                return res.status(400).send('ERROR: Max file size = 15MB');
            }

            const confirmation = JSON.parse(req.body.data);
            confirmation.FilePath = req.file.path;
            confirmation.Data = '/api/getConfirm/' + req.file.filename;
            confirmation.CreationDate = Date.now();
            confirmation.Size = req.file.size;

            const result = await userService.addFileForConfirmation(req.userId, confirmation);
            res.status(200).send(result);
        });
    });

router.post('/add_confirmation', authCheck,
    async function(req, res) {
        const confirmation = req.body;
        confirmation.CreationDate = Date.now();
        const result = await userService.addConfirmation(req.userId, confirmation);
        res.status(200).send(result);
    });

router.post('/delete_confirmation', authCheck,
    async function(req, res) {
        const confirmationId = req.body.id;
        const result = await userService.deleteConfirmation(req.userId, confirmationId);
        res.status(200).send(result);
    });

router.get('/getConfirm/*', authCheck, // TODO SECURITY
    async function(req, res) {
        let filename = await req.url.slice(12);
        const filePath = path.join(__dirname, '../../../static/confirmations/' + filename);

        try {
            await fs.promises.access(filePath);
        } catch (error) {
            res.sendStatus(404);
        }

        filename = filename
            .substr(filename.search('-') + 1)
            .substr(filename.search('-') + 1);

        const file = fs.createReadStream(filePath);
        const stat = await fs.promises.stat(filePath);
        res.setHeader('Content-Length', stat.size);
        let contentType, contentDisposition;
        if (filename.endsWith('.pdf')) {
            contentType = 'application/pdf';
            contentDisposition = 'inline';
        } else if (filename.endsWith('.jpg') || filename.endsWith('.png') ) {
            const ending = filename.endsWith('.jpg') ? 'jpg' : 'png';
            contentType = 'image/' + ending;
            contentDisposition = 'inline';
        } else {
            contentType = 'application/octet-stream';
            contentDisposition = 'inline; filename=' + filename;
            res.setHeader('Content-Transfer-Encoding', 'binary');
        }
        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Disposition', contentDisposition);
        file.pipe(res);
    });

router.get('/getConfirmations', authCheck,
    async function(req, res) {
        const confirms = await userService.getConfirmations(req.userId);
        res.status(200).send(confirms);
    });

router.get('/getRatingForUser', authCheck,
    async function(req, res) {
        const users = await userService.getRating(req.userId, req.query.faculty);
        res.status(200).send({Users: users});
    });

router.get('/getAnket', authCheck,
    async function(req, res) {
        const [archive, fileName] = await documentService.getAnket(req.userId);
        res.attachment(fileName);
        res.send(archive);
    });

router.get('/getFaculty', authCheck,
    async function(req, res) {
        const faculty = await facultyService.getFaculty(req.query.name);
        if (faculty) {
            res.status(200).send(faculty);
        } else res.sendStatus(404);
    });

router.get('/getFacultiesList', authCheck,
    async function(req, res) {
        const list = await facultyService.getFacultiesList();
        res.status(200).send({list: list});
    });
module.exports = router;