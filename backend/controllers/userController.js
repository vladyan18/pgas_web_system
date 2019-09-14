/** User controller
 * @module userController
 */

const path = require('path');
const passport = require(path.join(__dirname, '../config/passport'));
const upload = require(path.join(__dirname, '../config/multer'));
const uploadConfirmation = require(path.join(__dirname, '../config/confirmationMulter'));
const db = require('./dbController');
const fs = require('fs');


const uploadsPath = path.join(__dirname, '../../frontend/build/public/uploads');
const uploadsConfirmationsPath = path.join(__dirname, '../static/confirmations');

/**
 * Get all new canditates
 * @function dynamic
 * */
module.exports.dynamic = async function (req, res) {
    if (req.user._json.email)
        var id = req.user._json.email;
    else var id = req.user.user_id;

    achPr = db.findAchieves(id);

    db.findUserById(id).then((User) => { // TODO OPTIMIZE
        achPr.then(async (v) => {


            for (let i = 0; i < v.length; i++) {
                let confirms = [];
                console.log('1', confirms);
                if (v[i].confirmations)
                    for (let j = 0; j < v[i].confirmations.length; j++) {

                        let confirm = await db.getConfirmByIdForUser(v[i].confirmations[j]);
                        confirms.push(confirm)
                    }
                console.log('2', confirms);
                v[i].confirmations = confirms
            }

            User.Achs = v;
            res.status(200).send(User)
        })
    })
};

/**
 * Get user profile
 * @function getProfile
 * */
module.exports.getProfile = async function (req, res) {
    let User;
    if (req.user._json.email)
        User = await db.findUserById(req.user._json.email);
    else User = await db.findUserById(req.user.user_id);

    if (User.Registered)
        res.status(200).send({
            id: User.id,
            LastName: User.LastName,
            FirstName: User.FirstName,
            Patronymic: User.Patronymic,
            Birthdate: User.Birthdate,
            SpbuId: User.SpbuId,
            Faculty: User.Faculty,
            Type: User.Type,
            Course: User.Course
        });
    else res.status(404).send()
};

module.exports.getRights = async function (req, res) {
    let User = await db.getUserRights(req.query.id);
    res.status(200).send({Role: User.Role, Rights: User.Rights})
};

module.exports.isAuth = async function (req, res) {
    if (req.isAuthenticated())
        res.json({
            success: true,
            message: "user has successfully authenticated ",
            role: req.user.Role,
            rights: req.user.Rights,
            cookies: req.cookies
        });
    else res.status(401).send()
};

/**
 * Get achievement
 * @function getAch
 * */
module.exports.getAch = async function (req, res) {
    id = req.query.achievement;
    let ach = await db.findAchieveById(id);
    let confirms = [];

    for (let i = 0; i < ach.confirmations.length; i++) {
        let confirm = await db.getConfirmByIdForUser(ach.confirmations[i]);
        confirms.push(confirm)
    }
    ach.confirmations = confirms;
    res.status(200).send(ach)
};

/**
 * Register user
 * @function registerUser
 * */
module.exports.registerUser = async function (req, res) {
    try {
        let data = req.body;
        console.log(data);
        if (req.user && req.user._json.email)
            id = req.user._json.email;
        else id = req.user.user_id;
        await db.registerUser(id, data.lastname, data.name, data.patronymic, data.birthdate, data.spbuId, data.faculty, data.course, data.type);
        req.session.passport.user.Registered = true;
        req.session.save(function (err) {
            console.log(err);
        });
        res.sendStatus(200)
    } catch (err) {
        console.log(err);
        res.status(500).send(err)
    }
};

module.exports.addConfirmation = function (req, res) {
    let data = req.body;
    data.Date = Date.now();
    db.createConfirmation(data).then(
        (result) => {
            res.status(200).send(result)
        }
    )
};

module.exports.getConfirmation = async function (req, res) { //TODO SECURITY
    let filename = await req.url.slice(12);
    let filePath = path.join(__dirname, '../static/confirmations/' + filename);
    res.sendFile(filePath)
};

module.exports.addFileForConfirmation = function (req, res) {

    if (!fs.existsSync(uploadsConfirmationsPath)) {
        fs.mkdirSync(uploadsConfirmationsPath)
    }

    uploadConfirmation(req, res, async function (err) {

        if (err) {
            return res.status(400).send('ERROR: Max file size = 15MB')
        }

        let confirmation = JSON.parse(req.body.data);
        console.log(req.file);
        confirmation.FilePath = req.file.path;
        confirmation.Data = 'http://localhost:3000/api/getConfirm/' + req.file.filename;
        confirmation.Date = Date.now();
        db.createConfirmation(confirmation).then(
            (result) => {
                result.FilePath = undefined;
                res.status(200).send(result)
            }
        )
    })
};

/**
 * Add achievement to user
 * @function addAchieve
 * */
module.exports.addAchieve = function (req, res) {
    if (!fs.existsSync(uploadsPath)) {
        fs.mkdirSync(uploadsPath)
    }
    upload(req, res, async function (err) {
        try {
            if (err) {
                return res.status(400).send('ERROR: Max file size = 15MB')
            }
            let achieve = JSON.parse(req.body.data);

            let options = {
                year: 'numeric',
                month: 'numeric',
                day: 'numeric'
            };
            achieve.status = 'Ожидает проверки';
            achieve.date = new Date().toLocaleString('ru', options);


            achieve.comment = '';
            let createdAchieve = await db.createAchieve(achieve);
            if (req.user._json && req.user._json.email)
                id = req.user._json.email;
            else id = req.user.user_id;
            await db.addAchieveToUser(id, createdAchieve._id);
            res.sendStatus(200)
        } catch (err) {
            console.log(err);
            res.status(500).send(err)
        }
    })
};

/**
 * Change achieve
 * @function updateAchieve
 * */
module.exports.updateAchieve = async function (req, res) {
    try {
        let achieve = req.body.data;
            let id = req.body.achId;
            let options = {
                year: 'numeric',
                month: 'numeric',
                day: 'numeric'
            };
            achieve.status = 'Ожидает проверки';
            achieve.date = new Date().toLocaleString('ru', options);

            let createdAchieve = await db.updateAchieve(id, achieve);
            res.sendStatus(200)
        } catch (err) {
            console.log(err);
            res.status(500).send(err)
        }
};

/**
 * Delete achieve
 * @function deleteAchieve
 * */
module.exports.deleteAchieve = async function (req, res) {

        try {
            let id = req.body.achId;

            if (req.user._json.email)
                User = await db.findUserById(req.user._json.email);
            else User = await db.findUserById(req.user.user_id);

            if (User.Role != 'Admin' &&  User.Role!='SuperAdmin' && !User.Achievement.some(o => (o && o == id)))
                return res.sendStatus(404);

            let result = await db.deleteAchieve(id);
            res.sendStatus(200)
        } catch (err) {
            console.log(err);
            res.status(500).send(err)
        }
};
