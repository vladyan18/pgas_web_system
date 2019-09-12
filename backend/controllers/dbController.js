


const UserModel = require('../models/user.js');
const AchieveModel = require('../models/achieve');
const FacultyModel = require('../models/faculty');
const CriteriasModel = require('../models/criterias');
const ConfirmationModel = require('../models/confirmation');
const HistoryNoteModel = require('../models/historyNote');

const redis = require('../config/redis');
var ObjectId = require('mongoose').Types.ObjectId;

exports.findUserById = function (id) {
    return redis.getAsync(id + '_user').then(async (res) => {
        if (!res) {
            res = await UserModel.findOne({id: id}).lean();
            if (res) redis.setAsync(id + '_user', JSON.stringify(res))
        } else res = JSON.parse(res);
        return res
    })

};

exports.findUser = function(id){
  return UserModel.findById(id).lean()
};

exports.getUserRights = function (id) {
    return UserModel.findOne({id: id}, 'Role Rights').lean();
};

exports.findUserByAchieve = function(id){

    return UserModel.findOne({Achievement: {$elemMatch: {$eq: id}}}).lean()
};


exports.isRegistered = async function(id){
    r = (await redis.get(id + '_reg')) == 'true';
    if (!r) {
        u = await UserModel.findOne({id: id}, 'Registered').lean();
        r = u.Registered;

        if (r) {
            redis.set(id + '_reg', 'true')
        }
    }

    return r
};


exports.allUsers = function () {
  return UserModel.find({}).lean()
};

exports.CurrentUsers = function (faculty) {
    return UserModel.find({Faculty: faculty, IsInRating: true}).lean()
};

exports.NewUsers = function (faculty) {
    return UserModel.find().or([{Faculty: faculty, IsInRating: undefined}, {Faculty: faculty, IsInRating: false}])
};

exports.isUser = function(token){
    return UserModel.findOne({id: token},function(err, user){
        if(err)
            return res.send('Error');
          
        if(!user){
          return false
        }         
        return true
    })
};
  
exports.createUser = function(User){
    return UserModel.create(User)
};

exports.findAchieves = async function (user_id) {
    return redis.getAsync(user_id + '_achs').then(async (res) => {
        if (!res) {
            User = await UserModel.findOne({id: user_id}, 'Achievement').lean();
            let b = await AchieveModel.find({_id: {$in: User.Achievement}}).lean();
            redis.setAsync(user_id + '_achs', JSON.stringify(b));
            return(b)
        } else return JSON.parse(res)})
};

exports.findAchieveById = async function (id) {
    return await AchieveModel.findById(id).lean();

    return redis.getAsync(id + '_ach2').then(async (res) => {
        if (!res) {
            let b = await AchieveModel.findById(id).lean();
            redis.setAsync(id + '_ach2', JSON.stringify(b));
            return(b)
        } else return JSON.parse(res)})
};

exports.createAchieve = async function (achieve) {
    let a = await AchieveModel.create(achieve);
    redis.setAsync(a._id + '_ach2', JSON.stringify(a));
  return a
};

exports.deleteAchieve = async function (id) {
    redis.del(id + '_ach2');
    AchieveModel.findByIdAndRemove(id).then((x) => {
    });
    u = await UserModel.findOne({Achievement: {$elemMatch: {$eq: id}}}).lean();
    for(var i = u.Achievement.length - 1; i >= 0; i--) {
        if(u.Achievement[i] === id) {
            u.Achievement.splice(i, 1);
            break
        }
    }
    await UserModel.findOneAndUpdate({id: u.id}, {Achievement: u.Achievement});
    redis.del(u.id + '_achs');
    redis.del(u.id + '_user');
    return true
};

exports.updateAchieve = async function (id, achieve) {
    redis.del(id + '_ach2');
    u = await UserModel.findOne({Achievement: {$elemMatch: {$eq: id}}}).lean();
    redis.del(u.id + '_achs');
    redis.del(u.id + '_user');
    return AchieveModel.findOneAndUpdate({ _id: id }, { $set: { crit: achieve.crit, chars: achieve.chars, status: achieve.status, achievement: achieve.achievement, ball: achieve.ball, SZ: achieve.SZ, achDate: achieve.achDate } }, function (err, result) {
    })
};

exports.registerUser = function (userId, lastname, name, patronymic, birthdate, faculty, course, type) {
    redis.set(id + '_reg', true);
    redis.del(id + '_user');
    return UserModel.findOneAndUpdate({ id: userId }, { $set: { LastName: lastname, FirstName: name, Patronymic: patronymic, Birthdate: birthdate, Faculty: faculty, Course: course, Type: type, Registered: true } })
};

