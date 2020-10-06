'use strict';

const { Dates, Roles } = require("../../common/consts");
const { UserModel, AchieveModel, NotificationsSettingsModel } = require('../models');

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
    if (isArchived && isArchived !== 'all') {
        query = { $or: [{achDate: {$lt: Dates.MINIMAL}}, {isArchived: true}] };
    } else if (isArchived === 'all') {
        query = {};
    } else {
        query = { achDate: {$gte: Dates.MINIMAL}, isArchived: {$ne: true} };
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

exports.findUserByIdWithAllAchievements = async function(id) {
    return getUserWithAchievements(id, 'all');
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

exports.changeUserSettings = function(id, newSettings) {
    return UserModel.updateOne({id: id}, {$set: {Settings: newSettings}});
};

exports.findUserByAchieve = async function(id) {
    const ach = await AchieveModel.findById(id.toString());
    return UserModel.findOne({Achievement: {$elemMatch: {$eq: ach}}}).lean();
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
    return UserModel.find({Role: {$in: [Roles.ADMIN, Roles.MODERATOR, Roles.OBSERVER]}, Rights: {$elemMatch: {$eq: facultyName}}}).lean();
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
};

exports.getUsersWithAllInfo = async function(faculty, checked=false, stale=false) {
    let query;
    const populateQuery = {
        path: 'Achievement',
        match: {achDate: {$gte: Dates.MINIMAL}, isArchived: {$ne: true}},
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
    const minimalDate = new Date(2019, 8, 1, 0, 0, 0, 0); // TODO WTF
    const minimal7aDate = new Date(Dates.DEFAULT_DATE);
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

exports.registerUser = async function(userId, lastname, name, patronymic, birthdate, spbuId, newFaculty, course, type, settings) {
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
};

exports.addAchieveToUser = async function(userId, achieveId) {
    return UserModel.updateOne({id: userId}, {$push: {Achievement: achieveId}}).lean();
};

exports.addUserToRating = async function(userId) {
    return UserModel.updateOne({_id: userId}, {$set: {IsInRating: true}}).lean();
};

exports.removeUserFromRating = async function(userId) {
    return UserModel.updateOne({_id: userId}, {$set: {IsInRating: false}}).lean();
};

exports.changeRole = async function(reqUserId, userId, newRole, faculty) { // TODO Refactor
    const requestingUser = await UserModel.findOne({id: reqUserId}).lean();
    if (!requestingUser.Rights.includes(faculty)) {
        return null;
    }
    const user = await UserModel.findOne({id: userId}).lean();
    if (newRole !== Roles.USER && user.Faculty !== faculty) {
        return null;
    }

    if (user.Rights.includes(faculty) && newRole !== Roles.USER) {
        return UserModel.updateOne({id: userId}, {$set: {Role: newRole}}).lean();
    } else if (newRole !== Roles.USER) {
        let rights = user.Rights.filter((x) => x !== faculty);
        rights.push(faculty);
        return UserModel.updateOne({id: userId}, {$set: {Role: newRole, Rights: rights}}).lean();
    } else {
        let rights = user.Rights.filter((x) => x !== faculty);
        return UserModel.updateOne({id: userId}, {$set: {Role: newRole, Rights: rights}}).lean();
    }
};

exports.addConfirmationToUser = async function(userId, confId) {
    return UserModel.updateOne({_id: userId}, {$push: {Confirmations: confId}}).lean();
};

exports.changeNotificationEmail = async function(userId, email) {
    let notifSettings = await UserModel.findOne({id: userId}, 'NotificationsSettings').populate('NotificationsSettings').lean();
    notifSettings = notifSettings.NotificationsSettings;
    if (!notifSettings) {
        notifSettings = { userId, email };
        notifSettings = await NotificationsSettingsModel.create(notifSettings);
        await UserModel.updateOne({id: userId}, {$set: {NotificationsSettings: notifSettings._id}}).lean();
    } else {
        await NotificationsSettingsModel.updateOne({_id: notifSettings._id},
            {$set: {email: email}}
        ).lean();
    }
    return true;
};

exports.saveNotificationEndpoint = async function(userId, sessionId, notificationEndpoint) {
    let notifSettings = await UserModel.findOne({id: userId}, 'NotificationsSettings').populate('NotificationsSettings').lean();
    notifSettings = notifSettings.NotificationsSettings;
    if (!notifSettings) {
        notifSettings = { userId };
        notifSettings = await NotificationsSettingsModel.create(notifSettings);
        UserModel.updateOne({id: userId}, {$set: {NotificationsSettings: notifSettings._id}}).lean().then();
    }

    const endpoint = {
        endpointType: 'webpush',
        endpoint: notificationEndpoint,
        sessionId: sessionId,
    };

    return NotificationsSettingsModel.updateOne({_id: notifSettings._id},
        {$push: {endpoints: endpoint}}
    ).lean();
};

exports.removeNotificationEndpoint = async function(userId, sessionId) {
    let notifSettings = await UserModel.findOne({id: userId}, 'NotificationsSettings').populate('NotificationsSettings').lean();
    notifSettings = notifSettings.NotificationsSettings;

    return NotificationsSettingsModel.updateOne({_id: notifSettings._id},
        {$pull: {endpoints: {sessionId: sessionId}}}
    ).lean();
};

exports.getNotificationSettings = async function(userId) {
    let notifSettings = await UserModel.findOne({id: userId}, 'NotificationsSettings').populate('NotificationsSettings').lean();
    if (!notifSettings) return null;
    notifSettings = notifSettings.NotificationsSettings;
    return notifSettings;
};
