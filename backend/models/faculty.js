const mongoose = require('mongoose');
const connection = require('../config/db');

const facultySchema = mongoose.Schema({
  Name: String,
    OfficialName: String,
    DirName: String,
    Directions: [String],
    AdditionStopped: Boolean,
    CritsId: String,
    AnnotationsToCritsId: String
});

const Faculty = connection.model('Faculty', facultySchema);

module.exports = Faculty;
