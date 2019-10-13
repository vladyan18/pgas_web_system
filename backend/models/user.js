const mongoose = require('mongoose');
const connection = require('../config/db');

const userSchema = mongoose.Schema({
  id: String,
    SpbuId: String,
  Role: String,
  Rights: [String],
  Registered: Boolean,
  LastName: String,
  Patronymic: String,
  Birthdate: Date,
  FirstName: String,
  Faculty: String,
  Direction: String,
  Course: Number,
  Type: String,
  Ball: Number,
  Achievement: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Achieve'
  }],
    IsInRating: Boolean,
    IsHiddenInRating: Boolean,
    Confirmations: [String],
    Settings: {}
});

const User = connection.model('User', userSchema);

module.exports = User;
