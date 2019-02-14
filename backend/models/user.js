const mongoose = require('mongoose')
const connection = require('../config/db')

const userSchema = mongoose.Schema({
    Token: String,
    FirstName: String,
    LastName: String,
    Notes: [String]
})

const User = connection.model('User', userSchema)

module.exports = User