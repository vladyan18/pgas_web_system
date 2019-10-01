const db = require('./dbController');
const notify = require('./notificationController');
const history = require('./historyNotesController');
const path = require('path');
const Kri = require(__dirname + "/Kriterii.json");
const fs = require('fs');
const uploadsPath = path.join(__dirname, '../../frontend/build/public/uploads');
const upload = require(path.join(__dirname, '../config/multer'));
const EventEmitter = require('events');
class UpdateEmitter extends EventEmitter {}
const AdminEmitter = new UpdateEmitter();

module.exports.setUser = async function(req,res){
    await db.ChangeRole(req.body.Id, false);
    res.sendStatus(200)
};

module.exports.setAdmin = async function(req,res){
    await db.ChangeRole(req.body.Id, true);
    res.status(200).send({})
};

module.exports.createAdmin = async function (req, res) {
    let User = req.body;
    await db.createUser(User);
    res.status(200).send({ok: true})
};

module.exports.getAdmins = async function (req,res){
    let users = [];
    let Users = await db.allUsers();
  for (let user of Users) {
      let str = user.LastName + ' ' + user.FirstName + ' ' + user.Patronymic;
    users.push({ Name: str, Role: user.Role, Id: user.id })
  }
  res.status(200).send({ Users: users })
};

module.exports.dynamic = async function (req, res) {
    let info = [];
    let Users = await db.GetUsersWithAllInfo(req.query.faculty)

    for (let user of Users) {
        if (!user) continue;
        let str = user.LastName + ' ' + user.FirstName + ' ' + user.Patronymic;

        for (let i = 0; i < user.Achievement.length; i++) {
            for (let j = 0; j < user.Achievement[i].confirmations.length; j++) {
                if (!user.Achievement[i].confirmations[j].id) continue

                let expandedConfirm = user.Achievement[i].confirmations[j].id
                expandedConfirm.additionalInfo = user.Achievement[i].confirmations[j].additionalInfo
                user.Achievement[i].confirmations[j] = expandedConfirm
            }
        }

        if( user.Achievement.length > 0){
            info.push({
                Id: user._id,
                user: str,
                Course: user.Course,
                IsInRating: user.IsInRating,
                IsHiddenInRating: user.IsHiddenInRating,
                Achievements: user.Achievement
            })
        }
    }
    res.send({Info: info})
};

module.exports.waitForUpdates = async function (req, res) {
    var timer;
    var flag = false;
    var callback = () => {
        setImmediate(() => {
            flag = true;
            res.sendStatus(200);
            res.end();
            clearTimeout(timer)
        })
    };

    timer = setTimeout(function () {
        AdminEmitter.removeListener('Update', callback);
        if (!flag)
            res.sendStatus(408)
    }, 300000);

    AdminEmitter.once('Update', callback)


};

module.exports.updateAchieve = async function (req, res) {

    let achieve = req.body;
    let id = req.body._id;
            let options = {
                year: 'numeric',
                month: 'numeric',
                day: 'numeric'
            };
            achieve.status = 'Изменено';
            achieve.date = new Date().toLocaleString('ru', options);

            let oldAchieve = await db.findAchieveById(id);
            let createdAchieve = await db.updateAchieve(id, achieve);
            if (req.user._json.email)
                uid = req.user._json.email;
            else uid = req.user.user_id;

            var args = {};
            args.from = oldAchieve;
            args.to = createdAchieve;
            history.WriteToHistory(req, id, uid, 'Change', args);
            balls(uid);
            res.sendStatus(200);
            AdminEmitter.emit('Update');
            notify.emitChange(req, createdAchieve).then()
};

module.exports.AchSuccess = async function (req, res) {
    await db.ChangeAchieve(req.body.Id, true);
    let u = await db.findUser(req.body.UserId);
    console.log('IDSucess', req.body, u)
    balls(u.id, u.Faculty);
    res.sendStatus(200);
    AdminEmitter.emit('Update');
    notify.emitSuccess(req, u).then();
    history.WriteToHistory(req, req.body.Id, u.id, 'Success')
};

module.exports.AchFailed = async function (req, res) {
    await db.ChangeAchieve(req.body.Id, false);
    console.log('ID', req.body.Id)
    let u = await db.findUser(req.body.UserId);
    balls(u.id, u.Faculty);
    AdminEmitter.emit('Update');
    res.sendStatus(200);
    notify.emitDecline(req, u).then();
    history.WriteToHistory(req, req.body.Id, u.id, 'Decline')
};

module.exports.AddToRating = async function (req, res) {
    await db.AddToRating(req.body.Id);
    res.sendStatus(200);
    AdminEmitter.emit('Update');
    notify.AddToRating(req, req.body.Id).then()
};

module.exports.RemoveFromRating = async function (req, res) {
    await db.RemoveFromRating(req.body.Id);
    res.sendStatus(200);
    AdminEmitter.emit('Update');
    notify.RemoveFromRating(req, req.body.Id).then()
};

