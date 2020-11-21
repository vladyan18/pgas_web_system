'use strict';

const { HistoryNoteModel } = require('../models');

exports.getHistoryNotesForAchievement = async function(achId) {
    return HistoryNoteModel.find({targetAchId: achId}, '-_id -__v').populate({path: 'authorId', select: 'FirstName LastName Patronymic id -_id'}).lean();
};

exports.createHistoryNote = async function(historyNote) {
    return HistoryNoteModel.create(historyNote);
};
