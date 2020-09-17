'use strict';

const fs = require('fs');
const path = require('path');

const UserModel = require('../models/user.js');
const AchieveModel = require('../models/achieve');
const FacultyModel = require('../models/faculty');
const facultyCache = require('../resources/facultyCacheInstance');
const CriteriasModel = require('../models/criterias');
const criteriasCache = require('../resources/criteriasCacheInstance');
const ConfirmationModel = require('../models/confirmation');
const HistoryNoteModel = require('../models/historyNote');
const AnnotationsModel = require('../models/annotation');
const annotationsCache = require('../resources/annotationsCacheInstance');
const achievementsProcessing = require('../services/achievementsProcessing');
const { BloomFilter } = require('bloom-filters');
const md5 = require('md5');

exports.findUserById = async function(id) {
  return UserModel.findOne({id: id}).lean();
};

exports.getUserWithConfirmations = async function(id) {
    return UserModel.findOne({id: id}).populate({
        path: 'Confirmations'
    }).lean();
};

async function getUserWithAchievements(id, isArchived) {
  let query;
  if (isArchived) {
    query = { $or: [{achDate: {$lt: '2019-09-1'}}, {isArchived: true}] };
  } else {
    query = { achDate: {$gte: '2019-09-1'}, isArchived: {$ne: true} };
  }
  const user = await UserModel.findOne({id: id}).populate(
      {
        path: 'Achievement',
        match: query,
        populate: {
          path: 'confirmations.id',
          select: '-FilePath'
        },
      },
  ).lean();

  if (!user) return null;

  for (let i = 0; i < user.Achievement.length; i++) {
    for (let j = 0; j < user.Achievement[i].confirmations.length; j++) {
      const confirmation = user.Achievement[i].confirmations[j];
      const inner = confirmation.id;
      confirmation.id = undefined;
      user.Achievement[i].confirmations[j] = Object.assign(confirmation, inner);
    }
  }

  return user;
}

exports.findUserByIdWithAchievements = async function(id) {
  return getUserWithAchievements(id, false);
};

exports.findUserByIdWithArchivedAchievements = async function(id) {
  return getUserWithAchievements(id, true);
};


exports.findUser = function(id) {
  return UserModel.findById(id).lean();
};

exports.getUserRights = function(id) {
  return UserModel.findOne({id: id}, 'Role Rights').lean();
};

exports.findUserByAchieve = async function(id) {
  const ach = await AchieveModel.findById(id.toString());
  return UserModel.findOne({Achievement: {$elemMatch: {$eq: ach}}}).lean();
};

exports.archiveAchievements = async function() {
  await AchieveModel.updateMany({status: 'Отказано'}, {$set:{isArchived: true}});
  console.log('UPDATED');
};

exports.migrate = async function(id) {
  const u = await UserModel.findOne({SpbuId: id + '@student.spbu.ru', id: {$ne: id}}).lean();
  if (u) {
    await UserModel.findOneAndUpdate({id: id}, {
      $set: {
        LastName: u.LastName,
        FirstName: u.FirstName,
        Patronymic: u.Patronymic,
        SpbuId: id + '@student.spbu.ru',
        Birthdate: u.Birthdate,
        Faculty: u.Faculty,
        Registered: true,
        Course: u.Course,
        Type: u.Type,
        IsInRating: false,
        Settings: u.Settings,
        Achievement: u.Achievement,
        Confirmations: u.Confirmations,
        Role: u.Role,
        Rights: u.Rights,
      },
    });

    if (u.id !== id) {
      await UserModel.findOneAndRemove({_id: u._id});
    }
  }
};

exports.isRegistered = async function(id) {
  const u = await UserModel.findOne({id: id}, 'Registered').lean();
  return u.Registered;
};


exports.getAdminsForFaculty = function(facultyName) {
  return UserModel.find({Role: {$in: ['Admin', 'Moderator']}, Rights: {$elemMatch: {$eq: facultyName}}}).lean();
};

exports.getCurrentUsers = function(faculty) {
  return UserModel.find({Faculty: faculty, IsInRating: true}).lean();
};

exports.getNewUsers = function(faculty) {
  return UserModel.find().or([{Faculty: faculty, IsInRating: undefined}, {Faculty: faculty, IsInRating: false}]).lean();
};

