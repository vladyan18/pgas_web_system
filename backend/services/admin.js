const db = require('./../controllers/dbController');
const getCurrentDate = require('../helpers/getCurrentDate');
const achievementsProcessing = require('./achievementsProcessing');

module.exports.comment = async function(achievementId, commentText) {
    await db.comment(achievementId, commentText);
};

module.exports.changeAchievement = async function(achievement, userId) {
    const id = achievement._id;
    const user = await db.findUserById(userId);
    const isValid = await db.validateAchievement(achievement, user);
    if (!isValid) {
        throw new TypeError();
    }

    achievement.status = 'Изменено';
    achievement.isPendingChanges = false;
    achievement.date = getCurrentDate();

    const oldAchieve = await db.findAchieveById(id);
    const createdAchieve = await db.updateAchieve(id, achievement);

    const args = {};
    args.from = oldAchieve;
    args.to = createdAchieve;
    //await history.writeToHistory(req, id, uid, 'Change', args); //TODO HISTORY
    await achievementsProcessing.calculateBallsForUser(userId, user.Faculty);
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
            const fio = user.LastName + ' ' + user.FirstName + ' ' + (user.Patronymic ? user.Patronymic : '');
            info.push({
                Id: user._id,
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
    const userPromise = db.findUser(userId);
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
    // await history.writeToHistory(req, req.body.Id, u.id, 'Success');
};

module.exports.getRating = async function(faculty) {
    return achievementsProcessing.getRating(faculty, true);
};

module.exports.addUserToRating = async function(userId) { // TODO refactor
    await db.addUserToRating(userId);
};

module.exports.removeUserFromRating = async function(userId) {
    await db.removeUserFromRating(userId);
};

module.exports.changeUserRole = async function(userId, toAdmin) {
    await db.changeRole(userId, toAdmin);
};

module.exports.getAdmins = async function() { //TODO refactor
    const users = [];
    const Users = await db.allUsers();
    for (const user of Users) {
        const str = user.LastName + ' ' + user.FirstName + ' ' + user.Patronymic;
        users.push({Name: str, Role: user.Role, Id: user.id});
    }
    return users;
};

module.exports.getStatisticsForFaculty = async function(facultyName) {
    return db.getStatisticsForFaculty(facultyName);
};