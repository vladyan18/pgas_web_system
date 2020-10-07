const mongoose = require('mongoose');
const connection = require('../config/db');

const sessionsSchema = mongoose.Schema({
    _id: String,
    expires: Date,
    session: String,
});

const Sessions = connection.model('Sessions', sessionsSchema);

module.exports = Sessions;
