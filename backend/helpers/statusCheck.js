const { NEW, ACCEPTED, DECLINED, CHANGED, CHANGED_AND_ACCEPTED, INCORRECT } = require('../../common/consts').Statuses;

module.exports.isAccepted = function({ status }) {
    return [ACCEPTED, CHANGED_AND_ACCEPTED].includes(status);
};

module.exports.isDeclined = function({ status }) {
    return DECLINED === status;
};

module.exports.isNew = function({ status }) {
    return NEW === status || !status;
};

module.exports.shouldNotCountPreliminary = function({ status }) {
    return [DECLINED, INCORRECT].includes(status);
};

module.exports.isChangeByUserBlocked = function({ status }) {
    return [ACCEPTED, CHANGED_AND_ACCEPTED, DECLINED, CHANGED].includes(status);
};

module.exports.wasChanged = function({ status }) {
    return [CHANGED, CHANGED_AND_ACCEPTED].includes(status);
};