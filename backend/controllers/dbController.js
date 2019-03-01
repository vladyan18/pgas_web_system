const UserModel = require('../models/user.js')
const AchieveModel = require('../models/achieve')
const FacultyModel = require('../models/faculty')

exports.findUserById= function (id) {
  return UserModel.findOne({ id: id}).lean()
}

exports.findUser = function(id){
  return UserModel.findById(id).lean()
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
  return AchieveModel.findById(id).lean()
}

exports.createAchieve = function (achieve) {
  return AchieveModel.create(achieve)
}

exports.deleteAchieve = function (id) {
    return AchieveModel.findByIdAndRemove(id)
}

exports.updateAchieve = function (id, achieve) {
    return AchieveModel.findOneAndUpdate({ _id: id }, { $set: { crit: achieve.crit, chars: achieve.chars, status: achieve.status, achievement: achieve.achievement, ball: achieve.ball, SZ: achieve.SZ, achDate: achieve.achDate } }, function (err, result) {
        console.log('')
    })
}

exports.registerUser = function (userId, lastname, name, patronymic, birthdate, faculty, course, type) {
    return UserModel.findOneAndUpdate({ id: userId }, { $set: { LastName: lastname, FirstName: name, Patronymic: patronymic, Birthdate: birthdate, Faculty: faculty, Course: course, Type: type, Registered: true } })
}

exports.addAchieveToUser = function (userId, achieveId) {
  return UserModel.findOneAndUpdate({ id: userId }, { $push: { Achievement: achieveId } })
}

exports.AddToRating = function (userId) {

    return UserModel.findOneAndUpdate({ _id: userId }, { $set: { IsInRating: true } })
}

exports.ChangeAchieve = async function (id,isGood) {
  if (isGood === true) {
    let Ach = await AchieveModel.findById(id)
    if(Ach.status === 'Изменено' || Ach.status === 'Принято с изменениями'){
      return AchieveModel.findOneAndUpdate({ _id: id }, { $set: { status: 'Принято с изменениями'} }, function (err, result) {
        console.log('')
      })
    }else{
    return AchieveModel.findOneAndUpdate({ _id: id }, { $set: { status: 'Принято' } }, function (err, result) {
      console.log('')
    })
  }
  }
  else {
    return AchieveModel.findOneAndUpdate({ _id: id }, { $set: { status: 'Отказано' } }, function (err, result) {
      console.log('')
    })
  }
}


exports.comment = function(id,comment){
  return AchieveModel.findOneAndUpdate({ _id: id }, { $set: { comment: comment} }, function (err, result) {
    console.log('')
  })
}
exports.allAchieves = function () {
  return AchieveModel.find({}).lean()
}

exports.setBalls = function(id,balls){
  return UserModel.findOneAndUpdate({ id: id }, { $set: { Ball: balls} }, function (err, result) {
    console.log(result)
  })
}

exports.UserSuccesAchs = async function(id){
  let User = await UserModel.findOne({ id: id})
  let Achs = User.Achievement
  let SucAchs = []
  for(let achID of Achs) {
    let ach =  await AchieveModel.findById(achID)
    if(ach.status === 'Принято' || ach.status === 'Принято с изменениями'){
      SucAchs.push(ach)
    }
  }
  return SucAchs
}

exports.GetFaculty = async function(Name) {
    return await FacultyModel.findOne({Name: Name});
}

exports.ChangeRole = function (id, isAdmin) {
  console.log(id)
  if (isAdmin === true) {
    return UserModel.findOneAndUpdate({ id: id }, { $set: { Role: 'Admin'} }, function (err, result) {
      console.log(result)
    })
  }
  else {
    return UserModel.findOneAndUpdate({ id: id }, { $set: { Role: 'User' } }, function (err, result) {
      console.log(result)
    })
  }
}

