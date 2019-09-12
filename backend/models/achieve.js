const mongoose = require('mongoose');
const connection = require('../config/db');

const achieveSchema = mongoose.Schema({
  date: String,
  crit: String,
  chars: [String],
  confirmations: [String],
  status: String,
  achDate: Date,
  achievement: String,
  comment: String,
  ball: Number,
  SZ: {}
});

const Achieve = connection.model('Achieve', achieveSchema);

module.exports = Achieve;