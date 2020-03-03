const mongoose = require('mongoose');
const connection = require('../config/db');

const annotationSchema = mongoose.Schema({
  FacultyId: String,
  Date: Date,
  AnnotationsToCrits: {},
  LearningProfile: String,
});

const Annotation = connection.model('Annotation', annotationSchema);

module.exports = Annotation;
