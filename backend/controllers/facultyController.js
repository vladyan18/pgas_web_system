const db = require('./dbController');

module.exports.getFacultiesList = async function(req, res) {
  try {
    const faculties = await db.getAllFaculties();
    const list = [];
    for (const faculty of faculties) {
      list.push(faculty.Name);
    }

    res.status(200).send({list: list});
  } catch (e) {
    res.status(500).send(e);
  }
};

module.exports.getFaculty = async function(req, res) {
  try {
    const Faculty = await db.getFaculty(req.query.name);
    res.status(200).send(Faculty);
  } catch (e) {
    res.status(500).send(e);
  }
};

module.exports.createFaculty = async function(req, res) {
  // try {
  const Faculty = req.body;
  await db.createFaculty(Faculty);
  res.sendStatus(200);
  // }
  // catch (e) {
  //    res.status(500).send(e)
  // }
};
