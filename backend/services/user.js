'use strict';
const db = require('./../controllers/dbController');
const getCurrentDate = require('../helpers/getCurrentDate');
const achievementsProcessing = require('./achievementsProcessing');
const fs = require('fs');
const path = require('path');

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
    await achievementsProcessing.calculateBallsForUser(user.id, user.Faculty);
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

module.exports.changeEmailForNotifications = async function(userId, email) {
    return db.changeNotificationEmail(userId, email);
};

module.exports.registerForNotifications = async function(userId, sessionId, notificationEndpoint) {
    return db.saveNotificationEndpoint(userId, sessionId, notificationEndpoint);
};

module.exports.unregisterForNotifications = async function(userId, sessionId) {
    return db.removeNotificationEndpoint(userId, sessionId);
};

module.exports.getNotificationsSubscriptions = async function(userId) {
    return db.getNotificationSettings(userId);
};

module.exports.unsubscribeEmail = async function(userId, email) {
    const user = await db.findUser(userId);
    if (!user) return false;
    const settings = await db.getNotificationSettings(user.id);
    if (!settings || settings.email !== email) return false;
    return db.changeNotificationEmail(user.id, undefined);
};


const getDateFromStr = require('../helpers/getDateFromStr');
module.exports.getPortfolio = async function(userId) {
    function createCharsString(chars) {
        const charsDictionary = {
            'ДСПО': 'Соответствует профилю обучения',
            'ДнСПО': 'Не соответствует профилю обучения',
            'БДнК': 'Без доклада на конференции',
            'СДнК': 'С докладом на конференции',
            'УД': 'Устный доклад',
            'СД': 'Стендовый доклад',
            'Заочн. уч.': 'Заочное участие',
            'Очн. уч.': 'Очное участие',
            'Заруб. изд.': 'Зарубежное издание',
            'Росс. изд.': 'Российское издание',
            'ММК': 'Материалы международной конференции',
            'Публикация (кроме тезисов)': 'Публикация',
            'Индивидуальный (один студент и, возможно, научный руководитель)': 'Индивидуальный',
            'Документ, удостоверяющий исключительное право студента на достигнутый им научный (научно-методический, научно-технический, научно-творческий) результат интеллектуальной деятельности (патент, свидетельство)': 'Исключительное право на достигнутый научный результат интеллектуальной деятельности (патент, свидетельство)'
        };

        let str = '';
        for (let i = 1; i < chars.length; i++) {
            let char = charsDictionary[chars[i]] || chars[i];
            str += char + (i !== chars.length - 1 ? ', ' : '');
        }
        return str;
    }
    function createTable(achievements) {
        let accum = '';
        for (let ach of achievements) {
            accum += `<tr>
            <td style="color: grey; width: 10%; vertical-align: top; padding-bottom: 1rem;">${getDateFromStr(ach.achDate)}</td>
            <td style="padding-left: 2rem; vertical-align: top; padding-bottom: 1rem;">${ach.achievement} <br/> <span style="color:grey; font-weight: 350; font-size: small;">${createCharsString(ach.chars)}</span></td>  
            </tr>`
        }
        return `<table><tbody>${accum}</tbody></table>`;
    }

    function getFieldOfWork(fieldName, crits, user) {
        const achievements = user.Achievement.filter((x) => crits.includes(x.crit))
            .sort((a, b) => new Date(b.achDate) - new Date(a.achDate));
        if (achievements.length === 0) return '';
        let block = createTable(achievements);
        return `<h2 class="subheader">${fieldName}</h2><hr/>` + block;
    }

    const user = await db.findUserByIdWithAllAchievements(userId);
    user.Achievement = user.Achievement.filter(x => ['Принято', 'Принято с изменениями'].includes(x.status));

    let template = await fs.promises.readFile('./client/public/portfolio.html', {encoding: 'utf-8'});
    template = template.replace('$FIO$', user.LastName + ' ' + user.FirstName + ' ' + user.Patronymic)
        .replace('$FACULTY$', user.Faculty)
        .replace('$TYPE$', user.Type)
        .replace('$COURSE$', user.Course);

    let achievementsBlock = '';

    const fields = [
        ['Олимпиады', ['7в']],
        ['Проекты', ['7б']],
        ['Публикации', ['8б']],
        ['Гранты и призы за научную деятельность', ['8а']],
        ['Творчество', ['10а', '10б']],
        ['Общественная деятельность', ['9а', '9б']],
        ['Спорт', ['11а', '11б', '11в']],
    ];

    for (let [fieldName, crits] of fields) {
        achievementsBlock += getFieldOfWork(fieldName, crits, user);
    }

    template = template.replace('$ACHIEVEMENTS$', achievementsBlock);
    return template;
}