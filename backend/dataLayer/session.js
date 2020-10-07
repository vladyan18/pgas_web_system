'use strict';

const { SessionsModel } = require('../models');

exports.checkSessionValidity = async function(sessionId) {
    const session = await SessionsModel.findOne({_id: sessionId}).lean();
    return !!session;
};
