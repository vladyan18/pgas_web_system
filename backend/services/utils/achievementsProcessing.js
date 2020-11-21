'use strict';

const db = require('../../dataLayer');
const { Statuses } = require('../../../common/consts');
const { statusCheck, getFIO } = require('../../helpers');

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

        let currentLevel = criterias;
        if (!Array.isArray(currentLevel)) {
            const correctChars = [];
            for (const ch of achievement.chars) {
                currentLevel = currentLevel[ch];
                if (!currentLevel) {
                    break;
                }
                correctChars.push(ch);
            }
            if (!currentLevel) {
                achievement.preliminaryBall = undefined;
                achievement.ball = undefined;
                achievement.status = Statuses.INCORRECT;
                achievement.chars = correctChars;
                achievement.crit = correctChars[0];
                await db.updateAchieve(achievement._id, achievement);
                continue;
            }
            while (!Array.isArray(currentLevel) && !!currentLevel) {
                currentLevel = currentLevel[Object.keys(currentLevel)[0]];
            }
        }
        if (!achievement.crit) continue;
        achievementsForCriterion[achievement.crit].push({'ach': achievement, 'balls': currentLevel, 'chars': achievement.chars});
    }

    const promises = [];
    for (const key of Object.keys(criterias)) {
        const calculatedAchievements = calculateBallsForCriterion(achievementsForCriterion[key]);
        for (const curAch of calculatedAchievements) {
            if (!curAch) continue;
            promises.push(db.updateAchieve(curAch.ach._id, curAch.ach));
        }
    }
    if (promises.length > 0) {
        await Promise.all(promises);
    }
};

function getBallWithShift(shift, array) {
    const newShift = shift < array.length ? shift : array.length - 1;
    return array[newShift];
}

function preSortAchievements(a, b) {
    const dif = b.balls[0] - a.balls[0];
    if (dif !== 0) return dif;

    const length = Math.max(a.balls.length, b.balls.length);
    for (let i = 0; i < length; i++) {
        const dif = getBallWithShift(i, b.balls) - getBallWithShift(i, a.balls);
        if (dif < 0) return 1;
    }
    return dif;
}

const calculateBallsForCriterion = function(achievements) {
    for (let i = 0; i < achievements.length; i++) {
        achievements[i].ach.preliminaryBall = undefined;
        achievements[i].ach.ball = undefined;
    }

    achievements = achievements.sort(preSortAchievements);

    for (let i = 0; i < achievements.length; i++) {
        const [bestAchievement, bestBall] = findBestAchievement(achievements, i, false);
        const [preliminaryBestAchievement, bestPreliminaryBall] = findBestAchievement(achievements, i, true);


        if (bestAchievement) {
            bestAchievement.ach.ball = bestBall;
        }

        if (preliminaryBestAchievement) {
            preliminaryBestAchievement.ach.preliminaryBall = bestPreliminaryBall;
        }
    }

    return achievements;
};

function findBestAchievement(achievements, step, isPreliminary) {
    let candidates;

    if (isPreliminary) {
        candidates = achievements.filter(({ach}) => !ach.preliminaryBall && ach.preliminaryBall !== 0)
            .filter(({ach}) => !statusCheck.shouldNotCountPreliminary(ach));
    } else {
        candidates = achievements.filter(({ach}) => !ach.ball && ach.ball !== 0)
            .filter(({ach}) => statusCheck.isAccepted(ach));
    }
    if (candidates.length === 0) return [null, null];

    let candidateForMax = candidates[0];

    for (let achNum = 1; achNum < candidates.length; achNum++) {
        const currentCandidate = candidates[achNum];
        const achievementBallsArray = currentCandidate.balls;

        const currentBall = trimNumber(getBallWithShift(step, achievementBallsArray));
        const currentMaxCandidateBall = trimNumber(getBallWithShift(step, candidateForMax.balls));

        if (currentBall > currentMaxCandidateBall) {
            candidateForMax = currentCandidate;
            continue;
        }

        if (currentBall === 0 && currentMaxCandidateBall === 0) {
            candidateForMax = currentCandidate;
            continue;
        }

        if (isPreliminary && currentBall === currentMaxCandidateBall) {
            if (statusCheck.isAccepted(currentCandidate.ach) && !statusCheck.isAccepted(candidateForMax.ach)) {
                candidateForMax = currentCandidate;
            }
        }
    }
    return [candidateForMax, getBallWithShift(step, candidateForMax.balls)];
}

