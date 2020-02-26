const db = require('./dbController');

module.exports.getFacultiesList = async function (req, res) {
    try {
        let faculties = await db.GetAllFaculties();
        let list = [];
        for (let faculty of faculties)
            list.push(faculty.Name);

        res.status(200).send({list: list})
    } catch (e) {
        res.status(500).send(e)
    }
};

module.exports.getFaculty = async function (req, res) {
    try {
        let Faculty = await db.GetFaculty(req.query.name);
        res.status(200).send(Faculty)
    }
    catch (e) {
        res.status(500).send(e)
    }
};

module.exports.createFaculty = async function (req, res) {
    //try {
    let Faculty = req.body;
    await db.CreateFaculty(Faculty);
    res.sendStatus(200)
    //}
    //catch (e) {
    //    res.status(500).send(e)
    // }
};
