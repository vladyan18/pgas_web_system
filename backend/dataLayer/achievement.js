'use strict';

const { Dates, Statuses } = require('../../common/consts');
const { statusCheck } = require('../helpers');
const { UserModel, AchieveModel } = require('../models');
const faculty = require('./faculty');

exports.archiveAchievements = async function() {
    await AchieveModel.updateMany({status: Statuses.DECLINED}, {$set: {isArchived: true}});
    console.log('UPDATED');
};

exports.findAchieveById = async function(id) {
    return AchieveModel.findById(id).lean();
};

exports.createAchieve = async function(achieve) {
    if (!achieve.achDate) {
        achieve.achDate = new Date(Dates.DEFAULT_DATE);
    }
    return AchieveModel.create(achieve);
};

exports.deleteAchieve = async function(id) {
    const ach = await AchieveModel.findOne({_id: id}).lean();
    if (statusCheck.isChangeByUserBlocked(ach)) {
        await AchieveModel.updateOne({_id: id}, {$set: {isArchived: true}});
        return true;
    }
    const u = await UserModel.findOne({Achievement: {$elemMatch: {$eq: id.toString()}}}).lean();
    if (!u) return true;

    for (let i = u.Achievement.length - 1; i >= 0; i--) {
        if (u.Achievement[i].toString() === id) {
            u.Achievement.splice(i, 1);
            break;
        }
    }
    await UserModel.updateOne({id: u.id}, {Achievement: u.Achievement}).lean();
    await AchieveModel.findByIdAndRemove(id);
    return true;
};

exports.updateAchieve = async function(id, achieve) {
    const newAch = {
        crit: achieve.chars ? achieve.chars[0] : null,
        chars: achieve.chars,
        status: achieve.status,
        achievement: achieve.achievement,
        ball: achieve.ball,
        achDate: achieve.achDate,
        comment: achieve.comment,
        endingDate: achieve.endingDate,
        isPendingChanges: achieve.isPendingChanges,
        preliminaryBall: achieve.preliminaryBall,
    };

    newAch.confirmations = achieve.confirmations;
    if (achieve.confirmations && achieve.confirmations.length > 0) {
        for (let i = 0; i < achieve.confirmations.length; i++) {
            newAch.confirmations[i] = achieve.confirmations[i];
        }
    }

    return AchieveModel.updateOne({_id: id}, {
        $set: newAch,
    }).lean();
};

exports.changeAchieveStatus = async function(id, accept = false) {
    let newStatus;
    if (accept) {
        const ach = await AchieveModel.findById(id, 'status').lean();
        if (statusCheck.wasChanged(ach)) {
            newStatus = Statuses.CHANGED_AND_ACCEPTED;
        } else {
            newStatus = Statuses.ACCEPTED;
        }
    } else {
        newStatus = Statuses.DECLINED;
    }

    return AchieveModel.updateOne({_id: id}, {$set: {status: newStatus, isPendingChanges: false}}).lean();
};


exports.comment = async function(id, comment) {
    return AchieveModel.updateOne({_id: id}, {$set: {comment: comment}}).lean();
};

