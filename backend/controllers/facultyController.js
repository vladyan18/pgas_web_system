const db = require('./dbController');

module.exports.getFaculty = async function (req, res) {
    try {
        let Faculty = await db.GetFaculty(req.query.name);
        res.status(200).send(Faculty)
    }
    catch (e) {
        res.status(500).send(err)
    }
};

module.exports.createFaculty = async function (req, res) {
    //try {
    let Faculty = req.body;
    let createdFaculty = await db.CreateFaculty(Faculty);
    res.sendStatus(200)
    //}
    //catch (e) {
    //    res.status(500).send(e)
    // }
};