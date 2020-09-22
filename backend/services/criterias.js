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

module.exports.getAllCriterias = async function() {
    return db.getAllCriterias();
};

module.exports.uploadCriterias = async function(filePath, facultyName) {
    const workbook = xlsx.readFile(filePath);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const result = await parseCriterias(worksheet);
    const differences = await checkCriteriasDifference(result.crits, facultyName);
    const {incorrectAchievements, notSure} = await achievementsProcessing.checkCorrectnessInNewCriterias(facultyName, result.crits);

    fs.unlink(filePath, (err) => {
        if (err) console.log(err);
    });
    return {criterias: result, differences: differences, incorrectAchievements: incorrectAchievements, notSure: notSure};
};

const checkCriteriasDifference = async function(newCriterias, facultyName) {
    const oldCriterias = await db.getCriteriasObject(facultyName);
    const differences = [];
    const checkLevel = (oldLevel, newLevel, path) => {
        const oldKeys = Object.keys(oldLevel).filter((x) => isNaN(Number(x)));
        const newKeys = Object.keys(newLevel).filter((x) => isNaN(Number(x)));;

        for (let oldKey of oldKeys) {
            if (!newKeys.includes(oldKey)) {
                differences.push({key: oldKey, path: path, reason: 'removed'});
            }
        }

        for (let newKey of newKeys) {
            if (!oldKeys.includes(newKey)) {
                differences.push({key: newKey, path: path, reason: 'added'});
            } else {
                checkLevel(oldLevel[newKey], newLevel[newKey], [...path, newKey]);
            }
        }
    };

    checkLevel(oldCriterias, newCriterias, []);
    return differences;
};

module.exports.saveCriterias = async function(criterias, facultyName) {
    await db.uploadCriteriasToFaculty(criterias, facultyName);
    await achievementsProcessing.checkActualityOfUsersAchievements(facultyName);
    console.log('Check finished');
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