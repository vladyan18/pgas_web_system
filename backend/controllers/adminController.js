const db = require('./dbController')
const path = require('path')
const Kri = require(__dirname + "/Kriterii.json")
const fs = require('fs')
const uploadsPath = path.join(__dirname, '../../frontend/build/public/uploads')
const upload = require(path.join(__dirname, '../config/multer'))

module.exports.setUser = async function(req,res){
  db.ChangeRole(req.body.Id,false)
}

module.exports.setAdmin = async function(req,res){
  db.ChangeRole(req.body.Id,true)
}

module.exports.getAdmins = async function (req,res){
  let users = []
  let Users = await db.allUsers()
  for (let user of Users) {
    let str = user.LastName + ' ' + user.FirstName + ' ' + user.Patronymic
    users.push({ Name: str, Role: user.Role, Id: user.id })
  }
  res.status(200).send({ Users: users })
}

module.exports.dynamic = async function (req, res) {
  let info = []
  let Users = await db.NewUsers()
    for (let user of Users) {
        if (!user) continue;
        let str = user.LastName + ' ' + user.FirstName + ' ' + user.Patronymic
        let Achievements = []

        for (let achievement of user.Achievement) {

            let ach = await db.findAchieveById(achievement)
            if (!ach) continue;

            let charStr = ""

            for (var i = 0; i < ach.chars.length; i++)
            {
                if (i != 0) charStr += '; '
                charStr += ach.chars[i]
            }
            ach.chars = charStr

            Achievements.push(ach)
        }

        Achievements.sort(function(obj1, obj2) {

            return Number.parseInt(obj1.crit.substr(0,2)) > Number.parseInt(obj2.crit.substr(0,2))
        });

        if( Achievements.length > 0){
            info.push({ Id: user._id, user: str, Course: user.Course, IsInRating:user.IsInRating, Achievements: Achievements})
        }
    }
    res.status(200).send({ Info: info })
}

module.exports.updateAchieve = function (req, res) {
    if (!fs.existsSync(uploadsPath)) {
        fs.mkdirSync(uploadsPath)
    }
    upload(req, res, async function (err) {
        try {
            if (err || !req.files) {
                return res.status(400).send('ERROR: Max file size = 15MB')
            }
            let achieve = JSON.parse(req.body.data)
            let id = req.body.achId
            let options = {
                year: 'numeric',
                month: 'numeric',
                day: 'numeric'
            }
            achieve.status = 'Изменено'
            achieve.date = new Date().toLocaleString('ru', options)

            let arr = []
            for (let file of req.files) {
                arr.push(file.filename)
            }
            achieve.files = arr
            console.log(achieve)
            let createdAchieve = await db.updateAchieve(id, achieve)
            if (req.user._json.email)
                id = req.user._json.email
            else id = req.user.user_id
            balls(id)
            res.sendStatus(200)
        }
        catch (err) {
            console.log(err)
            res.status(500).send(err)
        }
    })
}

module.exports.AchSuccess = async function (req, res) {
  await db.ChangeAchieve(req.body.Id, true)
    let u = await db.findUserByAchieve(req.body.Id)
  balls(u.id)
}

module.exports.AchFailed = async function (req, res) {
  await db.ChangeAchieve(req.body.Id, false)
    let u = await db.findUserByAchieve(req.body.Id)
    balls(u.id)
}

module.exports.AddToRating = async function (req, res) {
    await db.AddToRating(req.body.Id)
}

module.exports.RemoveFromRating = async function (req, res) {
    await db.RemoveFromRating(req.body.Id)
}

module.exports.Comment = async function(req,res){
  await db.comment(req.body.Id, req.body.comment)
}

