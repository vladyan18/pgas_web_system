const FacultyModel = require('../models/faculty');

class FacultyCache {
    constructor() {
        this.cache = {};
    }

    async get(facultyName) {
        if (!this.cache[facultyName]) {
            this.cache[facultyName] = await FacultyModel.findOne({Name: facultyName}).lean();
        }
        return this.cache[facultyName];
    }

    clear(facultyName) {
        this.cache[facultyName] = undefined;
    }
}

module.exports = new FacultyCache();