exports.validateAchievement = async function(achievement, user) { // TODO refactor !!!
    if (!achievement || !user) return false;
    const crits = await faculty.getCriteriasObject(user.Faculty);
    if (!crits) {
        throw new Error('There are no criterion for faculty ' + user.Faculty);
    }

    try {
        const critsTitles = Object.keys(crits);
        if (!achievement.crit || !achievement.chars || !Array.isArray(achievement.chars)) return false;
        if (!(crits[achievement.crit])) return false;
        // проверка характеристик
        let currentLevelOfCriterion = crits;
        for (let i = 0; i < achievement.chars.length; i++) {
            if (!currentLevelOfCriterion[achievement.chars[i]]) return false;
            currentLevelOfCriterion = currentLevelOfCriterion[achievement.chars[i]];
        }
        if (isNaN(Number(Object.keys(currentLevelOfCriterion)[0]))) {
            // в старой версии критериев было допустимо опускать характеристики в 7а
            if (achievement.crit !== critsTitles[0]) return false;
            currentLevelOfCriterion = currentLevelOfCriterion[Object.keys(currentLevelOfCriterion)[0]];
            if (isNaN(Number(currentLevelOfCriterion[Object.keys(currentLevelOfCriterion)[0]]))) return false;
        }
        // проверка даты и описания; в 7а это не нужно
        if (achievement.crit !== critsTitles[0]) {
            if (!achievement.achievement) return false;
            if (!achievement.achDate) return false;
            const achDate = new Date(achievement.achDate);
            if (!(achDate instanceof Date)) return false;
            const minimalDate = new Date(Dates.MINIMAL);
            const maximalDate = new Date(Dates.MAXIMAL);
            if (achDate < minimalDate || achDate > maximalDate) return false;
            if (achievement.endingDate) {
                const achEndingDate = new Date(achievement.endingDate);
                if (!(achEndingDate instanceof Date)) return false;
                if (achEndingDate < achDate) return false;
            }
        }
        return true;
    } catch (e) {
        console.error('Ach validation error | User: ' + user.id, e);
    }
};

function checkAchievement(achievement, criterias, user) {
    let notSure = false;
    const correctChars = [];
    const incorrectChars = [];
    let currentLevel = criterias;
    if (Object.keys(criterias)[0].indexOf('(') === -1) {
        if (achievement.crit.indexOf('(') !== -1) {
            achievement.crit = achievement.crit.substring(
                achievement.crit.indexOf('(')+1,
                achievement.crit.indexOf(')'),
            );

            if (achievement.crit === '7а' || achievement.crit === '7a' || achievement.chars[0] === '1 (7а)' || achievement.chars[0] === '1 (7a)') {
                if (user) {
                    let newChar;
                    if (user.Type === 'Бакалавриат' || user.Type === 'Специалитет') {
                        newChar = 'Студентом бакалавриата или специалитета';
                    } else {
                        newChar = 'Студентом магистратуры';
                    }
                    notSure = true;
                    achievement.chars.push(newChar);
                }
            }

            if (achievement.crit === '10в') {
                achievement.crit = '9а';
                achievement.chars.splice(1, 0, 'Организация прочих мероприятий');
            } else if (achievement.crit === '9а' && achievement.chars.length > 4) {
                achievement.chars.splice(1, 1, 'Организация мероприятий при участии СПбГУ');
            } else if (achievement.crit === '8б') {
                achievement.chars.splice(2, 1);
                let haveBdnsk = false;
                for (let i = 0; i < achievement.chars.length; i++) {
                    achievement.chars[i] = achievement.chars[i].replace(/ \(\d+\)$/, '').trim();
                    if (achievement.chars[i] === 'Тезисы и (или) научные телеграммы') achievement.chars[i] = 'Тезисы';
                    if (achievement.chars[i] === 'Публикация (кроме тезисов и научных телеграмм)') achievement.chars[i] = 'Публикация (кроме тезисов)';
                    if (achievement.chars[i] === 'СДнСК') {
                        achievement.chars[i] = 'СДнК';
                        haveBdnsk = true;
                    }
                    if (achievement.chars[i] === 'Q4' || achievement.chars[i] === 'Иное') {
                        achievement.chars[i] = 'Q4 и иное';
                    }
                    if (achievement.chars[i] === 'БДнСК') {
                        achievement.chars[i] = 'БДнК';
                        haveBdnsk = true;
                    }
                    if (achievement.chars[i] === 'Русский язык') achievement.chars[i] = 'Иные языки';
                    if (achievement.chars[i] === 'Иностранный язык') {
                        achievement.chars[i] = 'Международные языки';
                        notSure = true;
                    }
                    if (achievement.chars[i] === 'Неиндексируемое') achievement.chars[i] = 'Не индексируемое';
                }

                let dspoInd = achievement.chars.indexOf('ДСПО');
                if (dspoInd === -1) dspoInd = achievement.chars.indexOf('ДнСПО');
                if (!haveBdnsk) {
                    achievement.chars.splice(dspoInd, 0, 'БДнК');
                    notSure = true;
                }
            } else if (achievement.crit === '9б') {
                for (let i = 0; i < achievement.chars.length; i++) {
                    achievement.chars[i] = achievement.chars[i].replace(/ \(\d+\)$/, '').trim();
                    if (achievement.chars[i] === 'Периодика (печать)') achievement.chars[i] = 'Печатные издания и интернет-медиа';
                }
            } else if (achievement.crit === '11а') {
                for (let i = 0; i < achievement.chars.length; i++) {
                    if (achievement.chars[i] === 'Очн. уч.') achievement.chars[i] = 'Очно';
                    if (achievement.chars[i] === 'Заочн. уч.') achievement.chars[i] = 'Заочно';
                }
            }

            for (let i = 0; i < achievement.chars.length; i++) {
                achievement.chars[i] = achievement.chars[i].replace(/ \(\d+\)$/, '').trim();
                if (achievement.chars[i] === 'На уровне СНГ') {
                    achievement.chars[i] = 'На международном уровне';
                    notSure = true;
                }
                if (achievement.chars[i] === 'На уровне федерального округа') {
                    achievement.chars[i] = 'На всероссийском уровне';
                    notSure = true;
                }
            }

            achievement.chars[0] = achievement.crit;
        }
    }

    for (let i = 0; i < achievement.chars.length; i++) {
        achievement.chars[i] = achievement.chars[i].replace(/\(\d*\)/g, '').trim();
        if (currentLevel[achievement.chars[i]]) {
            correctChars.push(achievement.chars[i]);
            currentLevel = currentLevel[achievement.chars[i]];
        } else if (currentLevel[achievement.chars[i] + ' (ДКР)']) {
            correctChars.push(achievement.chars[i] + ' (ДКР)');
            currentLevel = currentLevel[achievement.chars[i] + ' (ДКР)'];
        } else {
            incorrectChars.push(achievement.chars[i]);
        }
    }
    return [achievement, currentLevel, correctChars, incorrectChars, notSure];
}

