const db = require('./../controllers/dbController');
const getCurrentDate = require('../helpers/getCurrentDate');
const achievementsProcessing = require('./achievementsProcessing');

module.exports.getUserRights = async function(id) {
    return db.getUserRights(id);
};

module.exports.getUserInfo = async function(id) {
   return db.findUserByIdWithAchievements(id);
};

module.exports.getArchivedAchievements = async function(id) {
    return (await db.findUserByIdWithArchivedAchievements(id)).Achievement;
};

module.exports.getProfile = async function(id) {
    const user = await db.findUserById(id);

    if (user && user.Registered) {
        return {
            id: user.id,
            LastName: user.LastName,
            FirstName: user.FirstName,
            Patronymic: user.Patronymic,
            Birthdate: user.Birthdate,
            SpbuId: user.SpbuId,
            Faculty: user.Faculty,
            Direction: user.Direction,
            Settings: user.Settings,
            Type: user.Type,
            Course: user.Course,
            IsInRating: user.IsInRating,
            Registered: user.Registered,
        };
    } else return null;
};

module.exports.registerUser = async function(userId, userData, session) {
    await db.registerUser(userId, userData.lastname, userData.name, userData.patronymic,
        userData.birthdate, userData.spbuId, userData.faculty, userData.course, userData.type,
        userData.settings);
    session.passport.user.Registered = true;
    session.save(function(err) {
        console.log(err);
    });
};

const natural = require('natural');
const plainEK3Crits = [];
let roots = [];
function getCrit(crits, arr) {
    let critNames = Object.keys(crits);

    if (!isNaN(crits[critNames[0]])) {
        plainEK3Crits.push(arr);
        return;
    }

    for (let key of critNames) {
        getCrit(crits[key], [...arr, key]);
    }
}
const classifiers = {};
async function initClassifier(plainCrits, facultyName) {
    const users = await db.getCompletelyAllUsersAchievements(facultyName);
    const classifier = new natural.BayesClassifier(natural.PorterStemmerRu);
    plainCrits.forEach((x, index) => classifier.addDocument(x, index));
    let count = 0;
    for (let user of users) {
        if (!user.Achievement) continue;
        for (let ach of user.Achievement) {
            let str = '';
            for (let i = 0; i < ach.chars.length; i++) {
                str += ' ' + ach.chars[i];
            }
            let id = plainCrits.indexOf(str);
            if (id === -1 || !ach.achievement || ach.achievement.length === 0) continue;
            count += 1;
            classifier.addDocument(ach.achievement, id);
        }
    }

    console.log(facultyName, 'COUNT:', count);
    classifier.train();
    classifiers[facultyName] = [null, classifier];
}

async function initAllClassifiers(facultiesList) {
    const crit = await db.getCriteriasObject('ПМ-ПУ');
    roots = Object.keys(crit);
    getCrit(crit, []);
    const plainCrits = plainEK3Crits.map(x => {
        let str = '';
        for (let i = 0; i < x.length; i++) {
            str += ' ' + x[i];
        }
        return str;
    });
    facultiesList.forEach((fac) => initClassifier(plainCrits, fac).then());
}

initAllClassifiers(['ПМ-ПУ', 'Юридический', 'Социологический', 'Политологии', 'МКН', 'Исторический', 'Психологии', 'ВШМ']).then();

module.exports.addAchievement = async function(userId, achievement) {
    const user = await db.findUserById(userId);
    let validationResult = false;
    try {
        validationResult = await db.validateAchievement(achievement, user);
    } catch (e) {
        console.log('Ach validation outer error');
    }
    if (!validationResult) throw new TypeError();

    achievement.status = 'Ожидает проверки';
    achievement.date = getCurrentDate();
    achievement.comment = '';
    const createdAchieve = await db.createAchieve(achievement);
    await db.addAchieveToUser(userId, createdAchieve._id);
    await achievementsProcessing.calculateBallsForUser(user.id, user.Faculty, true);
};

module.exports.classifyDescription = async function(description, faculty = 'ПМ-ПУ') {
    if (!classifiers[faculty]) return undefined;
    return {root: null, classifier: plainEK3Crits[Number(classifiers[faculty][1].classify(description))]};
};

