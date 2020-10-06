'use strict';

const md5 = require('md5');
const { Roles } = require("../../common/consts");
const { statusCheck } = require("../helpers")
const { FacultyModel, UserModel, AnnotationsModel, CriteriasModel } = require('../models');

const { criteriasCache, facultyCache, annotationsCache } = require('../resources/caches');

exports.getFaculty = async function(facultyName) {
    return facultyCache.get(facultyName);
};

exports.getAllFaculties = async function() {
    return FacultyModel.find().lean();
};

exports.createFaculty = async function(faculty) {
    const superAdmins = await UserModel.find({Role: Roles.SUPERADMIN});
    const createdFacultyObj = await FacultyModel.create(faculty);
    for (const superAdmin of superAdmins) {
        if (!superAdmin.Rights) superAdmin.Rights = [];
        superAdmin.Rights.push(faculty.Name);
        await UserModel.findOneAndUpdate({'_id': superAdmin._id}, {$set: {Rights: superAdmin.Rights}});
    }
    return createdFacultyObj;
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

exports.getAllCriterias = async function() {
    return await FacultyModel.find({}).populate('CritsId').lean();
};

exports.getAnnotationsForFaculty = async function(facultyName) {
    return annotationsCache.get(facultyName);
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