module.exports.Checked = async function (req, res) {
    let info = []
    let Users = await db.CurrentUsers()
    for (let user of Users) {
        if (!user) continue;
        let str = user.LastName + ' ' + user.FirstName + ' ' + user.Patronymic
        let Achievements = []

        for (let achievement of user.Achievement) {

            let ach = await db.findAchieveById(achievement)
            if (!ach) continue;

            let charStr = ""

            for (var i = 0; i < ach.chars.length; i++)
            {
                if (i != 0) charStr += '; '
                charStr += ach.chars[i]
            }
            ach.chars = charStr
            Achievements.push(ach)
        }

        Achievements.sort(function(obj1, obj2) {

            return Number.parseInt(obj1.crit.substr(0,2)) > Number.parseInt(obj2.crit.substr(0,2))
        });

        if( Achievements.length > 0){
            info.push({ Id: user._id, user: str, Course: user.Course, IsInRating:user.IsInRating, Achievements: Achievements})
        }
    }
    res.status(200).send({ Info: info })
}

module.exports.allUsers = async function (req, res) {
  let ip = await req.url.slice(6)
  let User = await db.findUser(ip)
  let Achs = []
  for (let i of User.Achievement) {
    let Ach = await db.findAchieveById(i)
    let files = Ach.files
    let date = Ach.date
    let crit = Ach.crit
    let popisal = Ach.comment
    let status = Ach.status
    let Achieve = {
      Files: files,
      Date: date,
      Crit: crit,
      Popisal: popisal,
      Status: status
    }
    Achs.push(Achieve)
  }
  res.status(200).send({ LastName: User.LastName, FirstName: User.FirstName, Achs: Achs })
}

module.exports.getRating = async function (req, res) {
  let kri = JSON.parse(JSON.stringify(Kri))
  let users = []
  let Users = await db.CurrentUsers()
  for (let user of Users) {
      let sumBall = 0
      let crits = {}
      for (key of Object.keys(kri)) {
          crits[key] = 0;
      }
    Achs = user.Achievement;
    for(let achID of Achs) {
        ach = await db.findAchieveById(achID);
        if (!ach) continue
        if (ach.ball) {
            crits[ach.crit] += ach.ball;
            sumBall += ach.ball;
        }
    }
    let fio = user.LastName + ' ' + user.FirstName + ' ' + user.Patronymic
    users.push({ Name: fio, Type: user.Type, Course: user.Course, Crits: crits, Ball: sumBall })
  }
  res.status(200).send({ Users: users })
}

const balls = async function (id) {
  let kri = JSON.parse(JSON.stringify(Kri))
  console.log(id)
  let balls = 0;
  let Achs = await db.findAchieves(id)
    console.log(Achs)
  let kriteries = {};

  for (key of Object.keys(kri)) {
    kriteries[key] = []
  }

  for(let ach of Achs) {
      if (!ach) continue;
      if (ach.status != 'Принято' && ach.status != 'Принято с изменениями') {
          ach.ball = undefined
          db.updateAchieve(ach._id, ach)
          continue
      }
      let curKrit = kri[ach.crit];
      if (Array.isArray(curKrit)) {
          kriteries[ach.crit].push({'ach': ach, 'balls':curKrit})
      }
      else {
          for (let ch of ach.chars) {
              curKrit = curKrit[ch]
          }
          kriteries[ach.crit].push({'ach': ach, 'balls':curKrit})
      }
  }

    for (key of Object.keys(kri)) {
        balls += MatrBalls(kriteries[key])
        for (curAch of kriteries[key]) {
            if (!curAch) continue
          db.updateAchieve(curAch['ach']._id, curAch['ach'])
        }
    }
}

const MatrBalls = function(M){
  let S = 0;
  let max = 0;

  for(let i = 0; i < M.length; i++){
      if (!M[i]) continue
      var q = 0;
      for(let j=0; j < M.length; j++){
        if(M[j]['balls'][i] > max){
          max = M[j]['balls'][i];
          q = j
        }
      }
      M[q]['ach'].ball = max;
      M[q]['balls'] = [0,0,0,0,0,0];
      S+=max;
      max = 0
  }
  return S
}
