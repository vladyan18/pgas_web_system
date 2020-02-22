/** User controller
 * @module userController
 */

const path = require('path');
const passport = require(path.join(__dirname, '../config/passport'));
const upload = require(path.join(__dirname, '../config/multer'));
const uploadConfirmation = require(path.join(__dirname, '../config/confirmationMulter'));
const db = require('./dbController');
const fs = require('fs');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');



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

    let User = await db.findUserById(id) // TODO OPTIMIZE
    if (User)
        await db.findActualAchieves(id).then(async (v) => {
                for (let i = 0; i < v.length; i++) {
                    let confirms = [];
                    if (v[i].confirmations)
                        for (let j = 0; j < v[i].confirmations.length; j++) {

                            let confirm = await db.getConfirmByIdForUser(v[i].confirmations[j].id);
                            if (!confirm) continue
                            confirm.additionalInfo = v[i].confirmations[j].additionalInfo;
                            confirms.push(confirm)
                        }
                    v[i].confirmations = confirms;
                }

                User.Achs = v;
                res.status(200).send(User)
        })
    else res.status(404).send({Error: 404})

};

/**
 * Get user profile
 * @function getProfile
 * */
module.exports.getProfile = async function (req, res) {
    let User;
    console.log('BACK ID', req.user.user_id)
    if (req.user._json.email)
        User = await db.findUserById(req.user._json.email);
    else User = await db.findUserById(req.user.user_id);

    if (User && User.Registered)
        res.status(200).send({
            id: User.id,
            LastName: User.LastName,
            FirstName: User.FirstName,
            Patronymic: User.Patronymic,
            Birthdate: User.Birthdate,
            SpbuId: User.SpbuId,
            Faculty: User.Faculty,
            Direction: User.Direction,
            Type: User.Type,
            Course: User.Course,
            IsInRating: User.IsInRating
        });
    else res.status(404).send({Error: 404, facultyRawName: req.user.facultyRawName})
};

module.exports.getRights = async function (req, res) {
    let User = await db.getUserRights(req.query.id);
    res.status(200).send({Role: User.Role, Rights: User.Rights})
};

module.exports.isAuth = async function (req, res) {
    console.log(req.isAuthenticated());
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
        let confirm = await db.getConfirmByIdForUser(ach.confirmations[i].id);
        confirm.additionalInfo = ach.confirmations[i].additionalInfo;
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
        await db.registerUser(id, data.lastname, data.name, data.patronymic,
            data.birthdate, data.spbuId, data.faculty, data.course, data.type,
            data.settings);
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
    if (data.Data)
        if (!(data.Data.startsWith('http://') || data.Data.startsWith('https://')))
            data.Data = '//' + data.Data;
    if (req.user && req.user._json.email)
        id = req.user._json.email;
    else id = req.user.user_id;

    let userPromise = db.findUserById(id);

    db.createConfirmation(data).then(
        (result) => {
            userPromise.then((user) => {
                if (!user.Confirmations || !user.Confirmations.some((x) => x == result._id.toString())) {
                    db.addConfirmationToUser(user._id, result._id).then(() => res.status(200).send(result))
                } else res.status(200).send(result)
            })

        }
    )
};

module.exports.getConfirmations = async function (req, res) { //TODO SECURITY
    if (req.user && req.user._json.email)
        id = req.user._json.email;
    else id = req.user.user_id;
    user = await db.findUserById(id);
    let confirms = await db.getConfirmations(user.Confirmations);
    res.status(200).send(confirms)
};

