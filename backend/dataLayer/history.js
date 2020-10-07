'use strict';

const { HistoryNoteModel } = require('../models');

exports.getHistoryNotes = async function() {
    return HistoryNoteModel.find({});
};

exports.createHistoryNote = async function(historyNote) {
    return HistoryNoteModel.create(historyNote);
};
