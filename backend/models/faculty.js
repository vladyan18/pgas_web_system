const mongoose = require('mongoose');
const connection = require('../config/db');

const facultySchema = mongoose.Schema({
  Name: String,
  OfficialName: String,
  DirName: String,
  Directions: [String],
  AdditionStopped: Boolean,
  CritsId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Criterias',
  },
  AnnotationsToCritsId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Annotation',
  },
});

const Faculty = connection.model('Faculty', facultySchema);

module.exports = Faculty;
