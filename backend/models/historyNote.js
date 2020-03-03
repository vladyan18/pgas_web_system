const mongoose = require('mongoose');
const connection = require('../config/db');

const historyNoteSchema = mongoose.Schema({
  Date: Date,
  AuthorID: String,
  TargetAchID: String,
  TargetUserID: String,
  Action: String,
  Args: {},
});

const historyNote = connection.model('historyNote', historyNoteSchema);

module.exports = historyNote;
