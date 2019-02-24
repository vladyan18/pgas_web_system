const mongoose = require('mongoose')
const connection = require('../config/db')

const userSchema = mongoose.Schema({
  id: String,
  Role: String,
  Registered: Boolean,
  LastName: String,
  Patronymic: String,
  FirstName: String,
  Faculty: String,
  Course: Number,
  Type: String,
  Ball: Number,
  Achievement: [String]
})

const User = connection.model('User', userSchema)

module.exports = User
