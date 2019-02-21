const db = require('./dbController')
const Kri = require(__dirname + "/Kriterii.json")

module.exports.dynamic = async function (req, res) {
  let info = []
  let Users = await db.allUsers()
  for (let user of Users) {
    if (!user) continue;
    let str = user.LastName + ' ' + user.FirstName + ' ' + user.Patronymic
    let Achievements = []
    let AchTexts = []
    let AchId = []
    for (let achievement of user.Achievement) {

      let ach = await db.findAchieveById(achievement)
        if (!ach) continue;
      if (ach.status === 'Ожидает проверки') {
        Achievements.push(ach.crit)
        AchId.push(ach._id)
          AchTexts.push(ach.achievement)
      }
    }
    console.log(Achievements)
    info.push({ Id: user._id, user: str, AchTexts: AchTexts, Achievements: Achievements, AchId: AchId })
  }
  res.status(200).send({ Info: info })
}

module.exports.AchSuccess = async function (req, res) {
  await db.ChangeAchieve(req.body.Id, req.body.Comm, true)
    if (req.user._json.email)
        id = req.user._json.email
    else id = req.user.user_id
  balls(id)
}

module.exports.AchFailed = async function (req, res) {
  await db.ChangeAchieve(req.body.Id, req.body.Comm, false)
}

module.exports.Checked = async function (req, res) {
  let info = []
  let Users = await db.allUsers()
  for (let user of Users) {
    let str = user.LastName + ' ' + user.FirstName
    let Achievements = []
    let AchTexts = []
    let AchId = []
    let Status = []
    for (let achievement of user.Achievement) {
      let ach = await db.findAchieveById(achievement)
      if (ach.status !== 'Ожидает проверки') {
        Achievements.push(ach.type)
        AchId.push(ach._id)
          AchTexts.push(ach.achievement)
        Status.push(ach.status)
      }
    }
    info.push({ Id: user._id, user: str, AchTexts: AchTexts, Achievements: Achievements, AchId: AchId, Status: Status })
  }
  res.status(200).send({ Info: info })
}

module.exports.getRating = async function (req, res) {
  let users = []
  let Users = await db.allUsers()
  for (let user of Users) {
    console.log(user)
    let str = user.LastName + ' ' + user.FirstName + ' ' + user.Patronymic
    users.push({ Name: str, Ball: user.Ball })
  }
  console.log(users)
  res.status(200).send({ Users: users })
}

const balls = async function (id) {
  let kri = JSON.parse(JSON.stringify(Kri))
  let balls = 0;
  let User = await db.findUserById(id);
  Achs = User.Achievement;
  let kriteries = {};

  for (key of Object.keys(kri)) {
    kriteries[key] = []
  }

  for(let achID of Achs) {
      ach = await db.findAchieveById(achID);
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
          db.updateAchieve(curAch['ach']._id, curAch['ach'])
        }
    }

  db.setBalls(id,balls)
}

const MatrBalls = function(M){
  let S = 0;
  let max = 0;
    console.log(M);
  for(let i = 0; i < M.length; ++i){
      for(let j=0; j < M.length; ++j){
        if(M[j]['balls'][i] > max){
          max = M[j]['balls'][i];
          var q = j
        }
      }
      M[q]['ach'].ball = max;
      M[q]['balls'] = [0,0,0,0,0,0];
      S+=max;
      max = 0
  }
  return S
}