module.exports.Comment = async function(req,res){
    await db.comment(req.body.Id, req.body.comment);
    res.sendStatus(200);
    AdminEmitter.emit('Update');
    notify.emitComment(req, req.body.Id).then()
};

module.exports.toggleHide = async function (req, res) {
    await db.toggleHide(req.body.id);
    res.sendStatus(200)
};

module.exports.Checked = async function (req, res) {
    let info = [];
    let Users = await db.GetUsersWithAllInfo(req.query.faculty, true)

    for (let user of Users) {
        if (!user) continue;
        let str = user.LastName + ' ' + user.FirstName + ' ' + user.Patronymic;

        for (let i = 0; i < user.Achievement.length; i++) {
            for (let j = 0; j < user.Achievement[i].confirmations.length; j++) {
                if (!user.Achievement[i].confirmations[j].id) continue

                let expandedConfirm = user.Achievement[i].confirmations[j].id
                expandedConfirm.additionalInfo = user.Achievement[i].confirmations[j].additionalInfo
                user.Achievement[i].confirmations[j] = expandedConfirm
            }
        }

        if( user.Achievement.length > 0){
            info.push({
                Id: user._id,
                user: str,
                Course: user.Course,
                IsInRating: user.IsInRating,
                IsHiddenInRating: user.IsHiddenInRating,
                Achievements: user.Achievement
            })
        }
    }
    res.send({Info: info})
};

module.exports.getUser = async function (req, res) {
    let ip = await req.url.slice(6);

    db.findUser(ip).then((User) => {
        db.findAchieves(User.id).then((v) => {
            User.Achs = v;
            res.status(200).send(User)
        })
    })
};

module.exports.getRating = async function (req, res) {
    let kri = JSON.parse(JSON.stringify(Kri));
    let users = [];
    let Users = await db.CurrentUsers(req.query.faculty);
  for (let user of Users) {
      let sumBall = 0;
      let crits = {};
      for (key of Object.keys(kri)) {
          crits[key] = 0;
      }
    Achs = await db.findAchieves(user.id);
    for(let ach of Achs) {
        if (!ach) continue;
        if (ach.ball) {
            crits[ach.crit] += ach.ball;
            sumBall += ach.ball;
        }
    }
      let fio = user.LastName + ' ' + user.FirstName + ' ' + user.Patronymic;
      users.push({_id: user._id, Name: fio, Type: user.Type, Course: user.Course, Crits: crits, Ball: sumBall})
  }
  res.status(200).send({ Users: users })
};

const balls = async function (id, faculty) {
    let criterias = await db.GetCriterias(faculty);
    if (!criterias) return null;

    let kri = JSON.parse(criterias.Crits);
    let balls = 0;
    let Achs = await db.findAchieves(id);
  let kriteries = {};

  for (key of Object.keys(kri)) {
    kriteries[key] = []
  }

  for(let ach of Achs) {
      if (!ach) continue;
      if (ach.status != 'Принято' && ach.status != 'Принято с изменениями') {
          ach.ball = undefined;
          db.updateAchieve(ach._id, ach).then();
          continue
      }
      let curKrit = kri;
      if (Array.isArray(curKrit)) {
          kriteries[ach.crit].push({'ach': ach, 'balls':curKrit})
      }
      else {
          for (let ch of ach.chars) {
              curKrit = curKrit[ch]
          }
          while (!Array.isArray(curKrit)) {
              curKrit = curKrit[Object.keys(curKrit)[0]]
          }
          kriteries[ach.crit].push({'ach': ach, 'balls':curKrit})
      }
  }

    for (key of Object.keys(kri)) {
        if (CheckSystem(key, kriteries[key]))
        {
          balls += MatrBalls(kriteries[key])
        } else for (let ach of kriteries[key]) ach['ach'].ball = undefined;
        for (curAch of kriteries[key]) {
            if (!curAch) continue;
            db.updateAchieve(curAch['ach']._id, curAch['ach']).then()
        }
    }
};

const CheckSystem = function(crit, ach) {
    if (!ach) return false;
    if (crit == '10 (10в)' || crit == '12 (11б)' ) {
        return ach.filter(o => o).length >= 2
    }
    else return true
};

const MatrBalls = function (Crit) {
    let Summ = 0;
  let max = 0;

    for (let i = 0; i < Crit.length; i++) {
        if (!Crit[i]) continue;
      var q = 0;
        for (let ach = 0; ach < Crit.length; ach++) {
            if (!Crit[ach]['balls']) continue;
            var shift = i;
            if (shift >= Crit[ach]['balls'].length) shift = Crit[ach]['balls'].length - 1;
            if (Crit[ach]['balls'][shift] >= max) {
                max = Crit[ach]['balls'][shift];
                maxIndex = ach
        }
      }
        Crit[maxIndex]['ach'].ball = max;
        Crit[maxIndex]['balls'] = undefined;
        Summ += max;
      max = 0
  }
    return Summ
};