exports.getCompletelyAllUsersAchievements = async function(faculty) {
    const populateQuery = {
        path: 'Achievement'
    };
    return UserModel.find({Faculty: faculty}).populate(populateQuery).lean();
}

exports.getUsersWithAllInfo = async function(faculty, checked=false, stale=false) {
  let query;
  const populateQuery = {
    path: 'Achievement',
    match: {achDate: {$gte: '2019-09-1'}, isArchived: {$ne: true}},
    populate: {
      path: 'confirmations.id',
    },
  };
  if (!checked) {
    query = {$or: [{Faculty: faculty, IsInRating: undefined}, {Faculty: faculty, IsInRating: false}]}
  } else {
    query = {Faculty: faculty, IsInRating: true};
  }
  return UserModel.find(query).populate(populateQuery).lean();
};

exports.isUser = function(token) {
  return UserModel.findOne({id: token}, function(err, user) {
    if (err) {
      return false;
    }

    return !!user;
  });
};

exports.createUser = function(User) {
  return UserModel.create(User);
};

exports.findActualAchieves = async function(userId) {
  const User = await UserModel.findOne({id: userId}, 'Achievement').populate(
      {
        path: 'Achievement',
        match: {isArchived: {$ne: true}},
      },
  ).lean();
  const b = User.Achievement;
  const actualAchieves = [];
  const minimalDate = new Date(2019, 8, 1, 0, 0, 0, 0);
  const minimal7aDate = new Date(2020, 6, 1, 0, 0, 0, 0);
  for (let i = 0; i < b.length; i++) {
    if (b[i].crit === '7а' || b[i].crit === '1 (7а)') {
      if (b[i].achDate >= minimal7aDate) {
         actualAchieves.push(b[i]);
      }
      continue;
    }

    if (b[i].achDate >= minimalDate) {
      actualAchieves.push(b[i]);
    }
  }
  return actualAchieves;
};

exports.findAchieveById = async function(id) {
  return AchieveModel.findById(id).lean();
};

exports.createAchieve = async function(achieve) {
  if (achieve.crit === '7а' || achieve.crit === '1 (7а)') {
    achieve.achDate = new Date(2020, 6, 1, 0, 0, 0, 0);
  }
  return AchieveModel.create(achieve);
};

exports.deleteAchieve = async function(id) {
  const u = await UserModel.findOne({Achievement: {$elemMatch: {$eq: id.toString()}}}).lean();
  if (!u) return true;
  for (let i = u.Achievement.length - 1; i >= 0; i--) {
    if (u.Achievement[i].toString() === id) {
      u.Achievement.splice(i, 1);
      break;
    }
  }
  await UserModel.updateOne({id: u.id}, {Achievement: u.Achievement}).lean();
  await AchieveModel.findByIdAndRemove(id);
  return true;
};

exports.updateAchieve = async function(id, achieve) {
  const newAch = {
    crit: achieve.chars ? achieve.chars[0] : null,
    chars: achieve.chars, status: achieve.status,
    achievement: achieve.achievement, ball: achieve.ball,
    achDate: achieve.achDate, comment: achieve.comment,
    endingDate: achieve.endingDate,
    isPendingChanges: achieve.isPendingChanges,
    preliminaryBall: achieve.preliminaryBall,
  };

  newAch.confirmations = achieve.confirmations;
  if (achieve.confirmations && achieve.confirmations.length > 0) {

    for (let i = 0; i < achieve.confirmations.length; i++) {
      newAch.confirmations[i] = achieve.confirmations[i];
    }
  }

  return AchieveModel.updateOne({_id: id}, {
    $set: newAch,
  }).lean();
};

exports.registerUser = async function(userId, lastname, name, patronymic, birthdate, spbuId, newFaculty, course, type, settings) {
    const {Faculty} = await UserModel.findOne({id: userId}, 'Faculty').lean();
    await UserModel.findOneAndUpdate({id: userId}, {
        $set: {
            LastName: lastname,
            FirstName: name,
            Patronymic: patronymic,
            Birthdate: birthdate,
            Faculty: newFaculty,
            Course: course,
            Type: type,
            Registered: true,
            Settings: settings,
        },
    });
    if (Faculty !== newFaculty && Faculty) {
        const userObject = await exports.findUserByIdWithAchievements(userId);
        const criterias = await exports.getCriteriasObject(newFaculty);
        if (!userObject.Achievement) {
            return;
        }
        for (let ach of userObject.Achievement) {
            //await exports.checkActualityOfAchievementCharacteristics(ach, criterias);
        }
        await achievementsProcessing.calculateBallsForUser(userId, newFaculty);
        await achievementsProcessing.calculateBallsForUser(userId, newFaculty, true);
    }
};


