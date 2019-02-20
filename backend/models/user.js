const mongoose = require('mongoose')
const connection = require('../config/db')

const userSchema = mongoose.Schema({
  id: String,
  LastName: String,
  FirstName: String,
  Ball: Number,
  Achievement: [String]
})

const User = connection.model('User', userSchema)

module.exports = User