exports.addAchieveToUser = function (userId, achieveId) {
    redis.del(userId + '_achs');
    redis.del(userId + '_user');
  return UserModel.findOneAndUpdate({ id: userId }, { $push: { Achievement: achieveId } })
};

exports.AddToRating = async function (userId) {
    let u = await UserModel.findOne({ _id: userId });
    redis.del(u.id + '_user');
    return UserModel.findOneAndUpdate({ _id: userId }, { $set: { IsInRating: true } })
};

exports.RemoveFromRating = async function (userId) {
    let u = await UserModel.findOne({ _id: userId });
    redis.del(u.id + '_user');
    return UserModel.findOneAndUpdate({ _id: userId }, { $set: { IsInRating: false } })
};

exports.ChangeAchieve = async function (id,isGood) {
    redis.del(id + '_ach2');
    u = await UserModel.findOne({Achievement: {$elemMatch: {$eq: id}}}).lean();

    redis.del(u.id + '_achs');
  if (isGood === true) {
      let Ach = await AchieveModel.findById(id);
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
};


exports.comment = async function(id,comment){
    redis.del(id + '_ach2');
    u = await UserModel.findOne({Achievement: {$elemMatch: {$eq: id}}}).lean();
    redis.del(u.id + '_achs');
  return AchieveModel.findOneAndUpdate({ _id: id }, { $set: { comment: comment} }, function (err, result) {
  })
};

exports.toggleHide = async function (id) {
    u = await UserModel.findById(id);
    redis.del(id + '_user');
    return UserModel.findOneAndUpdate({_id: id}, {$set: {IsHiddenInRating: (!u.IsHiddenInRating)}}, function (err, result) {
    })
};


exports.allAchieves = function () {
  return AchieveModel.find({}).lean()
};

exports.setBalls = function(id,balls){
    redis.del(id + '_user');
  return UserModel.findOneAndUpdate({ id: id }, { $set: { Ball: balls} }, function (err, result) {
  })
};

exports.UserSuccesAchs = async function(id){
    let User = await UserModel.findOne({id: id});
    let Achs = User.Achievement;
    let SucAchs = [];
  for(let achID of Achs) {
      let ach = await AchieveModel.findById(achID);
    if(ach && (ach.status === 'Принято' || ach.status === 'Принято с изменениями')){
      SucAchs.push(ach)
    }
  }
  return SucAchs
};

exports.GetFaculty = async function(Name) {
    return await FacultyModel.findOne({Name: Name});
};

exports.GetAllFaculties = async function () {
    return await FacultyModel.find().lean();
};


exports.CreateFaculty = async function (Faculty) {
    let superAdmins = await UserModel.find({Role: 'SuperAdmin'});
    let faculty = await FacultyModel.create(Faculty);
    for (let superAdmin of superAdmins) {
        if (!superAdmin.Rights) superAdmin.Rights = [];
        superAdmin.Rights.push(Faculty.Name);
        await UserModel.findOneAndUpdate({'_id': superAdmin._id}, {$set: {Rights: superAdmin.Rights}});
        redis.del(superAdmin.Id + '_user');
    }
    return faculty
};

exports.GetCriterias = async function (facultyName) {
    let facObject = await FacultyModel.findOne({Name: facultyName});
    if (facObject.CritsId)
        return await CriteriasModel.findById(facObject.CritsId, 'Crits');
    else return undefined
};


exports.ChangeRole = function (id, isAdmin) {
    redis.del(id + '_user');
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
};

exports.GetHistoryNotes = async function () {
    return HistoryNoteModel.find({});
};

exports.createHistoryNote = async function (historyNote) {
    return HistoryNoteModel.create(historyNote)
};

exports.UploadCriteriasToFaculty = async function (crits, faculty) {
    console.log('FIND', faculty);
    let facultyObject = await FacultyModel.findOne({Name: faculty});
    console.log('FOUND', facultyObject);
    let critsObject = {};
    critsObject.Date = Date.now();
    critsObject.Crits = JSON.stringify(crits.crits);
    critsObject.CritsSchema = JSON.stringify(crits.schema);
    critsObject.FacultyId = facultyObject._id.toString();

    critsObject = await CriteriasModel.create(critsObject);
    await FacultyModel.findOneAndUpdate({Name: faculty}, {$set: {CritsId: critsObject._id.toString()}})
};

exports.createConfirmation = async function (confirmation) {
    return ConfirmationModel.create(confirmation)
};

exports.getConfirmByIdForUser = async function (confirmation) {
    return ConfirmationModel.findById(confirmation)
};