exports.addAchieveToUser = async function(userId, achieveId) {
  return UserModel.updateOne({id: userId}, {$push: {Achievement: achieveId}}).lean();
};

exports.addUserToRating = async function(userId, Direction) {
  if (Direction) {
    return UserModel.updateOne({_id: userId}, {$set: {IsInRating: true, Direction: Direction}}).lean();
  } else {
    return UserModel.updateOne({_id: userId}, {$set: {IsInRating: true}}).lean();
  }
};

exports.removeUserFromRating = async function(userId) {
  return UserModel.updateOne({_id: userId}, {$set: {IsInRating: false}}).lean();
};

exports.changeAchieveStatus = async function(id, accept = false) {
  let newStatus;
  if (accept) {
    const Ach = await AchieveModel.findById(id, 'status').lean();
    if (Ach.status === 'Изменено' || Ach.status === 'Принято с изменениями') {
      newStatus = 'Принято с изменениями';
    } else {
      newStatus = 'Принято';
    }
  } else {
    newStatus = 'Отказано';
  }

  return AchieveModel.updateOne({_id: id}, {$set: {status: newStatus, isPendingChanges: false}}).lean();
};


exports.comment = async function(id, comment) {
  return AchieveModel.updateOne({_id: id}, {$set: {comment: comment}}).lean();
};

exports.toggleHide = async function(id) {
  const u = await UserModel.findById(id);
  return UserModel.findOneAndUpdate({_id: id}, {$set: {IsHiddenInRating: (!u.IsHiddenInRating)}}, function(err, result) {
  });
};

exports.getFaculty = async function(facultyName) {
  return facultyCache.get(facultyName);
};

exports.getAllFaculties = async function() {
  return FacultyModel.find().lean();
};

exports.createFaculty = async function(faculty) {
  const superAdmins = await UserModel.find({Role: 'SuperAdmin'});
  const createdFacultyObj = await FacultyModel.create(faculty);
  for (const superAdmin of superAdmins) {
    if (!superAdmin.Rights) superAdmin.Rights = [];
    superAdmin.Rights.push(faculty.Name);
    await UserModel.findOneAndUpdate({'_id': superAdmin._id}, {$set: {Rights: superAdmin.Rights}});
  }
  return createdFacultyObj;
};

exports.getRawCriteriasAndLimits = async function(facultyName) {
  const crits = await criteriasCache.get(facultyName);
  if (!crits) {
    return null;
  }
  return {Crits: crits.rawCrits, Limits: crits.Limits};
};

exports.getCriteriasAndLimits = async function(facultyName) {
  const crits = await criteriasCache.get(facultyName);
  if (!crits) {
    return null;
  }
  return {Crits: crits.Crits, Limits: crits.Limits};
};

exports.getCriteriasObject = async function(facultyName) {
  const crits = await criteriasCache.get(facultyName);
  if (!crits) {
    return null;
  }
  return crits.Crits;
};

exports.getCriteriasAndSchema = async function(facultyName) {
  const facObject = await FacultyModel.findOne({Name: facultyName}, 'CritsId').populate(
      'CritsId', 'Crits CritsSchema Limits'
  ).lean();
  return facObject.CritsId;
};

exports.uploadAnnotationsToFaculty = async function(annotations, learningProfile, languagesForPublications,  facultyName) {
  const facObject = await FacultyModel.findOne({Name: facultyName});
  let annObj = {
      Date: Date.now(),
      AnnotationsToCrits: annotations,
      LearningProfile: learningProfile,
      LanguagesForPublications: languagesForPublications,
      FacultyId: facObject._id};
  annObj = await AnnotationsModel.create(annObj);
  await FacultyModel.findByIdAndUpdate(facObject._id, {$set: {AnnotationsToCritsId: annObj._id.toString()}});
  facultyCache.clear(facultyName);
  return annObj;
};

