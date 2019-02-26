const mongoose = require('mongoose')
const connection = require('../config/db')

const criteriasSchema = mongoose.Schema({
  FacultyName: String,
  Date: Date,
  Crits: String
})

const Criterias = connection.model('Criterias', criteriasSchema)

module.exports = Criterias
