const UserModel = require('../models/user.js')
const AchieveModel = require('../models/achieve')

exports.findUserById= function (id) {
  return UserModel.findOne({ id: id})
}

exports.findUser = function(id){
  return UserModel.findById(id)
}

exports.allUsers = function () {
  return UserModel.find({})
}

exports.isUser = function(token){
    return UserModel.findOne({id: token},function(err, user){
        if(err)
          return res.send('Error')
          
        if(!user){
          return false
        }         
        return true
    })
}
  
exports.createUser = function(User){
    return UserModel.create(User)
}

exports.findAchieveById = function (id) {
  return AchieveModel.findById(id)
}

exports.createAchieve = function (achieve) {
  return AchieveModel.create(achieve)
}

exports.updateAchieve = function (id, achieve) {
    return AchieveModel.findOneAndUpdate({ _id: id }, { $set: { crit: achieve.crit, chars: achieve.chars, status: achieve.status, achievement: achieve.achievement, ball: achieve.ball } }, function (err, result) {
        console.log('')
    })
}

exports.registerUser = function (userId, lastname, name, patronymic, birthdate, faculty, course, type) {
    return UserModel.findOneAndUpdate({ id: userId }, { $set: { LastName: lastname, FirstName: name, Patronymic: patronymic, Birthdate: birthdate, Faculty: faculty, Course: course, Type: type, Registered: true } })
}

exports.addAchieveToUser = function (userId, achieveId) {
  return UserModel.findOneAndUpdate({ id: userId }, { $push: { Achievement: achieveId } })
}

exports.ChangeAchieve = function (id, comm, isGood) {
  if (isGood === true) {
    return AchieveModel.findOneAndUpdate({ _id: id }, { $set: { status: 'Принято', comment: comm } }, function (err, result) {
      console.log('')
    })
  }
  else {
    return AchieveModel.findOneAndUpdate({ _id: id }, { $set: { status: 'Отказано', comment: comm } }, function (err, result) {
      console.log('')
    })
  }
}

exports.allAchieves = function () {
  return AchieveModel.find({})
}

exports.setBalls = function(id,balls){
  return UserModel.findOneAndUpdate({ id: id }, { $set: { Ball: balls} }, function (err, result) {
    console.log(result)
  })
}

exports.UserSeccesAchs = async function(id){
  let User = await UserModel.findOne({ id: id})
  let Achs = User.Achievement
  let SucAchs = []
  for(let achID of Achs) {
    let ach =  await AchieveModel.findById(achID)
    if(ach.status === 'Принято'){
      SucAchs.push(ach)
    }
  }
  return SucAchs
}