exports.getAnnotationsForFaculty = async function(facultyName) {
  return annotationsCache.get(facultyName);
};

exports.changeRole = async function(reqUserId, userId, newRole, faculty) { // TODO Refactor
    const requestingUser = await UserModel.findOne({id: reqUserId}).lean();
    if (!requestingUser.Rights.includes(faculty)) {
        return null;
    }
    const user = await UserModel.findOne({id: userId}).lean();
    if (newRole !== 'User' && user.Faculty !== faculty) {
        return null;
    }

    if (user.Rights.includes(faculty) && newRole !== 'User') {
        return UserModel.updateOne({id: userId}, {$set: {Role: newRole}}).lean();
    } else if (newRole !== 'User') {
        return UserModel.updateOne({id: userId}, {$set: {Role: newRole}, $push: {Rights: faculty}}).lean();
    } else {
        return UserModel.updateOne({id: userId}, {$set: {Role: newRole}, $pull: {Rights: faculty}}).lean();
    }
};

exports.getHistoryNotes = async function() {
  return HistoryNoteModel.find({});
};

exports.createHistoryNote = async function(historyNote) {
  return HistoryNoteModel.create(historyNote);
};

exports.uploadCriteriasToFaculty = async function(crits, faculty) {
  const facultyObject = await FacultyModel.findOne({Name: faculty});
  let critsObject = {};
  critsObject.Date = Date.now();
  critsObject.Crits = JSON.stringify(crits.crits);
  critsObject.Hash = md5(JSON.stringify(crits.crits));
  critsObject.CritsSchema = JSON.stringify(crits.schema);
  critsObject.Limits = crits.limits;
  critsObject.FacultyId = facultyObject._id.toString();

  critsObject = await CriteriasModel.create(critsObject);
  await FacultyModel.updateOne({Name: faculty}, {$set: {CritsId: critsObject._id.toString()}}).lean();
  facultyCache.clear(faculty);
};

const errorRate = 0.05;
const filter = BloomFilter.create(10000, errorRate);
ConfirmationModel.find({}).lean().then((hashes) => {
    console.log('Set Bloom filter');
    hashes = hashes.filter((x) => x.Hash).map((x) => x.Hash);
    for (let hash of hashes) {
        filter.add(hash);
    }
});

exports.createConfirmation = async function(confirmation) {
    let exists = false;
    if (confirmation.Hash && confirmation.FilePath) {
        if (filter.has(confirmation.Hash)) {
            const sameFile = await ConfirmationModel.findOne({Hash: confirmation.Hash, Size: confirmation.Size}).lean();
            if (sameFile && sameFile.FilePath && sameFile.Size === confirmation.Size) {
                const confPath = path.join(__dirname, '../static/confirmations/');
                const fileName = path.basename(sameFile.FilePath);
                try {
                    await fs.promises.access(confPath + fileName);
                    fs.promises.unlink(confPath + path.basename(confirmation.FilePath)).then();
                    confirmation.FilePath = sameFile.FilePath;
                    exists = true;
                } catch (e) {
                }
            }
        } else {
            filter.add(confirmation.Hash);
        }
    }
  return [ConfirmationModel.create(confirmation), exists];
};

exports.getConfirmationFileStream = async function(filePath) {
    const confirmPath = path.join(__dirname, '../static/confirmations/');
    filePath = confirmPath + path.basename(filePath);
    try {
        await fs.promises.access(filePath);
    } catch (error) {
        const sameFile = await ConfirmationModel.findOne({Data: '/api/getConfirm/' + path.basename(filePath)}, 'FilePath').lean();
        if (!sameFile) {
            return null;
        }

        try {
            filePath = confirmPath + path.basename(sameFile.FilePath);
            await fs.promises.access(filePath);
        } catch (error) {
            return null;
        }
    }
    const stream = fs.createReadStream(filePath);
    const stat = await fs.promises.stat(filePath);
    return {stream, stat};
};

exports.getConfirmByIdForUser = async function(confirmation) {
  return ConfirmationModel.findById(confirmation).lean();
};

exports.getConfirmations = async function(confIds) {
  return ConfirmationModel.find({_id: {$in: confIds}}, '-FilePath').lean();
};

exports.addConfirmationToUser = async function(userId, confId) {
  return UserModel.updateOne({_id: userId}, {$push: {Confirmations: confId}}).lean();
};

