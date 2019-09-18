const mongoose = require('mongoose');
const connection = require('../config/db');

const achieveSchema = mongoose.Schema({
  date: String,
  crit: String,
  chars: [String],
    confirmations: [{}],
  status: String,
  achDate: Date,
    endingDate: Date,
  achievement: String,
  comment: String,
  ball: Number,
    isArchived: Boolean,
});

const Achieve = connection.model('Achieve', achieveSchema);

module.exports = Achieve;