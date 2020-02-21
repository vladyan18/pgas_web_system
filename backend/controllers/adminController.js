
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

module.exports.prepareForNewPgas = async function (req, res) {
    const users = await db.allUsers();

    for (const user of users) {
        let achieves = await db.findActualAchieves(user.id);


        for (const achieve of achieves) {
            if ((achieve.status === 'Принято' || achieve.status === 'Отказано') && ( achieve.crit === '1 (7а)' || achieve.crit === '7а')) {
                console.log(user.LastName);
                await db.deleteAchieve(achieve._id);
            }
        }
    }
};

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
        let str = user.LastName + ' ' + user.FirstName + ' ' + (user.Patronymic ? user.Patronymic : '');

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
    balls(u.id, u.Faculty);
    res.sendStatus(200);
    AdminEmitter.emit('Update');
    notify.emitSuccess(req, u).then();
    history.WriteToHistory(req, req.body.Id, u.id, 'Success')
};

module.exports.AchFailed = async function (req, res) {
    await db.ChangeAchieve(req.body.Id, false);
    let u = await db.findUser(req.body.UserId);
    balls(u.id, u.Faculty);
    AdminEmitter.emit('Update');
    res.sendStatus(200);
    notify.emitDecline(req, u).then();
    history.WriteToHistory(req, req.body.Id, u.id, 'Decline')
};

module.exports.AddToRating = async function (req, res) {
    if (req.body.Direction)
        await db.AddToRating(req.body.Id, req.body.Direction);
    else await db.AddToRating(req.body.Id)
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
        let str = user.LastName + ' ' + user.FirstName + ' ' + (user.Patronymic ? user.Patronymic : '');

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
                Type: user.Type,
                IsInRating: user.IsInRating,
                IsHiddenInRating: user.IsHiddenInRating,
                Achievements: user.Achievement,
                Direction: user.Direction
            })
        }
    }
    res.send({Info: info})
};

module.exports.getUser = async function (req, res) {
    let ip = await req.url.slice(6);

    db.findUser(ip).then((User) => {
        db.findActualAchieves(User.id).then((v) => {
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
    Achs = await db.findActualAchieves(user.id);
    for(let ach of Achs) {
        if (!ach) continue;
        if (ach.ball) {
            crits[ach.crit] += ach.ball;
            sumBall += ach.ball;
        }
    }
      let fio = user.LastName + ' ' + user.FirstName + ' ' + (user.Patronymic ? user.Patronymic : '');
      users.push({_id: user._id, Name: fio, Type: user.Type, Course: user.Course, Crits: crits, Ball: sumBall, Direction: user.Direction})
  }
  res.status(200).send({ Users: users })
};

module.exports.getStatisticsForFaculty = async function(req, res) {
    res.status(200).send(await db.getStatisticsForFaculty(req.query.faculty))
}

const balls = async function (id, faculty) {
    let criterias = await db.GetCriterias(faculty);
    if (!criterias) return null;

    let kri = JSON.parse(criterias.Crits);
    let balls = 0;
    let Achs = await db.findActualAchieves(id);
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
      console.log(ach.chars)
      if (Array.isArray(curKrit)) {
          kriteries[ach.crit].push({'ach': ach, 'balls':curKrit, 'chars': ach.chars})
      }
      else {
          for (let ch of ach.chars) {
              curKrit = curKrit[ch]
          }
          while (!Array.isArray(curKrit)) {
              curKrit = curKrit[Object.keys(curKrit)[0]]
          }
          kriteries[ach.crit].push({'ach': ach, 'balls':curKrit, 'chars': ach.chars})
      }
  }

    for (key of Object.keys(kri)) {
        if (true) // (CheckSystem(key, kriteries[key]))
        {
            if (faculty === 'ВШЖиМК' || faculty === 'Соцфак') {
                balls += MatrBallsLegacy(kriteries[key], faculty)
            }
            else {
                balls += MatrBalls(kriteries[key])
            }
        } else for (let ach of kriteries[key]) ach['ach'].ball = undefined;
        for (let curAch of kriteries[key]) {
            if (!curAch) continue;
            db.updateAchieve(curAch['ach']._id, curAch['ach']).then()
        }
    }
};

const CheckSystem = function(crit, ach) {
    if (!ach) return false;
    //if (crit == '10 (10в)' || crit == '12 (11б)' ) {
    //    return ach.filter(o => o).length >= 2
    //}
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

const MatrBallsLegacy = function (Crit, faculty) {
    let Summ = 0;
    let subrows = {}
    for (let ach = 0; ach < Crit.length; ach++) {
        let chars = [...Crit[ach].chars]
        if (faculty == 'Соцфак' && chars[0] == '6 (9а)') {
            if (
                chars[1] != 'Членство в жюри предметной олимпиады (9)' &&
                chars[1] != 'Безвозмездная педагогическая деятельность (10)' &&
                chars[1] != 'Проведение (обеспечение проведения) деятельности, направленной на помощь людям (в том числе социального и правозащитного характера) (11)' &&
                chars[1] != 'Проведение (обеспечение проведения) деятельности природоохранного характера (12)'
            )
                chars[1] = 'Организация мероприятий'
        }
            //console.log('CHARS', Crit[ach].chars)
            if (!subrows[chars])
                subrows[chars] = [Crit[ach]]
            else
                subrows[chars].push(Crit[ach])
    }

    for (let subrowKey of Object.keys(subrows)) {

        let subrow = subrows[subrowKey]
        if (!subrow) continue;
        for (let i = 0; i < subrow.length; i++) {
            let max = 0;
            let maxIndex
            for (let ach = 0; ach < subrow.length; ach++) {
                if (!subrow[ach]['balls']) continue;
                var shift = i;
                if (shift >= subrow[ach]['balls'].length) shift = subrow[ach]['balls'].length - 1;
                if (subrow[ach]['balls'][shift] >= max) {
                    max = subrow[ach]['balls'][shift];
                    maxIndex = ach
                }
            }
            subrow[maxIndex]['ach'].ball = max;
            subrow[maxIndex]['balls'] = undefined;
            Summ += max;
            max = 0
        }
    }
    return Summ
};

