const db = require('./dbController')

module.exports.getFaculty = async function (req, res) {
    try {
        Faculty = await db.GetFaculty(req.query.name);
        res.status(200).send(Faculty)
    }
    catch (e) {
        res.status(500).send(err)
    }
}