exports.deleteConfirmation = async function(userId, confirmationId) {
  const usingAchievements = await AchieveModel.find({
    status: {$in: ['Принято', 'Принято с изменениями', 'Отклонено']},
    confirmations: {$elemMatch: {id: confirmationId}}
  });
  if (usingAchievements && usingAchievements.length > 0) return;

  const user = await UserModel.findOne({id: userId}).lean();
  if (!(user.Confirmations.some(x => x.toString() === confirmationId))) return;

  await UserModel.updateOne({id: userId}, {$pull: {Confirmations: confirmationId}}).lean();
  const achieveUpdatePromise = AchieveModel.updateMany(
      {confirmations: {$elemMatch: {id: confirmationId}}},
      {$pull: {confirmations: {id: confirmationId}}}
      );
  const confirmation = await ConfirmationModel.findOne({_id: confirmationId}).lean();
  await ConfirmationModel.deleteOne({_id: confirmationId});
  await achieveUpdatePromise;
  if (confirmation.Type === 'doc') {
      try {
            await fs.promises.access(confirmation.FilePath);
            const anotherUser = await ConfirmationModel.findOne({FilePath: confirmation.FilePath}).lean();
            if (anotherUser) {
                return;
            }
            fs.promises.unlink(confirmation.FilePath).then();
      } catch (e) {}
    }
};

exports.updateConfirmCrawlResult = async function(confirmId, crawlResult) {
  return ConfirmationModel.findByIdAndUpdate(confirmId, {$set: {CrawlResult: crawlResult, IsCrawled: true}});
};

exports.getconfitmationsStatistics = async function() {
  const filePath = path.join(__dirname, '../static/confirmations/');
  const populateQuery = {
    path: 'Achievement',
    match: {achDate: {$gte: '2019-09-1'}, isArchived: {$ne: true}},
    populate: {
      path: 'confirmations.id',
    },
  };
    const confirmations = [];
    const users = await UserModel.find({}, 'Achievement')
        .populate(populateQuery);
    for (let i = 0; i < users.length; i++) {
      for (let ach of users[i].Achievement) {
        for (let confirm of ach.confirmations) {
          if (confirm.id && confirm.id.FilePath && !(path.basename(confirm.id.FilePath) in confirmations)) {
            confirmations.push(path.basename(confirm.id.FilePath));
          }
        }
      }
    }
    const usedFiles = confirmations;
    const files = await fs.promises.readdir(filePath);
    const forgottenFiles = [];
    const missedFiles = [];
    let totalUselessSize = 0;
    for (let file of files) {
        if (usedFiles.findIndex(x => x === file) === -1) {
            forgottenFiles.push(file);
            const stat = await fs.promises.stat(filePath + file);
            totalUselessSize += stat.size;
        }
    }
    for (let file of usedFiles) {
        if (files.findIndex(x => x === file) === -1) {
            missedFiles.push(file);
        }
    }

    const stat = await fs.promises.lstat(filePath);
    const totalSize = (stat.size / 1024 / 1024).toFixed(2) + ' Мб';
    totalUselessSize = (totalUselessSize / 1024 / 1024).toFixed(2) + ' Мб';
    return {totalSize, totalUselessSize, forgottenFiles, missedFiles};
};

