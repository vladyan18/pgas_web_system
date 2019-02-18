const mongoose = require('mongoose')
const connection = require('../config/db')

const achieveSchema = mongoose.Schema({
  date: String,
  crit: String,
  cycle: String,
  dspo: String,
  index: String,
  index_type: String,
  indiv: String,
  izd: String,
  lead: String,
  level: String,
  o4no: String,
  organise: String,
  part: String,
  language: String,
  author: String,
  reward: String,
  role: String,
  sdnsk: String,
  student: String,
  team: String,
  tez: String,
  tv: String,
  type: String,
  ud: String,
  winner: String,
  comment: String,
  tez: String,
  files: [String],
  status: String
})

const Achieve = connection.model('Achieve', achieveSchema)

module.exports = Achieve