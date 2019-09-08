const mongoose = require('mongoose');
const connection = require('../config/db');

const facultySchema = mongoose.Schema({
  id: String,
  Name: String,
    OfficialName: String,
    DirName: String,
  AdditionStopped: Boolean,
  CritsId: String
});

const Faculty = connection.model('Faculty', facultySchema);

module.exports = Faculty;