exports.purgeConfirmations = async function() {
    return null;
    const filePath = path.join(__dirname, '../static/confirmations/');
    const populateQuery = {
        path: 'Achievement',
        match: {achDate: {$gte: '2019-09-1'}, isArchived: {$ne: true}},
        populate: {
            path: 'confirmations.id',
        },
    };
    const confirmations = [];
    const users = await UserModel.find({}, 'Achievement')
        .populate(populateQuery);
    for (let i = 0; i < users.length; i++) {
        for (let ach of users[i].Achievement) {
            for (let confirm of ach.confirmations) {
                if (confirm.id && confirm.id.FilePath && !(path.basename(confirm.id.FilePath) in confirmations)) {
                    confirmations.push(path.basename(confirm.id.FilePath));
                }
            }
        }
    }
    const usedFiles = confirmations;
    const files = await fs.promises.readdir(filePath);
    const forgottenFiles = [];
    const missedFiles = [];
    let totalUselessSize = 0;
    for (let file of files) {
        if (usedFiles.findIndex(x => x === file) === -1) {
            forgottenFiles.push(file);
            const stat = await fs.promises.stat(filePath + file);
            totalUselessSize += stat.size;
        }
    }
    for (let file of usedFiles) {
        if (files.findIndex(x => x === file) === -1) {
            missedFiles.push(file);
        }
    }

    const stat = await fs.promises.lstat(filePath);
    const totalSize = (stat.size / 1024 / 1024).toFixed(2) + ' Мб';
    totalUselessSize = (totalUselessSize / 1024 / 1024).toFixed(2) + ' Мб';

    const confirmationsIds = [];
    for (let forgottenFile of forgottenFiles) {
        const confirmation = await ConfirmationModel.findOne({FilePath: filePath + forgottenFile}).lean();
        if (confirmation) {
            confirmationsIds.push(confirmation._id);
        }
    }

    for (let confId of confirmationsIds) {
        await UserModel.updateOne({Confirmations: {$elemMatch: {id: confId}}},
            {$pull: {Confirmations: {id: confId}}});
        await ConfirmationModel.deleteOne({_id: confId});
    }
    for (let forgottenFile of forgottenFiles) {
      await fs.promises.unlink(filePath + forgottenFile);
    }
    return {totalSize, ClearedSpace: totalUselessSize, RemovedIds: confirmationsIds};
};


exports.getStatisticsForFaculty = async function(facultyName, isInRating = true) { // TODO REFACTOR!!
  const users = await UserModel.find({Faculty: facultyName, IsInRating: isInRating})
      .populate(
          {
            path: 'Achievement',
          },
      ).lean();

  let articlesIndexCol = 3;
  if (facultyName === 'Физфак') articlesIndexCol = 2;
  let achCount = 0;
  const critsCounts = {};
  const critsBalls = {};
  const achieves = {};
  const achievesBalls = {};
  let RINC = 0;
  let SCOPUS = 0;
  let VAK = 0;
  let unindexed = 0;
  let accepted = 0;
  let declined = 0;
  let waitingForCheck = 0;
  for (const user of users) {
    for (const ach of user.Achievement) {
      if (ach.status === 'Отказано') declined += 1;
      if (ach.status === 'Ожидает проверки' || !ach.status) waitingForCheck += 1;
      if (ach.status !== 'Принято' && ach.status !== 'Принято с изменениями') continue;
      accepted += 1;
      achCount += 1;
      if (!critsCounts[ach.chars[0]]) {
        critsCounts[ach.chars[0]] = 0;
        critsBalls[ach.chars[0]] = 0;
      }
      critsCounts[ach.chars[0]] += 1;
      critsBalls[ach.chars[0]] += ach.ball;

      if (!achieves[ach.chars[0] + ' ' + ach.chars[1]]) {
        achieves[ach.chars[0] + ' ' + ach.chars[1]] = 0;
        achievesBalls[ach.chars[0] + ' ' + ach.chars[1]] = 0;
      }

      if (ach.chars[0] === '6 (9а)') {
        if (!achieves[ach.chars[0] + ' ' + ach.chars[1] + ' ' + ach.chars[2]]) {
          achieves[ach.chars[0] + ' ' + ach.chars[1] + ' ' + ach.chars[2]] = 0;
          achievesBalls[ach.chars[0] + ' ' + ach.chars[1] + ' ' + ach.chars[2]] = 0;
        }
        achieves[ach.chars[0] + ' ' + ach.chars[1] + ' ' + ach.chars[2]] += 1;
        achievesBalls[ach.chars[0] + ' ' + ach.chars[1] + ' ' + ach.chars[2]] += ach.ball;
      }

      achieves[ach.chars[0] + ' ' + ach.chars[1]] += 1;
      achievesBalls[ach.chars[0] + ' ' + ach.chars[1]] += ach.ball;

      if (ach.chars.some((x) => x.indexOf('РИНЦ') > 0)) RINC += 1;
      else
      if (ach.chars.some((x) => x.indexOf('Scopus') > 0)) SCOPUS += 1;
      else
      if (ach.chars.some((x) => x.indexOf('ВАК') > 0)) VAK += 1;
      else if (ach.chars[0] === '5 (8б)' || ach.chars[0] === '8б') unindexed += 1;
    }
  }
  return {
    'Total achs count': achCount,
    'Accepted': accepted,
    'Declined': declined,
    'Waiting': waitingForCheck,
    'RINC': RINC,
    'SCOPUS': SCOPUS,
    'VAK': VAK,
    'Unindexed': unindexed,
    'CritsCounts': critsCounts,
    'CritsBalls': critsBalls,
    'Achieves': achieves,
    'AchievesBalls': achievesBalls,
  };
};

