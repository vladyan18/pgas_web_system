const mongoose = require('mongoose')
const connection = require('../config/db')

const concursSchema = mongoose.Schema({
    Faculty: String,
    AdditionStopped: Boolean,
    Rating: {}
})

const Faculty = connection.model('Faculty', facultySchema)

module.exports = Faculty