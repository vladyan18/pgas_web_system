const path = require('path')
const passport = require(path.join(__dirname, '../config/passport'))
const upload = require(path.join(__dirname, '../config/multer'))
const db = require('./dbController')
const fs = require('fs')


const uploadsPath = path.join(__dirname, '../../frontend/build/public/uploads')

module.exports.dynamic = async function (req, res) {
  let Achs = []
  let User= await db.findUserById(req.user._json.email)
  let W = User.Achievement
  for (let i of W) {
     let Ach = await db.findAchieveById(i)  
    await Achs.push(Ach)
  }
  res.status(200).send({ LastName: req.user.name.familyName, FirstName: req.user.name.givenName, Achs: Achs })
}

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
      console.log(achieve)
      let createdAchieve = await db.createAchieve(achieve)
      await db.addAchieveToUser(req.user._json.email, createdAchieve._id)
      res.sendStatus(200)
    }
    catch (err) {
      console.log(err)
      res.status(500).send(err)
    }
  })
}

