const db = require('../dataLayer');
const { getCurrentDate, getFIO, statusCheck } = require('../helpers');
const { achievementsProcessing } = require('./utils');
const { Statuses } = require('../../common/consts');
const notifyService = require('./notifyService');

module.exports.comment = async function(achievementId, commentText) {
    await db.comment(achievementId, commentText);

    db.getUserByAchievement(achievementId, 'Faculty').then(({Faculty}) => {
        messageBus.emit('message_' + Faculty);
    });
};

module.exports.getData = async function() {
    const faculties = await db.getAllFaculties();
    const result = {};
    for (const { Name: fac } of faculties) {
        result[fac] = await db.getCompletelyAllUsersAchievements(fac);
    }
    return result;
};

module.exports.changeAchievement = async function(achievement, userId) {
    const id = achievement._id;
    const user = await db.findUserById(userId);
    const isValid = await db.validateAchievement(achievement, user);
    if (!isValid) {
        throw new TypeError();
    }

    achievement.status = Statuses.CHANGED;
    achievement.isPendingChanges = false;
    achievement.date = getCurrentDate();

    const oldAchieve = await db.findAchieveById(id);
    const createdAchieve = await db.updateAchieve(id, achievement);

    const args = {};
    args.from = oldAchieve;
    args.to = createdAchieve;
    // await history.writeToHistory(req, id, uid, 'Change', args); //TODO HISTORY
    await achievementsProcessing.calculateBallsForUser(userId, user.Faculty);
    messageBus.emit('message_' + user.Faculty);
};

module.exports.getUsersForAdmin = async function(faculty, checked) { // TODO REFACTOR TO STREAM
    const info = [];

    const Users = await db.getUsersWithAllInfo(faculty, checked);

    for (const user of Users) {
        if (!user) continue;
        for (let i = 0; i < user.Achievement.length; i++) {
            for (let j = 0; j < user.Achievement[i].confirmations.length; j++) {
                if (!user.Achievement[i].confirmations[j].id) continue;

                const expandedConfirm = user.Achievement[i].confirmations[j].id;
                expandedConfirm.additionalInfo = user.Achievement[i].confirmations[j].additionalInfo;
                user.Achievement[i].confirmations[j] = expandedConfirm;
            }
        }

        if ( user.Achievement.length > 0) {
            const fio = getFIO(user);
            info.push({
                Id: user._id,
                userId: user.id,
                user: fio,
                Course: user.Course,
                Type: user.Type,
                IsInRating: user.IsInRating,
                IsHiddenInRating: user.IsHiddenInRating,
                Achievements: user.Achievement,
            });
        }
    }

    return info;
};

module.exports.changeAchievementStatus = async function(userId, achId, action) {
    const userPromise = db.findUserByInnerId(userId);
    let user;
    if (action === 'Accept') {
        const achievementPromise = db.findAchieveById(achId);
        const [userInner, achievement] = await Promise.all([userPromise, achievementPromise]);
        const checkResult = await db.validateAchievement(achievement, userInner);
        user = userInner;
        if (!checkResult) {
            throw new TypeError();
        }
        await db.changeAchieveStatus(achId, action === 'Accept');
    } else {
        const changePromise = db.changeAchieveStatus(achId, action === 'Accept');
        const [userInner, changeResult] = await Promise.all([userPromise, changePromise]);
        user = userInner;
    }

    await achievementsProcessing.calculateBallsForUser(user.id, user.Faculty);
    notifyService.notifyUserAboutNewAchieveStatus(user.id, achId).then();
    messageBus.emit('message_' + user.Faculty);
    // await history.writeToHistory(req, req.body.Id, u.id, 'Success');
};

module.exports.getRating = async function(faculty) {
    return achievementsProcessing.getRating(faculty, true);
};

module.exports.addUserToRating = async function(userId) {
    await db.addUserToRating(userId);
};

module.exports.removeUserFromRating = async function(userId) {
    await db.removeUserFromRating(userId);
};

module.exports.changeUserRole = async function(reqUserId, userId, newRole, faculty) {
    await db.changeRole(reqUserId, userId, newRole, faculty);
};

module.exports.getAdmins = async function(facultyName, userId) { // TODO security
    const admins = await db.getAdminsForFaculty(facultyName);
    return admins.map((x) => {
        const str = x.LastName + ' ' + x.FirstName + ' ' + x.Patronymic;
        return {Name: str, Role: x.Role, id: x.id};
    });
};

module.exports.getStatisticsForFaculty = async function(facultyName) { // TODO refactor
    const students = await db.getUsersWithAllInfo(facultyName, true);

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
    for (const user of students) {
        for (const ach of user.Achievement) {
            if (statusCheck.isDeclined(ach)) declined += 1;
            if (statusCheck.isNew(ach)) waitingForCheck += 1;
            if (!statusCheck.isAccepted(ach)) continue;
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

module.exports.getconfitmationsStatistics = async function() {
    return db.getconfitmationsStatistics();
};

module.exports.purgeConfirmations = async function() {
    return db.purgeConfirmations();
};


const EventEmitter = require('events').EventEmitter; // TODO вынести в синглетон (?)
const messageBus = new EventEmitter();
module.exports.subscribeForUsersUpdate = async function(faculty, checked, req, res) {
    let responded = false;
    // eslint-disable-next-line prefer-const
    let timer;

    const listener = function(res) {
        messageBus.once('message_' + faculty, function() {
            responded = true;
            if (timer) {
                clearTimeout(timer);
            }
            try {
                res.status(200).json({status: 'ok'});
                // eslint-disable-next-line no-empty
            } catch (e) {}
        });
    };

    req.on('abort', function() {
        messageBus.removeListener('message_' + faculty, listener);
        if (timer) {
            clearTimeout(timer);
        }
    });

    listener(res);
    timer = setTimeout(() => {
        if (!responded) {
            messageBus.removeListener('message_' + faculty, listener);
            try {
                res.status(204).json({status: 'aborted'});
                // eslint-disable-next-line no-empty
            } catch (e) {}
        }
    }, 30000);
};


