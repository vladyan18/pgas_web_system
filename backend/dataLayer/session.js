'use strict';

const { SessionsModel } = require('../models');

exports.checkSessionValidity = async function(sessionId) {
    let session = await SessionsModel.findOne({_id: sessionId}).lean();
    return !!session;
};