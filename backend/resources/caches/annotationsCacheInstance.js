const AnnotationsModel = require('../../models/annotation');
const facultyCache = require('./facultyCacheInstance');

class AnnotationsCache {
    constructor() {
        this.cache = {};
    }

    async get(facultyName) {
        const facObject = await facultyCache.get(facultyName);
        if (!facObject || !facObject.AnnotationsToCritsId) {
            return undefined;
        }
        if (!this.cache[facultyName] || this.cache[facultyName]._id.toString() !== facObject.AnnotationsToCritsId.toString()) {
            this.cache[facultyName] = await AnnotationsModel.findById(facObject.AnnotationsToCritsId).lean();
        }
        return this.cache[facultyName];
    }
}

module.exports = new AnnotationsCache();