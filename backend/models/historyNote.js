const mongoose = require('mongoose');
const connection = require('../config/db');

const historyNoteSchema = mongoose.Schema({
  date: Date,
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  targetAchId: String,
  targetUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  action: String,
  args: {},
});

const historyNote = connection.model('historyNote', historyNoteSchema);

module.exports = historyNote;
