const fs = require('fs');
const path = require('path');
const { BloomFilter } = require('bloom-filters');
const { ConfirmationModel } = require('../../models');
const confirmationsFilePath = path.join(__dirname, '../../static/confirmations/');

const errorRate = 0.05;
const filter = BloomFilter.create(10000, errorRate);
ConfirmationModel.find({}).lean().then((hashes) => {
    console.log('Set Bloom filter');
    hashes = hashes.filter((x) => x.Hash).map((x) => x.Hash);
    for (const hash of hashes) {
        filter.add(hash);
    }
});

module.exports.save = async function(confirmation) {
    let exists = false;
    if (filter.has(confirmation.Hash)) {
        const sameFile = await ConfirmationModel.findOne({Hash: confirmation.Hash, Size: confirmation.Size}).lean();
        if (sameFile && sameFile.FilePath && sameFile.Size === confirmation.Size) {
            const fileName = path.basename(sameFile.FilePath);
            try {
                await fs.promises.access(confirmationsFilePath + fileName);
                fs.promises.unlink(confirmationsFilePath + path.basename(confirmation.FilePath)).then();
                confirmation.FilePath = sameFile.FilePath;
                exists = true;
            } catch (e) {
            }
        }
    } else {
        filter.add(confirmation.Hash);
    }
    return exists;
};

module.exports.remove = async function(filePath) {
    try {
        await fs.promises.access(filePath);
        const hasAnotherReferenceToFile = await ConfirmationModel.findOne({FilePath: filePath}).lean();
        if (hasAnotherReferenceToFile) {
            return;
        }
        fs.promises.unlink(filePath).then();
    } catch (e) {}
};

exports.getFileStream = async function(filePath) {
    filePath = confirmationsFilePath + path.basename(filePath);
    try {
        await fs.promises.access(filePath);
    } catch (error) {
        // находим первого загрузившего такой файл
        const sameFile = await ConfirmationModel.findOne({Data: '/api/getConfirm/' + path.basename(filePath)}, 'FilePath').lean();
        if (!sameFile) {
            return null;
        }

        try {
            filePath = confirmationsFilePath + path.basename(sameFile.FilePath);
            await fs.promises.access(filePath);
        } catch (error) {
            return null;
        }
    }
    const stream = fs.createReadStream(filePath);
    const stat = await fs.promises.stat(filePath);
    return { stream, stat };
};