exports.validateAchievement = async function(achievement, user) { // TODO refactor
  if (!achievement || !user) return false;
  const crits = await exports.getCriteriasObject(user.Faculty);
  if (!crits) {
    throw new Error('There are no criterion for faculty ' + user.Faculty);
  }

  try {
    const critsTitles = Object.keys(crits);
    if (!achievement.crit || !achievement.chars || !Array.isArray(achievement.chars)) return false;
    if (!(crits[achievement.crit])) return false;
    // проверка характеристик
    let currentLevelOfCriterion = crits;
    for (let i = 0; i < achievement.chars.length; i++) {
      if (!currentLevelOfCriterion[achievement.chars[i]]) return false;
      currentLevelOfCriterion = currentLevelOfCriterion[achievement.chars[i]];
    }
    if (isNaN(Number(Object.keys(currentLevelOfCriterion)[0]))) {
      // в старой версии критериев было допустимо опускать характеристики в 7а
      if (achievement.crit !== critsTitles[0]) return false;
      currentLevelOfCriterion = currentLevelOfCriterion[Object.keys(currentLevelOfCriterion)[0]];
      if (isNaN(Number(currentLevelOfCriterion[Object.keys(currentLevelOfCriterion)[0]]))) return false;
    }
    // проверка даты и описания; в 7а это не нужно
    if (achievement.crit !== critsTitles[0]) {
      if (!achievement.achievement) return false;
      if (!achievement.achDate) return false;
      const achDate = new Date(achievement.achDate);
      if (!(achDate instanceof Date)) return false;
      const minimalDate = new Date('2019-09-01');
      const maximalDate = new Date('2020-08-31');
      if (achDate < minimalDate || achDate > maximalDate) return false;
      if (achievement.endingDate) {
        const achEndingDate = new Date(achievement.endingDate);
        if (!(achEndingDate instanceof Date)) return false;
        if (achEndingDate < achDate) return false;
      }
    }
    return true;
  } catch (e) {
    console.error('Ach validation error | User: ' + user.id, e);
  }
};

