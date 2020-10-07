'use strict';

const md5 = require('md5');
const { Roles } = require('../../common/consts');
const { FacultyModel, UserModel, AnnotationsModel, CriteriasModel } = require('../models');

const { criteriasCache, facultyCache, annotationsCache } = require('./resources/caches');

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

exports.uploadAnnotationsToFaculty = async function(annotations, learningProfile, languagesForPublications, facultyName) {
    const facObject = await FacultyModel.findOne({Name: facultyName}).lean();
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
    return { Crits: crits.rawCrits, Limits: crits.Limits };
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
        'CritsId', 'Crits CritsSchema Limits',
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