module.exports.getConfirmation = async function (req, res) { //TODO SECURITY
    let filename = await req.url.slice(12);

    let filePath = path.join(__dirname, '../static/confirmations/' + filename);

    filename = filename.substr(filename.search('-') + 1);
    filename = filename.substr(filename.search('-') + 1);
    try {
        if (!fs.existsSync(filePath)) throw new URIError('Incorrect URI')
        if (filename.endsWith('.pdf')) {
            var file = fs.createReadStream(filePath);
            var stat = fs.statSync(filePath);
            res.setHeader('Content-Length', stat.size);
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'inline');
            file.pipe(res);
        } else
        if (filename.endsWith('.jpg')) {
            var file = fs.createReadStream(filePath);
            var stat = fs.statSync(filePath);
            res.setHeader('Content-Length', stat.size);
            res.setHeader('Content-Type', 'image/jpg');
            res.setHeader('Content-Disposition', 'inline');
            file.pipe(res);
        }
        else{
            res.setHeader('Content-Disposition', 'inline; filename=' + filename);
            res.setHeader('Content-Transfer-Encoding', 'binary');
            res.setHeader('Content-Type', 'application/octet-stream');
            res.sendFile(filePath)
        }
    }
    catch (e) {
        let response = {response: "Not found"}
        console.log(e)
        res.sendStatus(404)
    }
};

module.exports.addFileForConfirmation = function (req, res) {

    if (!fs.existsSync(uploadsConfirmationsPath)) {
        fs.mkdirSync(uploadsConfirmationsPath)
    }

    uploadConfirmation(req, res, async function (err) {

        if (req.user && req.user._json.email)
            id = req.user._json.email;
        else id = req.user.user_id;

        let userPromise = db.findUserById(id);

        if (err) {
            return res.status(400).send('ERROR: Max file size = 15MB')
        }

        let confirmation = JSON.parse(req.body.data);
        confirmation.FilePath = req.file.path;
        confirmation.Data = '/api/getConfirm/' + req.file.filename;
        confirmation.Date = Date.now();
        confirmation.Size = req.file.size;
        db.createConfirmation(confirmation).then(
            (result) => {
                result.FilePath = undefined;
                userPromise.then((user) => {
                    if (!user.Confirmations || !user.Confirmations.some((x) => x == result._id.toString())) {
                        db.addConfirmationToUser(user._id, result._id).then(() => res.status(200).send(result))
                    } else res.status(200).send(result)
                })

            }
        )
    })
};


/**
 * Add achievement to user
 * @function addAchieve
 * */

/*
let browser
puppeteer.launch().then((newBrowser) => browser = newBrowser)

crawlLink = async function (confirmation, user) {
    let userName = (user.LastName + ' ' + user.FirstName + ' ' + user.Patronymic).trim();
    if (confirmation.Data.startsWith('https://elibrary.ru/item.asp?id=') || confirmation.Data.startsWith('elibrary.ru/item.asp?id=')) {
        let html = await browser.newPage()
            .then(page => {
                return page.goto(confirmation.Data).then(function () {
                    return page.content();
                });
            });


        let inRINC = html.search('Входит в РИНЦ<sup>®</sup>:&nbsp;<font color="#00008f">да</font>') != -1;
        let titleNode = '<span style="font-size: 9pt; color: #000000"><span class="bigtext" style="color: #F26C4F"><b>';
        let titleStart = html.search(titleNode);
        let yearNode = '</span>Год:&nbsp;<font color="#00008f">';
        let magazineNode = 'title="Оглавления выпусков этого журнала">';
        if (titleStart != -1) {
            html = html.substr(titleStart);
            let titleEnd = html.search('</b>');
            let title = html.substr(0, titleEnd);
            title = title.replace(titleNode, '');
            let yearStart = html.search(yearNode);
            let year;
            if (yearStart != -1)
                year = html.substr(yearStart).replace(yearNode, '').substr(0, 4);

            let magazine;
            let magazineStart = html.search(magazineNode);
            if (magazineStart != -1) {
                let bufer = html.substr(magazineStart).replace(magazineNode, '');
                let magazineEnd = bufer.search('</a>');
                magazine = bufer.substr(0, magazineEnd)
            }

            let hasLastName = html.search(user.LastName.toUpperCase()) != -1;
            let hasFirstName = html.search(user.FirstName.toUpperCase()) != -1;
            let hasPatronymic = html.search(user.Patronymic.toUpperCase()) != -1;

            return {
                inRINC: inRINC, isAuthor: hasFirstName && hasFirstName && hasPatronymic, title: title,
                magazine: magazine, year: year, crawlDate: Date.now()
            }
        }
    } else return null

};

autoCheckConfirms = async function (achievement) {
    let user = await db.findUserByAchieve(achievement._id);

    for (let confirmWrapped of achievement.confirmations) {
        db.getConfirmByIdForUser(confirmWrapped.id).then((confirm) => {
            if (confirm && confirm.Type == 'link')
                crawlLink(confirm, user).then((result) => {
                    if (result) {
                        db.updateConfirmCrawlResult(confirmWrapped.id, result).then()
                    }
                })
        })
    }
};
*/


