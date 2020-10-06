'use strict';

const fs = require('fs');
const path = require('path');
const { Dates, Statuses } = require("../../common/consts");
const { ConfirmationModel, AchieveModel, UserModel } = require('../models');
const { BloomFilter } = require('bloom-filters');

const confirmationsFilePath = path.join(__dirname, '../static/confirmations/');

const errorRate = 0.05;
const filter = BloomFilter.create(10000, errorRate);
ConfirmationModel.find({}).lean().then((hashes) => {
    console.log('Set Bloom filter');
    hashes = hashes.filter((x) => x.Hash).map((x) => x.Hash);
    for (let hash of hashes) {
        filter.add(hash);
    }
});

exports.createConfirmation = async function(confirmation) {
    let exists = false;
    if (confirmation.Hash && confirmation.FilePath) {
        if (filter.has(confirmation.Hash)) {
            const sameFile = await ConfirmationModel.findOne({Hash: confirmation.Hash, Size: confirmation.Size}).lean();
            if (sameFile && sameFile.FilePath && sameFile.Size === confirmation.Size) {
                const confPath = path.join(__dirname, '../static/confirmations/');
                const fileName = path.basename(sameFile.FilePath);
                try {
                    await fs.promises.access(confPath + fileName);
                    fs.promises.unlink(confPath + path.basename(confirmation.FilePath)).then();
                    confirmation.FilePath = sameFile.FilePath;
                    exists = true;
                } catch (e) {
                }
            }
        } else {
            filter.add(confirmation.Hash);
        }
    }
    return [ConfirmationModel.create(confirmation), exists];
};

exports.getConfirmationFileStream = async function(filePath) {
    const confirmPath = path.join(__dirname, '../static/confirmations/');
    filePath = confirmPath + path.basename(filePath);
    try {
        await fs.promises.access(filePath);
    } catch (error) {
        const sameFile = await ConfirmationModel.findOne({Data: '/api/getConfirm/' + path.basename(filePath)}, 'FilePath').lean();
        if (!sameFile) {
            return null;
        }

        try {
            filePath = confirmPath + path.basename(sameFile.FilePath);
            await fs.promises.access(filePath);
        } catch (error) {
            return null;
        }
    }
    const stream = fs.createReadStream(filePath);
    const stat = await fs.promises.stat(filePath);
    return {stream, stat};
};

exports.getConfirmByIdForUser = async function(confirmation) {
    return ConfirmationModel.findById(confirmation).lean();
};

exports.getConfirmations = async function(confIds) {
    return ConfirmationModel.find({_id: {$in: confIds}}, '-FilePath').lean();
};

exports.deleteConfirmation = async function(userId, confirmationId) {
    const usingAchievements = await AchieveModel.find({
        status: {$in: [Statuses.ACCEPTED, Statuses.CHANGED_AND_ACCEPTED, Statuses.DECLINED]},
        confirmations: {$elemMatch: {id: confirmationId}}
    });
    if (usingAchievements && usingAchievements.length > 0) return;

    const user = await UserModel.findOne({id: userId}).lean();
    if (!(user.Confirmations.some(x => x.toString() === confirmationId))) return;

    await UserModel.updateOne({id: userId}, {$pull: {Confirmations: confirmationId}}).lean();
    const achieveUpdatePromise = AchieveModel.updateMany(
        {confirmations: {$elemMatch: {id: confirmationId}}},
        {$pull: {confirmations: {id: confirmationId}}}
    );
    const confirmation = await ConfirmationModel.findOne({_id: confirmationId}).lean();
    await ConfirmationModel.deleteOne({_id: confirmationId});
    await achieveUpdatePromise;
    if (confirmation.Type === 'doc') {
        try {
            await fs.promises.access(confirmation.FilePath);
            const anotherUser = await ConfirmationModel.findOne({FilePath: confirmation.FilePath}).lean();
            if (anotherUser) {
                return;
            }
            fs.promises.unlink(confirmation.FilePath).then();
        } catch (e) {}
    }
};

