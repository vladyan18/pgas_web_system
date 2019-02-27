const path = require('path')
const passport = require(path.join(__dirname, '../config/passport'))
const upload = require(path.join(__dirname, '../config/multer'))
const db = require('./dbController')
const fs = require('fs')


const uploadsPath = path.join(__dirname, '../../frontend/build/public/uploads')

module.exports.dynamic = async function (req, res) {
  let Achs = []
    if (req.user._json.email)
       User = await db.findUserById(req.user._json.email)
    else  User = await db.findUserById(req.user.user_id)
  let W = User.Achievement
  for (let i of W) {
     let Ach = await db.findAchieveById(i)  
    await Achs.push(Ach)
  }
  res.status(200).send({ LastName: User.LastName, FirstName: User.FirstName, Patronymic: User.Patronymic, Birthdate: User.Birthdate, Faculty: User.Faculty, Achs: Achs, Type: User.Type, Course: User.Course })
}

module.exports.getAch = async function (req, res) {
  id = req.query.achievement
    res.status(200).send( await db.findAchieveById(id))
}

module.exports.registerUser = async function (req, res) {
  try {
      let data = req.body;
      console.log(data)
      if (req.user && req.user._json.email)
        id = req.user._json.email
      else id = req.user.user_id
      await db.registerUser(id, data.lastname, data.name, data.patronymic, data.birthdate, data.faculty, data.course, data.type);
      res.sendStatus(200)
  } catch (err) {
      console.log(err)
      res.status(500).send(err)
  }
};

module.exports.addAchieve = function (req, res) {
  if (!fs.existsSync(uploadsPath)) {
    fs.mkdirSync(uploadsPath)
  }
  upload(req, res, async function (err) {
    try {
      if (err || !req.files) {
        return res.status(400).send('ERROR: Max file size = 15MB')
      }
      let achieve = JSON.parse(req.body.data)

      let options = {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric'
      }
      achieve.status = 'Ожидает проверки'
      achieve.date = new Date().toLocaleString('ru', options)

      let arr = []
      for (let file of req.files) {
        arr.push(file.filename)
      }
      achieve.files = arr
      achieve.comment = ''
      console.log(achieve)
      let createdAchieve = await db.createAchieve(achieve)
      if (req.user._json && req.user._json.email)
        id = req.user._json.email
      else id = req.user.user_id
      await db.addAchieveToUser(id, createdAchieve._id)
      res.sendStatus(200)
    }
    catch (err) {
      console.log(err)
      res.status(500).send(err)
    }
  })
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
            res.sendStatus(200)
        }
        catch (err) {
            console.log(err)
            res.status(500).send(err)
        }
    })
  }


module.exports.deleteAchieve = function (req, res) {
    if (!fs.existsSync(uploadsPath)) {
        fs.mkdirSync(uploadsPath)
    }
    upload(req, res, async function (err) {
        try {
            if (err || !req.files) {
                return res.status(400).send('ERROR: Max file size = 15MB')
            }
            let id = req.body.achId;

            if (req.user._json.email)
                User = await db.findUserById(req.user._json.email)
            else  User = await db.findUserById(req.user.user_id)

            if (User.Role != 'Admin' &&  User.Role!='SuperAdmin' && !User.Achievement.some(o => (o && o == id)))
                return res.sendStatus(404);

            let result = await db.deleteAchieve(id)
            res.sendStatus(200)
        }
        catch (err) {
            console.log(err)
            res.status(500).send(err)
        }
    })
}
