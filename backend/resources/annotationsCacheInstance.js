const AnnotationsModel = require('../models/annotation');
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
            const annotations = await AnnotationsModel.findById(facObject.AnnotationsToCritsId).lean();
            this.cache[facultyName] = annotations;
        }
        return this.cache[facultyName];
    }
}

module.exports = new AnnotationsCache();