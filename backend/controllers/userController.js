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
  let B7 = []
  let C7 = []
  let A8 = []
  let B8 = []
  let A9 = []
  let B9 = []
  let A10 = []
  let B10 = []
  let C10 = []
  let A11 = []
  let B11 = []
  for(let ach of Achs){
  if(ach.crit === "a7"){
      balls += Math.max.apply(null,kri["1 (7а)"]) 
      kri[ach.crit] = [0]
  }
  if(ach.crit === "b7"){
    B7.push(kri["2 (7б)"][ach.level][ach.winner][ach.team][ach.dspo][ach.o4no])  
  }
  if(ach.crit === "c7"){
    C7.push(kri["3 (7в)"][ach.level][ach.winner][ach.team][ach.dspo][ach.o4no])  
  }
  if(ach.crit === "a8"){
    if(kri["4 (8а)"][ach.reward][ach.winner] != undefined){
      A8.push(kri["4 (8а)"][ach.reward][ach.winner][ach.team][ach.dspo])  
    }else{
    if(kri["4 (8а)"][ach.reward][ach.indiv] != undefined){
      A8.push(kri["4 (8а)"][ach.reward][ach.indiv][ach.dspo]) 
    }else{
      A8.push(kri["4 (8а)"][ach.reward][ach.dspo])
    }
  }
  }
  if(ach.crit === "b8"){  
  }
  if(ach.crit === "a9"){
    // A9.push(kri["6 (9а)"][ach.organise][ach.level][ach.cycle][ach.lead]) 
  }
  if(ach.crit === "b9"){
    B9.push(kri["7 (9б)"][ach.tv][ach.role])  
  }
  if(ach.crit === "a10"){
    A10.push(kri["8 (10а)"][ach.level][ach.winner][ach.team][ach.o4no])
  }
  if(ach.crit === "b10"){
    B10.push(kri["9 (10б)"][ach.level][ach.team][ach.o4no])
  }
  if(ach.crit === "c10"){
    C10.push(kri["10 (10в)"][ach.level][ach.cycle][ach.role])
  }
  if(ach.crit === "a11"){
    A11.push(kri["11 (11а)"][ach.level][ach.o4no][ach.winner][ach.team])
  }
  if(ach.crit === "b11"){
    if(kri["12 (11б)"][ach.part][ach.winner] != undefined){
      B11.push(kri["12 (11б)"][ach.part][ach.winner][ach.team][ach.o4no])
    }
    if(kri["12 (11б)"][ach.part][ach.role] != undefined){
      B11.push(kri["12 (11б)"][ach.part][ach.role][ach.o4no])
    }
    if(kri["12 (11б)"][ach.part][ach.level] != undefined){
      B11.push(kri["12 (11б)"][ach.part][ach.level][ach.o4no])
    }
  }
  if(ach.crit === "c11"){     
      balls += Math.max.apply(null,kri["13 (11в)"]['Выполнение нормативов и требований золотого знака отличия «Всероссийского физкультурно-спортивного комплекса «Готов к труду и обороне» (ГТО) соответствующей возрастной группы на дату назначения повышенной государственной академической стипендии.'])
      kri["13 (11в)"]['Выполнение нормативов и требований золотого знака отличия «Всероссийского физкультурно-спортивного комплекса «Готов к труду и обороне» (ГТО) соответствующей возрастной группы на дату назначения повышенной государственной академической стипендии.'] = [0]
    }
}
  balls += MatrBalls(B7)
  balls += MatrBalls(C7)
  balls += MatrBalls(A8)
  balls += MatrBalls(B8)
  balls += MatrBalls(A9)
  balls += MatrBalls(B9)
  balls += MatrBalls(A10)
  balls += MatrBalls(B10)
  balls += MatrBalls(C10)
  balls += MatrBalls(A11)
  balls += MatrBalls(B11)
  res.render('add',{obj: balls})
}

module.exports.delete = async function(req,res){
  await db.deleteAchieves()
  res.render('add',{obj: 0})
}

const MatrBalls = function(M){
  let S = 0
  let max = 0
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