module.exports.addAchieve = function (req, res) {
    if (!fs.existsSync(uploadsPath)) {
        fs.mkdirSync(uploadsPath)
    }
    upload(req, res, async function (err) {
        try {
            if (err) {
                return res.status(400).send('ERROR: Max file size = 15MB')
            }

            if (req.user._json && req.user._json.email)
                id = req.user._json.email;
            else id = req.user.user_id;

            let achieve = JSON.parse(req.body.data);
            const user = await db.findUserById(id);
            let validationResult = false;
            try {
                validationResult = await db.validateAchievement(achieve, user);
            } catch (e) {
                console.log('Ach validation outer error');
            }
            if (!validationResult) return res.sendStatus(400);

            const options = {
                year: 'numeric',
                month: 'numeric',
                day: 'numeric'
            };
            achieve.status = 'Ожидает проверки';
            achieve.date = new Date().toLocaleString('ru', options);


            achieve.comment = '';
            let createdAchieve = await db.createAchieve(achieve);
            await db.addAchieveToUser(id, createdAchieve._id);
            //autoCheckConfirms(createdAchieve).then();
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

        let user_id;
        if (req.user._json && req.user._json.email)
            user_id = req.user._json.email;
        else user_id = req.user.user_id;

        const user = await db.findUserById(user_id);
        let validationResult = false;
        try {
            validationResult = await db.validateAchievement(achieve, user);
        } catch (e) {
            console.log('Ach validation outer error');
        }

        if (!validationResult) return res.sendStatus(400);

            let id = req.body.achId;
            let options = {
                year: 'numeric',
                month: 'numeric',
                day: 'numeric'
            };
            let oldAch = await db.findAchieveById(id)
            for (let field of Object.keys(req.body.data))
            {
                if (field == 'confirmations' || field == 'achDate')
                {
                    continue
                }
                if (field == 'chars')
                {
                    let changeDetected = false
                    for (let i = 0; i < oldAch.chars.length; i++)
                        if (oldAch.chars[i] != req.body.data.chars[i])
                        {
                            changeDetected = true;
                            break
                        }
                    if (!changeDetected) continue
                }
                if (oldAch[field] != req.body.data[field])
                {
                    achieve.status = 'Ожидает проверки';
                    achieve.ball = undefined
                }
            }

            achieve.date = new Date().toLocaleString('ru', options);

            let createdAchieve = await db.updateAchieve(id, achieve);
            //autoCheckConfirms(createdAchieve).then();
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

module.exports.getRating = async function (req, res) {

    if (req.user && req.user._json.email)
        id = req.user._json.email;
    else id = req.user.user_id;

    let requestingUser = await db.findUserById(id);

    let facultyName = req.query.faculty
    if (requestingUser.Faculty != facultyName) {
        res.sendStatus(401)
        return
    }

    let kri = JSON.parse((await db.GetCriterias(facultyName)).Crits)
    let users = [];
    let Users = await db.CurrentUsers(facultyName);
    for (let user of Users) {
        let sumBall = 0;
        let crits = {};
        for (key of Object.keys(kri)) {
            crits[key] = 0;
        }
        Achs = await db.findActualAchieves(user.id);
        for(let ach of Achs) {
            if (!ach) continue;
            if (ach.ball) {
                crits[ach.crit] += ach.ball;
                sumBall += ach.ball;
            }
        }
        let fio = user.LastName + ' ' + user.FirstName + ' ' + (user.Patronymic ? user.Patronymic : '');
        users.push({_id: user._id, Name: fio, Type: user.Type, Course: user.Course, Crits: crits, Ball: sumBall, Direction: user.Direction})
    }
    res.status(200).send({ Users: users })
};
