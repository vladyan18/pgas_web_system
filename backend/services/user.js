'use strict';

const db = require('../dataLayer');
const { getCurrentDate, statusCheck, rightsCheck } = require('../helpers');
const { Statuses, AccessLevels } = require('../../common/consts');
const { achievementsProcessing, characteristicsPrediction, portfolioFormatter } = require('./utils');


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
    const userObject = await db.findUserByIdWithAchievements(userId);

    const isValid = !!userData.LastName && !!userData.FirstName && !!userData.Faculty && !!userData.Type && !!userData.Course && !!userData.Birthdate;
    if (!isValid) return;
    await db.registerUser(userId, userData);
    session.passport.user.Registered = true;
    session.save(function(err) {
        console.log(err);
    });

    if (userObject && userObject.Faculty && userObject.Faculty !== userData.Faculty && userObject.Achievements && userObject.Achievements.length > 0) {
        await achievementsProcessing.calculateBallsForUser(userId, userObject.Faculty);
    }
};

module.exports.changeUserSettings = async function(userId, newSettings) {
    const user = await db.findUserById(userId);
    if (!user) return;
    let settings = user.Settings || {};
    settings = Object.assign(settings, newSettings);
    await db.changeUserSettings(userId, settings);
};


module.exports.addAchievement = async function(userId, achievement) {
    const user = await db.findUserById(userId);
    if (user.IsInRating && !['ПМ-ПУ'].includes(user.Faculty)) throw new TypeError('It is forbidden');
    let validationResult = false;
    try {
        validationResult = await db.validateAchievement(achievement, user);
    } catch (e) {
        console.log('Ach validation outer error', e);
    }
    if (!validationResult) throw new TypeError();

    achievement.status = Statuses.NEW;
    achievement.date = getCurrentDate();
    achievement.comment = '';
    const createdAchieve = await db.createAchieve(achievement);
    await db.addAchieveToUser(userId, createdAchieve._id);
    await achievementsProcessing.calculateBallsForUser(user.id, user.Faculty);
};

module.exports.classifyDescription = async function(description, faculty = 'ПМ-ПУ') {
    return characteristicsPrediction.classify(description, faculty);
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
    achievement.status = oldAch.status === Statuses.INCORRECT ? Statuses.NEW : oldAch.status;
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
                if (!statusCheck.isNew(oldAch)) {
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
            if (statusCheck.isChangeByUserBlocked(oldAch)) {
                console.log('Detected change in field:', field, oldAch[field], achievement[field]);
                throw new TypeError();
            }
        }
    }

    await db.updateAchieve(achId, achievement);
    await achievementsProcessing.calculateBallsForUser(userId, user.Faculty);
};

module.exports.deleteAchievement = async function(userId, achId) {
    const user = await db.findUserById(userId);

    if (!user.Achievement.some((o) => (o && o.toString() === achId))) {
        return null;
    }

    await db.deleteAchieve(achId);
    await achievementsProcessing.calculateBallsForUser(user.id, user.Faculty);
    return true;
};

module.exports.getAchievement = async function(achId) { // TODO what is it?
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
        await db.addConfirmationToUser(user._id, result._id);
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

module.exports.deleteConfirmation = async function(userId, confirmationId) {
    return db.deleteConfirmation(userId, confirmationId);
};

module.exports.getConfirmations = async function(userId) { // TODO refactor
    const user = await db.findUserById(userId);
    return db.getConfirmations(user.Confirmations);
};

module.exports.getRating = async function(userId, facultyName) { // TODO refactor
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
    const user = await db.findUserByInnerId(userId);
    if (!user) return false;
    const settings = await db.getNotificationSettings(user.id);
    if (!settings || settings.email !== email) return false;
    return db.changeNotificationEmail(user.id, undefined);
};

module.exports.getPortfolioHTML = async function(requesterId, userId) {
    const user = await db.findUserByIdWithAllAchievements(userId);
    if (!user) return false;

    if (!user.Settings || !user.Settings.portfolioOpened) {
        if (!requesterId) return false;

        const requester = await db.findUserById(requesterId);
        if (!requester) return false;
        if ( !rightsCheck.hasAccessLevelInFaculty(requester, AccessLevels.MODERATOR, user.Faculty) ) {
            return false;
        }
    }

    user.Achievement = user.Achievement.filter((x) => statusCheck.isAccepted(x));

    return portfolioFormatter.buildPortfolioHTML(user);
};