exports.updateConfirmCrawlResult = async function(confirmId, crawlResult) {
    return ConfirmationModel.findByIdAndUpdate(confirmId, {$set: {CrawlResult: crawlResult, IsCrawled: true}});
};

exports.getconfitmationsStatistics = async function() {
    const filePath = confirmationsFilePath;
    const populateQuery = {
        path: 'Achievement',
        match: {achDate: {$gte: Dates.MINIMAL}, isArchived: {$ne: true}},
        populate: {
            path: 'confirmations.id',
        },
    };
    const confirmations = [];
    const users = await UserModel.find({}, 'Achievement')
        .populate(populateQuery);
    for (let i = 0; i < users.length; i++) {
        for (let ach of users[i].Achievement) {
            for (let confirm of ach.confirmations) {
                if (confirm.id && confirm.id.FilePath && !(path.basename(confirm.id.FilePath) in confirmations)) {
                    confirmations.push(path.basename(confirm.id.FilePath));
                }
            }
        }
    }
    const usedFiles = confirmations;
    const files = await fs.promises.readdir(filePath);
    const forgottenFiles = [];
    const missedFiles = [];
    let totalUselessSize = 0;
    for (let file of files) {
        if (usedFiles.findIndex(x => x === file) === -1) {
            forgottenFiles.push(file);
            const stat = await fs.promises.stat(filePath + file);
            totalUselessSize += stat.size;
        }
    }
    for (let file of usedFiles) {
        if (files.findIndex(x => x === file) === -1) {
            missedFiles.push(file);
        }
    }

    const stat = await fs.promises.lstat(filePath);
    const totalSize = (stat.size / 1024 / 1024).toFixed(2) + ' Мб';
    totalUselessSize = (totalUselessSize / 1024 / 1024).toFixed(2) + ' Мб';
    return {totalSize, totalUselessSize, forgottenFiles, missedFiles};
};

exports.purgeConfirmations = async function() {
    return null;
    const filePath = confirmationsFilePath;
    const populateQuery = {
        path: 'Achievement',
        match: {achDate: {$gte: Dates.MINIMAL}, isArchived: {$ne: true}},
        populate: {
            path: 'confirmations.id',
        },
    };
    const confirmations = [];
    const users = await UserModel.find({}, 'Achievement')
        .populate(populateQuery);
    for (let i = 0; i < users.length; i++) {
        for (let ach of users[i].Achievement) {
            for (let confirm of ach.confirmations) {
                if (confirm.id && confirm.id.FilePath && !(path.basename(confirm.id.FilePath) in confirmations)) {
                    confirmations.push(path.basename(confirm.id.FilePath));
                }
            }
        }
    }
    const usedFiles = confirmations;
    const files = await fs.promises.readdir(filePath);
    const forgottenFiles = [];
    const missedFiles = [];
    let totalUselessSize = 0;
    for (let file of files) {
        if (usedFiles.findIndex(x => x === file) === -1) {
            forgottenFiles.push(file);
            const stat = await fs.promises.stat(filePath + file);
            totalUselessSize += stat.size;
        }
    }
    for (let file of usedFiles) {
        if (files.findIndex(x => x === file) === -1) {
            missedFiles.push(file);
        }
    }

    const stat = await fs.promises.lstat(filePath);
    const totalSize = (stat.size / 1024 / 1024).toFixed(2) + ' Мб';
    totalUselessSize = (totalUselessSize / 1024 / 1024).toFixed(2) + ' Мб';

    const confirmationsIds = [];
    for (let forgottenFile of forgottenFiles) {
        const confirmation = await ConfirmationModel.findOne({FilePath: filePath + forgottenFile}).lean();
        if (confirmation) {
            confirmationsIds.push(confirmation._id);
        }
    }

    for (let confId of confirmationsIds) {
        await UserModel.updateOne({Confirmations: {$elemMatch: {id: confId}}},
            {$pull: {Confirmations: {id: confId}}});
        await ConfirmationModel.deleteOne({_id: confId});
    }
    for (let forgottenFile of forgottenFiles) {
        await fs.promises.unlink(filePath + forgottenFile);
    }
    return {totalSize, ClearedSpace: totalUselessSize, RemovedIds: confirmationsIds};
};