const trimNumber = function(num) {
    return Number((num).toFixed(3));
};

function getAreaNum(critName, kri) {
    const critNum = Object.keys(kri).indexOf(critName);
    if (critNum === -1) return undefined;
    const shift = Object.keys(kri).length === 12 ? 0 : 1;

    if (critNum < 3) return 0;
    if (critNum < 5) return 1;
    if (critNum < 7) return 2;
    if (critNum < 9 + shift) return 3;
    return 4;
}

module.exports.getRating = async function(facultyName, isAdmin, requestingUserId) { // TODO refactor to stream
    let requestingUser;
    if (!isAdmin) {
        requestingUser = await db.findUserById(requestingUserId);
        if (requestingUser.Faculty !== facultyName) {
            return null;
        }
    }

    const criterionObject = await db.getCriteriasAndLimits(facultyName);
    const kri = criterionObject.Crits;
    const limits = criterionObject.Limits;
    const Users = await db.getUsersWithAllInfo(facultyName, true);
    const users = Users.map((user) => {
        let sumBall = 0;
        const crits = {};
        const sums = [0, 0, 0, 0, 0];

        for (const key of Object.keys(kri)) {
            crits[key] = 0;
        }
        const Achs = user.Achievement;
        Achs.forEach((ach) => {
            if (ach && ach.ball) {
                crits[ach.crit] += ach.ball;
                sumBall += ach.ball;
                sums[getAreaNum(ach.crit, kri)] += ach.ball;
            }
        });

        if (limits) {
            for (let i = 0; i < sums.length; i++) {
                if (sums[i] > limits[i]) {
                    const delta = sums[i] - limits[i];
                    sumBall -= delta;
                }
            }
        }
        const fio = getFIO(user);
        const newUser = {_id: user._id, Name: fio, Type: user.Type, Course: user.Course, Crits: crits, Ball: sumBall, Direction: user.Direction};

        if (!isAdmin) {
            const shouldAddAchievements = requestingUser.Settings && requestingUser.Settings.detailedAccessAllowed &&
                user.Settings && user.Settings.detailedAccessAllowed;
            if (shouldAddAchievements) {
                newUser.Achievements = Achs;
            }
        }
        return newUser;
    });
    return users;
};

module.exports.checkActualityOfUsersAchievements = async function(faculty) { // TODO refactor!!
    const currentUsersPromise = db.getUsersWithAllInfo(faculty, true);
    const newUsersPromise = db.getUsersWithAllInfo(faculty, false);
    const [currentUsers, newUsers] = await Promise.all([currentUsersPromise, newUsersPromise]);
    const users = currentUsers.concat(newUsers);

    const crits = await db.getCriteriasObject(faculty);

    console.log(faculty, 'is changing criterias...');
    for (const user of users) {
        for (const achievement of user.Achievement) {
            await db.checkActualityOfAchievementCharacteristics(achievement, crits, user);
        }
        await module.exports.calculateBallsForUser(user.id, faculty);
    }
};

module.exports.checkCorrectnessInNewCriterias = async function(faculty, newCriterias) { // TODO refactor!!
    const currentUsersPromise = db.getUsersWithAllInfo(faculty, true);
    const newUsersPromise = db.getUsersWithAllInfo(faculty, false);
    const [currentUsers, newUsers] = await Promise.all([currentUsersPromise, newUsersPromise]);
    const users = currentUsers.concat(newUsers);

    console.log(faculty, 'is validating criterias...');
    const incorrectAchievements = [];
    let notSure = 0;
    for (const user of users) {
        for (const achievement of user.Achievement) {
            const res = await db.checkCorrectnessInNewCriterias(achievement, newCriterias, user);
            if (res && !res.ok) {
                incorrectAchievements.push({user: user.LastName + ' ' + user.FirstName, oldChars: res.oldChars, incorrectChars: res.incorrectChars});
            }

            if (res && res.notSure) {
                notSure += 1;
            }
        }
    }
    return {incorrectAchievements, notSure};
};
