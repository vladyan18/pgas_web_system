const mongoose = require('mongoose')
const connection = require('../config/db')

const achieveSchema = mongoose.Schema({
  date: String,
  crit: String,
  chars: [String],
  files: [String],
  status: String,
    achievement: String,
    comment: String,
    ball: Number
})

const Achieve = connection.model('Achieve', achieveSchema)

module.exports = Achieve