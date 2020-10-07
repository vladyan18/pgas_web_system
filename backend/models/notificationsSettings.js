const mongoose = require('mongoose');
const connection = require('../config/db');

const notificationsSchema = mongoose.Schema({
    userId: String,
    email: String,
    endpoints: [{
        endpointType: String,
        endpoint: {},
        sessionId: String,
    }],
});

const NotificationsSettings = connection.model('NotificationsSettings', notificationsSchema);

module.exports = NotificationsSettings;