function checkAchievement(achievement, criterias, user) {
    let notSure = false;
    const correctChars = [];
    const incorrectChars = [];
    let currentLevel = criterias;
    if (Object.keys(criterias)[0].indexOf('(') === -1) {
        if (achievement.crit.indexOf('(') !== -1) {
            achievement.crit = achievement.crit.substring(
                achievement.crit.indexOf('(')+1,
                achievement.crit.indexOf(')'),
            );

            if (achievement.crit === '7а') {
                if (user) {
                    let newChar;
                    if (user.Type === 'Бакалавриат' || user.Type === 'Специалитет') {
                        newChar = 'Студентом бакалавриата или специалитета';
                    } else {
                        newChar = 'Студентом магистратуры';
                    }
                    achievement.chars.push(newChar);
                }
            }

            if (achievement.crit === '10в') {
                achievement.crit = '9а';
                achievement.chars.splice(1, 0, 'Организация прочих мероприятий');
            } else if (achievement.crit === '9а' && achievement.chars.length > 4) {
                achievement.chars.splice(1, 1, 'Организация мероприятий при участии СПбГУ');

            } else if (achievement.crit === '8б') {
                achievement.chars.splice(2, 1);
                let haveBdnsk = false;
                for (let i = 0; i < achievement.chars.length; i++) {
                    achievement.chars[i] = achievement.chars[i].replace(/ \(\d+\)$/, '').trim();
                    if (achievement.chars[i] === 'Тезисы и (или) научные телеграммы') achievement.chars[i] = 'Тезисы';
                    if (achievement.chars[i] === 'Публикация (кроме тезисов и научных телеграмм)') achievement.chars[i] = 'Публикация (кроме тезисов)';
                    if (achievement.chars[i] === 'СДнСК') {
                        achievement.chars[i] = 'СДнК';
                        haveBdnsk = true;
                    }
                    if (achievement.chars[i] === 'БДнСК') {
                        achievement.chars[i] = 'БДнК';
                        haveBdnsk = true;
                    }
                    if (achievement.chars[i] === 'Русский язык') achievement.chars[i] = 'Иные языки';
                    if (achievement.chars[i] === 'Иностранный язык') {
                        achievement.chars[i] = 'Международные языки';
                        notSure = true;
                    }
                    if (achievement.chars[i] === 'Неиндексируемое') achievement.chars[i] = 'Не индексируемое';
                }

                let dspoInd = achievement.chars.indexOf('ДСПО');
                if (dspoInd === -1) dspoInd = achievement.chars.indexOf('ДнСПО');
                if (!haveBdnsk) {
                    achievement.chars.splice(dspoInd, 0, 'БДнК');
                    notSure = true;
                }
            } else if (achievement.crit === '9б') {
                for (let i = 0; i < achievement.chars.length; i++) {
                    achievement.chars[i] = achievement.chars[i].replace(/ \(\d+\)$/, '').trim();
                    if (achievement.chars[i] === 'Периодика (печать)') achievement.chars[i] = 'Печатные издания и интернет-медиа';
                }
            } else if (achievement.crit === '11а') {
                for (let i = 0; i < achievement.chars.length; i++) {
                    if (achievement.chars[i] === 'Очн. уч.') achievement.chars[i] = 'Очно';
                    if (achievement.chars[i] === 'Заочн. уч.') achievement.chars[i] = 'Заочно';
                }
            }

            for (let i = 0; i < achievement.chars.length; i++) {
                achievement.chars[i] = achievement.chars[i].replace(/ \(\d+\)$/, '').trim();
                if (achievement.chars[i] === 'На уровне СНГ') {
                    achievement.chars[i] = 'На международном уровне';
                    notSure = true;
                }
                if (achievement.chars[i] === 'На уровне федерального округа') {
                    achievement.chars[i] = 'На всероссийском уровне';
                    notSure = true;
                }
            }

            achievement.chars[0] = achievement.crit;
        }
    }

    for (let i = 0; i < achievement.chars.length; i++) {
        achievement.chars[i] = achievement.chars[i].replace(/\(\d*\)/g, '').trim();
        if (currentLevel[achievement.chars[i]]) {
            correctChars.push(achievement.chars[i]);
            currentLevel = currentLevel[achievement.chars[i]];
        } else if (currentLevel[achievement.chars[i] + ' (ДКР)']) {
            correctChars.push(achievement.chars[i] + ' (ДКР)');
            currentLevel = currentLevel[achievement.chars[i] + ' (ДКР)'];
        } else {
            incorrectChars.push(achievement.chars[i]);
        }
    }
    return [achievement, currentLevel, correctChars, incorrectChars, notSure];
}

exports.checkActualityOfAchievementCharacteristics = async function(achievement, criterias, user) {
  if (achievement.criteriasHash && achievement.criteriasHash === criterias.Hash) return;

  const [migratedAchievement, currentLevel, correctChars, incorrectChars, notSure] = checkAchievement(achievement, criterias, user);
  achievement = migratedAchievement;

  if (!isNaN(Number(currentLevel[0]))) {
    console.log(Number(currentLevel[0]));
    console.log('CORRECT MIGRATION');
    achievement.chars = correctChars;
    if (notSure) {
        achievement.status = 'Ожидает проверки';
    }
    achievement.criteriasHash = criterias.Hash;
    await this.updateAchieve(achievement._id, achievement);
  } else {
    achievement.chars = correctChars;
    achievement.status = 'Данные некорректны';
    achievement.criteriasHash = criterias.Hash;
    achievement.ball = undefined;
    achievement.preliminaryBall = undefined;
    await this.updateAchieve(achievement._id, achievement);
  }
};

exports.checkCorrectnessInNewCriterias = async function(achievement, criterias, user) {
    const [migratedAchievement, currentLevel, correctChars, incorrectChars, notSure] = checkAchievement(achievement, criterias, user);
    achievement = migratedAchievement;

    if (!isNaN(Number(currentLevel[0]))) {
        return undefined;
    } else {
        return {oldChars: achievement.chars, incorrectChars: incorrectChars, notSure: notSure};
    }
};
