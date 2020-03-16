
const db = require('./dbController');
const notify = require('./notificationController');
const history = require('./historyNotesController');
const Kri = require(__dirname + '/Kriterii.json');
const EventEmitter = require('events');
class UpdateEmitter extends EventEmitter {}
const AdminEmitter = new UpdateEmitter();

module.exports.setUser = async function(req, res) {
  await db.changeRole(req.body.Id, false);
  res.sendStatus(200);
};

module.exports.setAdmin = async function(req, res) {
  await db.changeRole(req.body.Id, true);
  res.status(200).send({});
};

module.exports.createAdmin = async function(req, res) {
  const User = req.body;
  await db.createUser(User);
  res.status(200).send({ok: true});
};

module.exports.getAdmins = async function(req, res) {
  const users = [];
  const Users = await db.allUsers();
  for (const user of Users) {
    const str = user.LastName + ' ' + user.FirstName + ' ' + user.Patronymic;
    users.push({Name: str, Role: user.Role, Id: user.id});
  }
  res.status(200).send({Users: users});
};

module.exports.getUsersForAdmin = async function(req, res) {
  const info = [];
  const Users = await db.getUsersWithAllInfo(req.query.faculty);

  for (const user of Users) {
    if (!user) continue;
    const str = user.LastName + ' ' + user.FirstName + ' ' + (user.Patronymic ? user.Patronymic : '');

    for (let i = 0; i < user.Achievement.length; i++) {
      for (let j = 0; j < user.Achievement[i].confirmations.length; j++) {
        if (!user.Achievement[i].confirmations[j].id) continue;

        const expandedConfirm = user.Achievement[i].confirmations[j].id;
        expandedConfirm.additionalInfo = user.Achievement[i].confirmations[j].additionalInfo;
        user.Achievement[i].confirmations[j] = expandedConfirm;
      }
    }

    if ( user.Achievement.length > 0) {
      info.push({
        Id: user._id,
        user: str,
        Course: user.Course,
        IsInRating: user.IsInRating,
        IsHiddenInRating: user.IsHiddenInRating,
        Achievements: user.Achievement,
      });
    }
  }
  res.send({Info: info});
};

module.exports.waitForUpdates = async function(req, res) {
  // eslint-disable-next-line prefer-const
  let timer;
  let flag = false;
  const callback = () => {
    setImmediate(() => {
      flag = true;
      res.sendStatus(200);
      res.end();
      clearTimeout(timer);
    });
  };

  timer = setTimeout(function() {
    AdminEmitter.removeListener('Update', callback);
    if (!flag) {
      res.sendStatus(408);
    }
  }, 300000);

  AdminEmitter.once('Update', callback);
};

module.exports.updateAchieve = async function(req, res) {
  const achieve = req.body;
  const id = req.body._id;
  let uid;
  if (req.user._json.email) {
    uid = req.user._json.email;
  } else uid = req.user.user_id;
  const user = await db.findUserById(uid);
  const isValid = await db.validateAchievement(achieve, user);
  if (!isValid) {
    return res.sendStatus(400);
  }
  const options = {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  };
  achieve.status = 'Изменено';
  achieve.isPendingChanges = false;
  achieve.date = new Date().toLocaleString('ru', options);

  const oldAchieve = await db.findAchieveById(id);
  const createdAchieve = await db.updateAchieve(id, achieve);

  const args = {};
  args.from = oldAchieve;
  args.to = createdAchieve;
  await history.writeToHistory(req, id, uid, 'Change', args);
  await module.exports.balls(uid);
  res.sendStatus(200);
  AdminEmitter.emit('Update');
  notify.emitChange(req, createdAchieve).then();
};

module.exports.acceptAchievement = async function(req, res) {
  const u = await db.findUser(req.body.UserId);
  const achievement = await db.findAchieveById(req.body.Id);
  const checkResult = await db.validateAchievement(achievement, u);
  if (!checkResult) {
    return res.sendStatus(400);
  }

  await db.changeAchieveStatus(req.body.Id, true);
  await module.exports.balls(u.id, u.Faculty);
  res.sendStatus(200);
  AdminEmitter.emit('Update');
  notify.emitSuccess(req, u).then();
  await history.writeToHistory(req, req.body.Id, u.id, 'Success');
};

module.exports.declineAchievement = async function(req, res) {
  await db.changeAchieveStatus(req.body.Id, false);
  const u = await db.findUser(req.body.UserId);
  await module.exports.balls(u.id, u.Faculty);
  AdminEmitter.emit('Update');
  res.sendStatus(200);
  notify.emitDecline(req, u).then();
  await history.writeToHistory(req, req.body.Id, u.id, 'Decline');
};

module.exports.addUserToRating = async function(req, res) {
  if (req.body.Direction) {
    await db.addUserToRating(req.body.Id, req.body.Direction);
  } else await db.addUserToRating(req.body.Id);
  res.sendStatus(200);
  AdminEmitter.emit('Update');
  notify.addToRating(req, req.body.Id).then();
};

module.exports.removeUserFromRating = async function(req, res) {
  await db.removeUserFromRating(req.body.Id);
  res.sendStatus(200);
  AdminEmitter.emit('Update');
  notify.removeFromRating(req, req.body.Id).then();
};

module.exports.comment = async function(req, res) {
  await db.comment(req.body.Id, req.body.comment);
  res.sendStatus(200);
  AdminEmitter.emit('Update');
  notify.emitComment(req, req.body.Id).then();
};

module.exports.toggleHide = async function(req, res) {
  await db.toggleHide(req.body.id);
  res.sendStatus(200);
};

