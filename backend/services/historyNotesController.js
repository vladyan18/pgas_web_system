const db = require('../dataLayer');


module.exports.getHistory = async function(req, res) {
  const notes = await db.getHistoryNotes();

  const History = [];

  for (let i = 0; i < notes.length; i++) {
    const note = {};
    if (notes[i].Action === 'Success' || notes[i].Action === 'Decline') {
      const author = await db.findUserById(notes[i].AuthorID);
      note.Author = author.LastName + ' ' + author.FirstName;
      const targetUser = await db.findUserById(notes[i].TargetUserID);
      note.TargetUser = targetUser.FirstName + ' ' + targetUser.LastName;
      const ach = await db.findAchieveById(notes[i].TargetAchID);
      note.Crit = ach.crit;
      note.AchText = ach.achievement;
      note.AchID = ach._id.toString();
      note.TargetUserID = targetUser._id.toString();
      note.Type = notes[i].Action;
      note.Date = notes[i].Date;
      History.push(note);
    }
  }
  res.status(200).send({History});
};

module.exports.writeToHistory = async function(req, TargetAchID, TargetUserID, Action, Args) {
  const note = {};
  const options = {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  };
  note.Date = new Date().toLocaleString('ru', options);
  let id;
  if (req.user._json.email) {
    id = req.user._json.email;
  } else id = req.user.user_id;
  note.AuthorID = id;
  note.TargetAchID = TargetAchID;
  note.TargetUserID = TargetUserID;
  note.Action = Action;
  if (Action === 'Change') {
    note.Args = {};
    note.Args['from'] = Args.from;
    note.Args['to'] = Args.to;
  }

  db.createHistoryNote(note).then();
};
