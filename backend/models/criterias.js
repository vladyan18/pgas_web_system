const mongoose = require('mongoose');
const connection = require('../config/db');

const criteriasSchema = mongoose.Schema({
  FacultyId: String,
  Date: Date,
  Crits: String,
  CritsSchema: String,
  Limits: [],
  Hash: String,
});

const Criterias = connection.model('Criterias', criteriasSchema);

module.exports = Criterias;
