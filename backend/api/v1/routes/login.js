'use strict';
const express = require('express');
// eslint-disable-next-line new-cap
const router = express.Router();
const loginService = require('../../../services/login');
const authenticate = require('../../../middlewares/authenticate');

router.post('/login', authenticate,
    async function(req, res) {
        if (!req.user) {
            return res.sendStatus(400);
        }
        req.logIn(req.user, async function(err) {
            if (err) {
                console.log('ERR', err);
                return res.sendStatus(500);
            }
            res.sendStatus(200);
        });
});

router.get('/logout',
    async function(req, res) {
    req.session.destroy();
    req.logout();
    res.redirect('/home');
});

module.exports = router;