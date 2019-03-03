const UserModel = require('../models/user.js')
const AchieveModel = require('../models/achieve')
const FacultyModel = require('../models/faculty')
const redis = require('../config/redis')

exports.findUserById = function (id) {
    return redis.getAsync(id + '_user').then(async (res) => {
        if (!res) {
            res = await UserModel.findOne({id: id}).lean()
            if (res) redis.setAsync(id + '_user', JSON.stringify(res))
        } else res = JSON.parse(res)
        return res
    })

}

exports.findUser = function(id){
  return UserModel.findById(id).lean()
}

exports.findUserByAchieve = function(id){
    return UserModel.find({Achievement: {$elemMatch: {id}}}).lean()
}


exports.isRegistered = async function(id){
    r = (await redis.get(id + '_reg')) == 'true'
    if (!r) {
        u = await UserModel.findOne({ id: id}, 'Registered').lean()
        r = u.Registered;

        if (r) {
            redis.set(id + '_reg', 'true')
        }
    }

    return r
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

exports.findAchieves = async function (user_id) {
    return redis.getAsync(user_id + '_achs').then(async (res) => {
        if (!res) {
            User = await UserModel.findOne({ id: user_id}, 'Achievement').lean()
            var ids = [User.Achievement.length]
            //for (var i = 0; i < User.Achievement.length; i++)
                //ids[i] = new ObjectID(User.Achievement[i])
            let b = await AchieveModel.find({_id : {$in: User.Achievement}}).lean()
            redis.setAsync(user_id + '_achs', JSON.stringify(b))
            return(b)
        } else return JSON.parse(res)})
}

exports.findAchieveById = async function (id) {
   return await AchieveModel.findById(id).lean()
}

exports.createAchieve = async function (achieve) {
  let a = await  AchieveModel.create(achieve)
  redis.setAsync(a._id + '_ach2', JSON.stringify(a))
  return a
}

exports.deleteAchieve = async function (id) {
    redis.del(id + '_ach2')
    AchieveModel.findByIdAndRemove(id).then((x) => {})
    u = await UserModel.findOne({Achievement: {$elemMatch: {$eq: id}}}).lean()
    for(var i = u.Achievement.length - 1; i >= 0; i--) {
        if(u.Achievement[i] === id) {
            u.Achievement.splice(i, 1);
            break
        }
    }
    await UserModel.findOneAndUpdate({ id: u.id }, {  Achievement: u.Achievement })
    redis.del(u.id + '_achs')
    redis.del(u.id + '_user')
    return true
}

exports.updateAchieve = async function (id, achieve) {
    redis.del(id + '_ach2')
    u = await UserModel.findOne({Achievement: {$elemMatch: {$eq: id}}}).lean()
    redis.del(u.id + '_achs');
    redis.del(u.id + '_user');
    return AchieveModel.findOneAndUpdate({ _id: id }, { $set: { crit: achieve.crit, chars: achieve.chars, status: achieve.status, achievement: achieve.achievement, ball: achieve.ball, SZ: achieve.SZ, achDate: achieve.achDate } }, function (err, result) {
    })
}

exports.registerUser = function (userId, lastname, name, patronymic, birthdate, faculty, course, type) {
    redis.set(id + '_reg', true);
    redis.del(id + '_user')
    return UserModel.findOneAndUpdate({ id: userId }, { $set: { LastName: lastname, FirstName: name, Patronymic: patronymic, Birthdate: birthdate, Faculty: faculty, Course: course, Type: type, Registered: true } })
}

exports.addAchieveToUser = function (userId, achieveId) {
  redis.del(userId + '_achs')
    redis.del(userId + '_user')
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

