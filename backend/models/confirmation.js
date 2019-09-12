const mongoose = require('mongoose');
const connection = require('../config/db');

const confirmationSchema = mongoose.Schema({
    Name: String,
    Type: String,
    Data: String,
    CreationDate: Date,
    FilePath: String
});

const Confirmation = connection.model('Confirmation', confirmationSchema);

module.exports = Confirmation;
