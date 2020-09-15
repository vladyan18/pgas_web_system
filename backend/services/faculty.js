const db = require('./../controllers/dbController');

module.exports.getFaculty = async function(facultyName) {
    return db.getFaculty(facultyName);
};

module.exports.createFaculty = async function(facultyObject) {
    return db.createFaculty(facultyObject);
};

module.exports.getFacultiesList = async function() {
    const faculties = await db.getAllFaculties();
    return faculties.map(x => x.Name);
};