exports.checkActualityOfAchievementCharacteristics = async function(achievement, criterias, user) {
    if (achievement.criteriasHash && achievement.criteriasHash === criterias.Hash) return;

    const [migratedAchievement, currentLevel, correctChars, incorrectChars, notSure] = checkAchievement(achievement, criterias, user);
    achievement = migratedAchievement;

    if (!isNaN(Number(currentLevel[0]))) {
        console.log(Number(currentLevel[0]));
        console.log('CORRECT MIGRATION');
        achievement.chars = correctChars;
        if (notSure) {
            achievement.status = Statuses.NEW;
        }
        achievement.criteriasHash = criterias.Hash;
        await this.updateAchieve(achievement._id, achievement);
    } else {
        achievement.chars = correctChars;
        achievement.status = Statuses.INCORRECT;
        achievement.criteriasHash = criterias.Hash;
        achievement.ball = undefined;
        achievement.preliminaryBall = undefined;
        await this.updateAchieve(achievement._id, achievement);
    }
};

exports.checkCorrectnessInNewCriterias = async function(achievement, criterias, user) {
    const [migratedAchievement, currentLevel, correctChars, incorrectChars, notSure] = checkAchievement(achievement, criterias, user);
    achievement = migratedAchievement;

    if (!isNaN(Number(currentLevel[0]))) {
        return {ok: true, notSure: notSure};
    } else {
        return {oldChars: achievement.chars, incorrectChars: incorrectChars, notSure: notSure};
    }
};
