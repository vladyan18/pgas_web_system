const db = require('./../controllers/dbController');
const isAchievementAccepted = require('../helpers/isAchievementAccepted');

module.exports.calculateBallsForUser = async function(id, faculty) {
    const achievementsPromise = db.findActualAchieves(id);
    const criteriasPromise = db.getCriteriasObject(faculty);
    const [criterias, achievements] = await Promise.all([criteriasPromise, achievementsPromise]);

    const achievementsForCriterion = {};
    for (const key of Object.keys(criterias)) {
        achievementsForCriterion[key] = [];
    }

    for (const achievement of achievements) {
        if (!achievement) continue;
        if (!isAchievementAccepted(achievement)) {
            achievement.ball = undefined;
            db.updateAchieve(achievement._id, achievement).then();
            continue;
        }

        let currentLevel = criterias;
        if (!Array.isArray(currentLevel)) {
            for (const ch of achievement.chars) {
                currentLevel = currentLevel[ch];
            }
            while (!Array.isArray(currentLevel) && !!currentLevel) {
                currentLevel = currentLevel[Object.keys(currentLevel)[0]];
            }
        }
        achievementsForCriterion[achievement.crit].push({'ach': achievement, 'balls': currentLevel, 'chars': achievement.chars});
    }

    for (const key of Object.keys(criterias)) {
        calculateBallsForCriterion(achievementsForCriterion[key]);
        for (const curAch of achievementsForCriterion[key]) {
            if (!curAch) continue;
            db.updateAchieve(curAch['ach']._id, curAch['ach']).then();
        }
    }
};

const trimNumber = function(num) {
    return Number((num).toFixed(3));
};

const calculateBallsForCriterion = function(achievements) {
    let summ = 0;
    let max = 0;

    for (let i = 0; i < achievements.length; i++) {
        if (!achievements[i]) continue;
        let maxIndex;
        for (let achNum = 0; achNum < achievements.length; achNum++) {
            let achievementBalls = achievements[achNum]['balls'];
            if (!achievementBalls) continue;
            let shift = i;
            if (shift >= achievementBalls.length) shift = achievementBalls.length - 1;
            if (trimNumber(achievementBalls[shift]) >= max) {
                max = trimNumber(achievementBalls[shift]);
                maxIndex = achNum;
            }
        }
        achievements[maxIndex]['ach'].ball = max;
        achievements[maxIndex]['balls'] = undefined;
        summ += max;
        max = 0;
    }
    return summ;
};

module.exports.getRating = async function(facultyName, isAdmin, requestingUserId) { //TODO refactor
    let requestingUser;
    if (!isAdmin) {
        requestingUser = await db.findUserById(requestingUserId);
        if (requestingUser.Faculty !== facultyName) {
            return null;
        }
    }

    function getAreaNum(critName) {
        const critNum = Object.keys(kri).indexOf(critName);
        if (critNum === -1) return undefined;
        const shift = Object.keys(kri).length === 12 ? 0 : 1;

        if (critNum < 3) return 0;
        if (critNum < 5) return 1;
        if (critNum < 7) return 2;
        if (critNum < 9 + shift) return 3;
        return 4;
    }

    const criterionObject = await db.getCriterias(facultyName);
    const kri = JSON.parse(criterionObject.Crits);
    const limits = criterionObject.Limits;
    const users = [];
    const Users = await db.getCurrentUsers(facultyName);
    for (const user of Users) {
        let sumBall = 0;
        const crits = {};
        const sums = [0, 0, 0, 0, 0];

        for (const key of Object.keys(kri)) {
            crits[key] = 0;
        }
        const Achs = await db.findActualAchieves(user.id);
        for (const ach of Achs) {
            if (!ach) continue;
            if (ach.ball) {
                crits[ach.crit] += ach.ball;
                sumBall += ach.ball;
                sums[getAreaNum(ach.crit)] += ach.ball;
            }
        }

        if (limits) {
            for (let i = 0; i < sums.length; i++) {
                if (sums[i] > limits[i]) {
                    const delta = sums[i] - limits[i];
                    sumBall -= delta;
                }
            }
        }
        const fio = user.LastName + ' ' + user.FirstName + ' ' + (user.Patronymic ? user.Patronymic : '');
        const newUser = {_id: user._id, Name: fio, Type: user.Type, Course: user.Course, Crits: crits, Ball: sumBall, Direction: user.Direction};

        if (!isAdmin) {
            const shouldAddAchievements = requestingUser.Settings && requestingUser.Settings.detailedAccessAllowed
                && user.Settings && user.Settings.detailedAccessAllowed;
            if (shouldAddAchievements) {
                newUser.Achievements = Achs;
            }
        }
        users.push(newUser);
    }
    return users;
};

module.exports.checkActualityOfUsersAchievements = async function(faculty) { // TODO refactor!!
    const currentUsersPromise = db.getCurrentUsers(faculty);
    const newUsersPromise = db.getNewUsers(faculty);
    const [currentUsers, newUsers] = await Promise.all([currentUsersPromise, newUsersPromise]);
    const users = currentUsers.concat(newUsers);

    // const crits = await db.getCriterias(faculty, true);

    console.log(faculty);
    //console.log(Object.keys(crits));
    for (const user of users) {
        // for (const achievement of user.Achievement) {
        // await db.checkActualityOfAchievementCharacteristics(achievement, crits);
        // }
        await module.exports.calculateBallsForUser(user.id, faculty);
    }
};