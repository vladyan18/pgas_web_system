const path = require('path')
const upload = require(path.join(__dirname, '../config/multer'))
const db = require('./dbController')
const fs = require('fs')
const Kri = require(__dirname + "\\Kriterii.json")
const uploadsPath = path.join(__dirname, '../../frontend/build/public/uploads')

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
      res.sendStatus(200)
    }
    catch (err) {
      console.log(err)
      res.status(500).send(err)
    }
  })
}

module.exports.balls = async function (req, res) {
  let kri = JSON.parse(JSON.stringify(Kri))
  let balls = 0
  let Achs = await db.allAchieves()
  let kriteries = {}

  for (key of Object.keys(kri)) {
    kriteries[key] = []
  }

  for(let ach of Achs) {
      console.log(ach);
      let curKrit = kri[ach.crit];
      if (Array.isArray(curKrit)) {
          kriteries[ach.crit].push(curKrit)
      }
      else {
          for (let ch of ach.chars) {
              console.log(Object.keys(curKrit), ch)
              curKrit = curKrit[ch]
          }
          kriteries[ach.crit].push(curKrit)
      }
  }

    for (key of Object.keys(kri)) {
        balls += MatrBalls(kriteries[key])
    }

  res.render('add',{obj: balls})
}

module.exports.delete = async function(req,res){
  await db.deleteAchieves()
  res.render('add',{obj: 0})
}

const MatrBalls = function(M){
  let S = 0
  let max = 0
    console.log(M)
  for(let i = 0; i < M.length; ++i){
      for(let j=0; j < M.length; ++j){
        if(M[j][i] > max){
          max = M[j][i]
          var q = j
        }
      }
      M[q] = [0,0,0,0,0,0]
      S+=max
      max = 0
  }
  return S
}