const db = require('../dataLayer');
const {statusCheck} = require('../helpers');

module.exports.getHistoryForAchievement = async function(achId) {
    return db.getHistoryNotesForAchievement(achId);
};

module.exports.writeStatusChange = async function(authorId, targetUserId, targetAchId, newStatus) {
  let action;
  if (statusCheck.isAccepted({status: newStatus})) {
      action = 'Accept';
  } else if (statusCheck.isDeclined({status: newStatus})) {
      action = 'Decline';
  }
  if (!action) return;

  return module.exports.writeToHistory(authorId, targetUserId, targetAchId, action);
};

module.exports.writeToHistory = async function(authorId, targetUserId, targetAchId, action, args) {
  const options = {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  };
  const author = await db.findUserById(authorId);
  const note = {
    date: new Date().toLocaleString('ru', options),
    authorId: author._id,
    targetAchId,
    targetUserId,
    action,
  };
  if (action === 'Change') {
    note.args = {};
    note.args.from = args.from;
    note.args.to = args.to;
  }

  db.createHistoryNote(note).then();
};