module.exports.updateAchievement = async function(userId, achId, achievement) {
    const user = await db.findUserById(userId);
    let validationResult = false;
    try {
        validationResult = await db.validateAchievement(achievement, user);
    } catch (e) {
        console.log('Ach validation outer error');
    }
    if (!validationResult) throw new TypeError();

    achievement.date = getCurrentDate();

    const oldAch = await db.findAchieveById(achId);
    achievement.comment = oldAch.comment;
    achievement.status = oldAch.status === 'Данные некорректны' ? 'Ожидает проверки' : oldAch.status;
    achievement.criteriasHash = oldAch.criteriasHash;
    achievement.isPendingChanges = oldAch.isPendingChanges;
    achievement.ball = oldAch.ball;

    for (const field of Object.keys(achievement)) {
        if (field === 'confirmations') {
            let confirmsIdentical = true;
            if (oldAch.confirmations.length !== achievement.confirmations.length) {
                confirmsIdentical = false;
            } else {
                for (let i = 0; i < oldAch.confirmations.length; i++) {
                    if (oldAch.confirmations[i].id.toString() !== achievement.confirmations[i].id.toString()) {
                        confirmsIdentical = false;
                        break;
                    }
                }
            }
            if (confirmsIdentical) {
                continue;
            } else {
                if (oldAch.status !== 'Ожидает проверки') {
                    achievement.isPendingChanges = true;
                }
                continue;
            }
        }
        if (field === 'achDate' || field === 'endingDate' || field === 'isPendingChanges' ||
            field === 'comment' || field === 'criteriasHash' ||
            field === 'date' || field === 'isArchived') {
            continue;
        }
        if (field === 'chars') {
            let changeDetected = false;
            if (oldAch.chars.length !== achievement.chars.length) {
                changeDetected = true;
            }
            for (let i = 0; i < oldAch.chars.length; i++) {
                if (oldAch.chars[i] !== achievement.chars[i]) {
                    changeDetected = true;
                    break;
                }
            }
            if (!changeDetected) continue;
        }
        if (oldAch[field] !== achievement[field]) {
            if (oldAch.status !== 'Ожидает проверки' && oldAch.status !== 'Данные некорректны') {
                console.log('Detected change in field:', field, oldAch[field], achievement[field]);
                throw new TypeError();
            }
        }
    }

    await db.updateAchieve(achId, achievement);
    await achievementsProcessing.calculateBallsForUser(userId, user.Faculty, true);
};

module.exports.deleteAchievement = async function(userId, achId) {
    let user = await db.findUserById(userId);

    if (!user.Achievement.some((o) => (o && o.toString() === achId))) {
        return null;
    }

    await db.deleteAchieve(achId);
    await achievementsProcessing.calculateBallsForUser(user.id, user.Faculty, true);
    return true;
};

module.exports.getAchievement = async function(achId) { //TODO what is it?
    const ach = await db.findAchieveById(achId);
    const confirms = [];

    for (let i = 0; i < ach.confirmations.length; i++) {
        const confirm = await db.getConfirmByIdForUser(ach.confirmations[i].id);
        confirm.additionalInfo = ach.confirmations[i].additionalInfo;
        confirms.push(confirm);
    }
    ach.confirmations = confirms;
    return ach;
};

module.exports.addFileForConfirmation = async function(userId, confirmationFile) {
    const userPromise = db.getUserWithConfirmations(userId);
    const [resultPromise, exists] = await db.createConfirmation(confirmationFile);
    const [user, result] = await Promise.all([userPromise, resultPromise]);
    result.FilePath = undefined;

    let sameFiles;
    if (user.Confirmations.some((x) => (x.Hash === confirmationFile.Hash && x.Size === confirmationFile.Size))) {
        sameFiles = user.Confirmations.filter((x) => (x.Hash === confirmationFile.Hash && x.Size === confirmationFile.Size));
        sameFiles.forEach((x) => x.FilePath = undefined);
    }

    if (!user.Confirmations || !user.Confirmations.some((x) => x._id.toString() === result._id.toString())) {
        await db.addConfirmationToUser(user._id, result._id)
    }
    return {result, sameFiles};
};

module.exports.addConfirmation = async function(userId, confirmation) {
    confirmation.Date = Date.now();
    if (confirmation.Data) {
        if (!(confirmation.Data.startsWith('http://') || confirmation.Data.startsWith('https://'))) {
            confirmation.Data = '//' + confirmation.Data;
        }
    }

    const userPromise = db.findUserById(userId);
    const [resultPromise, exists] = await db.createConfirmation(confirmation);
    const [user, result] = await Promise.all([userPromise, resultPromise]);

    if (!user.Confirmations || !user.Confirmations.some((x) => x === result._id.toString())) {
        await db.addConfirmationToUser(user._id, result._id);
    }

    return result;
};

module.exports.getConfirmationFileStream = async function(filePath) {
    return db.getConfirmationFileStream(filePath);
};

module.exports.deleteConfirmation = async function (userId, confirmationId) {
    return db.deleteConfirmation(userId, confirmationId);
}

module.exports.getConfirmations = async function(userId) { //TODO refactor
    const user = await db.findUserById(userId);
    return db.getConfirmations(user.Confirmations);
};

module.exports.getRating = async function(userId, facultyName) { //TODO refactor
   return achievementsProcessing.getRating(facultyName, false, userId);
};
