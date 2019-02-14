const mongoose = require('mongoose')
const connection = require('../config/db')

const noteSchema = mongoose.Schema({
    Title: String,
    Text: String,
    Time: String,
    Important: Boolean,
    Kind: String
})

const Note = connection.model('Note', noteSchema)
    
module.exports = Note