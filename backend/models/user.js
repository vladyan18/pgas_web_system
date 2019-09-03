const mongoose = require('mongoose');
const connection = require('../config/db');

const userSchema = mongoose.Schema({
  id: String,
  Role: String,
  Rights: [String],
  Registered: Boolean,
  LastName: String,
  Patronymic: String,
  Birthdate: Date,
  FirstName: String,
  Faculty: String,
  Course: Number,
  Type: String,
  Ball: Number,
  Achievement: [String],
    IsInRating: Boolean,
    IsHiddenInRating: Boolean
});

const User = connection.model('User', userSchema);

module.exports = User;
