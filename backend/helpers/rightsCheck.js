const AccessLevels = require('../../common/consts/accessLevels');

module.exports.hasAccessLevel = function({Role}, accessLevel) {
    if (!Role) return false;
    return accessLevel.includes(Role);
};

module.exports.hasAccessLevelInFaculty = function ({Role, Rights}, accessLevel, facultyName) {
    if (!Role) return false;

    if ( module.exports.hasAccessLevel({ Role }, AccessLevels.SUPERADMIN) ) {
        return true;
    }

    const hasLevel = module.exports.hasAccessLevel({ Role }, accessLevel);
    if (!hasLevel || !Rights || Rights.length === 0) {
        return false
    }

    return Rights.includes(facultyName);
};