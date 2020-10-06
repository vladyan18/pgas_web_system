const CriteriasModel = require('../../models/criterias');
const facultyCache = require('./facultyCacheInstance');

class CriteriasCache {
    constructor() {
        this.cache = {};
    }

    async get(facultyName) {
        const facObject = await facultyCache.get(facultyName);
        if (!facObject || !facObject.CritsId) {
            return undefined;
        }
        if (!this.cache[facultyName] || this.cache[facultyName]._id !== facObject.CritsId.toString()) {
            const crits = await CriteriasModel.findById(facObject.CritsId).lean();
            this.cache[facultyName] = {
                _id: facObject.CritsId.toString(),
                rawCrits: crits.Crits,
                Crits: JSON.parse(crits.Crits),
                Limits: crits.Limits
            };
        }
        return this.cache[facultyName];
    }
}

module.exports = new CriteriasCache();