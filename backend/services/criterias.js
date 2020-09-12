const db = require('./../controllers/dbController');
const getCurrentDate = require('../helpers/getCurrentDate');
const achievementsProcessing = require('./achievementsProcessing');
const fs = require('fs');
const xlsx = require('xlsx');
const parseCriterias = require('../helpers/parseCriterias');

module.exports.getRawCriteriasAndLimits = async function(facultyName) {
    return db.getRawCriteriasAndLimits(facultyName);
};

module.exports.getCriteriasAndSchema = async function(facultyName) {
    return db.getCriteriasAndSchema(facultyName);
};

module.exports.uploadCriterias = async function(filePath) {
    const workbook = xlsx.readFile(filePath);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const result = await parseCriterias(worksheet);
    fs.unlink(filePath, (err) => {
        if (err) console.log(err);
    });
    return result;
};

module.exports.saveCriterias = async function(criterias, facultyName) {
    await db.uploadCriteriasToFaculty(criterias, facultyName);
    await achievementsProcessing.checkActualityOfUsersAchievements(facultyName).then(() => console.log('Check finished'));
};

module.exports.getAnnotations = async function(facultyName) {
    const annotations = await db.getAnnotationsForFaculty(facultyName);
    if (annotations && (annotations.AnnotationsToCrits || annotations.LearningProfile) ) {
        const result = {};
        result.annotations = annotations.AnnotationsToCrits;
        result.learningProfile = annotations.LearningProfile;
        result.languagesForPublications = annotations.LanguagesForPublications;
        return result;
    } else return null;
};

module.exports.updateAnnotations = async function(annotations, learningProfile, languages, facultyName) {
    await db.uploadAnnotationsToFaculty(annotations, learningProfile, languages, facultyName);
};