module.exports.getCheckedUsers = async function(req, res) {
  const info = [];
  const Users = await db.getUsersWithAllInfo(req.query.faculty, true);

  for (const user of Users) {
    if (!user) continue;
    const str = user.LastName + ' ' + user.FirstName + ' ' + (user.Patronymic ? user.Patronymic : '');

    for (let i = 0; i < user.Achievement.length; i++) {
      for (let j = 0; j < user.Achievement[i].confirmations.length; j++) {
        if (!user.Achievement[i].confirmations[j].id) continue;

        const expandedConfirm = user.Achievement[i].confirmations[j].id;
        expandedConfirm.additionalInfo = user.Achievement[i].confirmations[j].additionalInfo;
        user.Achievement[i].confirmations[j] = expandedConfirm;
      }
    }

    if ( user.Achievement.length > 0) {
      info.push({
        Id: user._id,
        user: str,
        Course: user.Course,
        Type: user.Type,
        IsInRating: user.IsInRating,
        IsHiddenInRating: user.IsHiddenInRating,
        Achievements: user.Achievement,
        Direction: user.Direction,
      });
    }
  }
  res.send({Info: info});
};

module.exports.getUser = async function(req, res) {
  const ip = await req.url.slice(6);

  db.findUser(ip).then((User) => {
    db.findActualAchieves(User.id).then((v) => {
      User.Achs = v;
      res.status(200).send(User);
    });
  });
};

module.exports.getRating = async function(req, res) {
  const criterias = await db.getCriterias(req.query.faculty);
  const kri = JSON.parse(criterias.Crits);
  const limits = criterias.Limits;

  function getAreaNum(critName) {
    const critNum = Object.keys(kri).indexOf(critName);
    if (critNum === -1) return undefined;
    const shift = Object.keys(kri).length === 12 ? 0 : 1;

    if (critNum < 3) return 0;
    if (critNum < 5) return 1;
    if (critNum < 7) return 2;
    if (critNum < 9 + shift) return 3;
    return 4;
  }

  const users = [];
  const Users = await db.getCurrentUsers(req.query.faculty);
  for (const user of Users) {
    let sumBall = 0;
    const crits = {};
    const sums = [0, 0, 0, 0, 0];

    for (const key of Object.keys(kri)) {
      crits[key] = 0;
    }
    const Achs = await db.findActualAchieves(user.id);

    for (const ach of Achs) {
      if (!ach) continue;
      if (ach.ball) {
        crits[ach.crit] += ach.ball;
        sumBall += ach.ball;
        sums[getAreaNum(ach.crit)] += ach.ball;
      }
    }

    if (limits) {
      for (let i = 0; i < sums.length; i++) {
        if (sums[i] > limits[i]) {
          const delta = sums[i] - limits[i];
          sumBall -= delta;
        }
      }
    }

    const fio = user.LastName + ' ' + user.FirstName + ' ' + (user.Patronymic ? user.Patronymic : '');
    users.push({_id: user._id, Name: fio, Type: user.Type, Course: user.Course, Crits: crits, Ball: sumBall, Direction: user.Direction});
  }
  res.status(200).send({Users: users});
};

module.exports.getStatisticsForFaculty = async function(req, res) {
  res.status(200).send(await db.getStatisticsForFaculty(req.query.faculty));
};

module.exports.balls = async function(id, faculty) {
  const criterias = await db.getCriterias(faculty);
  if (!criterias) return null;

  const kri = JSON.parse(criterias.Crits);
  const Achs = await db.findActualAchieves(id);
  const kriteries = {};

  for (const key of Object.keys(kri)) {
    kriteries[key] = [];
  }

  for (const ach of Achs) {
    if (!ach) continue;
    if (ach.status !== 'Принято' && ach.status !== 'Принято с изменениями') {
      ach.ball = undefined;
      db.updateAchieve(ach._id, ach).then();
      continue;
    }
    let curKrit = kri;
    if (Array.isArray(curKrit)) {
      kriteries[ach.crit].push({'ach': ach, 'balls': curKrit, 'chars': ach.chars});
    } else {
      for (const ch of ach.chars) {
        curKrit = curKrit[ch];
      }
      while (!Array.isArray(curKrit)) {
        curKrit = curKrit[Object.keys(curKrit)[0]];
      }
      kriteries[ach.crit].push({'ach': ach, 'balls': curKrit, 'chars': ach.chars});
    }
  }

  for (const key of Object.keys(kri)) {
    calculateBalls(kriteries[key]);
    for (const curAch of kriteries[key]) {
      if (!curAch) continue;
      db.updateAchieve(curAch['ach']._id, curAch['ach']).then();
    }
  }
};

const trimNumber = function(num) {
  return Number((num).toFixed(3));
};

/**
 * @return {number}
 */
const calculateBalls = function(Crit) {
  let summ = 0;
  let max = 0;

  for (let i = 0; i < Crit.length; i++) {
    if (!Crit[i]) continue;
    let maxIndex;
    for (let ach = 0; ach < Crit.length; ach++) {
      if (!Crit[ach]['balls']) continue;
      let shift = i;
      if (shift >= Crit[ach]['balls'].length) shift = Crit[ach]['balls'].length - 1;
      if (trimNumber(Crit[ach]['balls'][shift]) >= max) {
        max = trimNumber(Crit[ach]['balls'][shift]);
        maxIndex = ach;
      }
    }
    Crit[maxIndex]['ach'].ball = max;
    Crit[maxIndex]['balls'] = undefined;
    summ += max;
    max = 0;
  }
  return summ;
};

