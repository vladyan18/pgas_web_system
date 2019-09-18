const mongoose = require('mongoose');
const connection = require('../config/db');

const confirmationSchema = mongoose.Schema({
    Name: String,
    Type: String,
    Data: String,
    SZ: {},
    CreationDate: Date,
    FilePath: String,
    Size: Number,
    IsCrawled: Boolean,
    CrawlResult: {}
});

const Confirmation = connection.model('Confirmation', confirmationSchema);

module.exports = Confirmation;
