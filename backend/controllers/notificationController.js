const db = require('./dbController')
const EventEmitter = require('events');

class UpdateEmitter extends EventEmitter {
}

const NotifyEmitter = new UpdateEmitter();

module.exports.emitSuccess = async function (req, targetUser) {
    let id;
    if (req.user._json.email)
        id = req.user._json.email
    else id = req.user.user_id
    let ach = await db.findAchieveById(req.body.Id)
    db.findUserById(id).then((User) => {
        let msg = User.FirstName + ' ' + User.LastName
        msg += ' подтвердил ' + ach.crit + ' для ' + targetUser.FirstName + ' ' + targetUser.LastName
        NotifyEmitter.emit('Update', 'Success', msg, User.id)
    })
}

module.exports.emitComment = async function (req, achieveId) {
    let id;
    if (req.user._json.email)
        id = req.user._json.email
    else id = req.user.user_id
    let ach = await db.findAchieveById(achieveId)
    db.findUserById(id).then(async (User) => {
        var msg = User.FirstName + ' ' + User.LastName
        let targetUser = await db.findUserByAchieve(ach._id)
        msg += ' прокомментировал ' + ach.crit + ' для ' + targetUser.FirstName + ' ' + targetUser.LastName
        NotifyEmitter.emit('Update', 'Comment', msg, User.id)
    })
}

module.exports.emitDecline = async function (req, targetUser) {
    let id;
    if (req.user._json.email)
        id = req.user._json.email
    else id = req.user.user_id
    let ach = await db.findAchieveById(req.body.Id)
    db.findUserById(id).then((User) => {
        var msg = User.FirstName + ' ' + User.LastName
        msg += ' отклонил ' + ach.crit + ' для ' + targetUser.FirstName + ' ' + targetUser.LastName
        NotifyEmitter.emit('Update', 'Decline', msg, User.id)
    })
}

module.exports.emitChange = async function (req, achieve) {
    let id;
    if (req.user._json.email)
        id = req.user._json.email
    else id = req.user.user_id
    db.findUserById(id).then(async (User) => {
        var msg = User.FirstName + ' ' + User.LastName
        let targetUser = await db.findUserByAchieve(achieve._id)
        msg += ' изменил ' + achieve.crit + ' для ' + targetUser.FirstName + ' ' + targetUser.LastName
        NotifyEmitter.emit('Update', 'Change', msg, User.id)
    })
}

module.exports.AddToRating = async function (req, userId) {
    let id;
    if (req.user._json.email)
        id = req.user._json.email
    else id = req.user.user_id
    let targetUser = await db.findUser(userId)
    db.findUserById(id).then((User) => {
        var msg = User.FirstName + ' ' + User.LastName
        msg += ' включил ' + targetUser.FirstName + ' ' + targetUser.LastName + ' в рейтинг'
        NotifyEmitter.emit('Update', 'Success', msg, User.id)
    })
}

module.exports.RemoveFromRating = async function (req, userId) {
    let id;
    if (req.user._json.email)
        id = req.user._json.email
    else id = req.user.user_id
    let targetUser = await db.findUser(userId)
    db.findUserById(id).then((User) => {
        var msg = User.FirstName + ' ' + User.LastName
        msg += ' убрал ' + targetUser.FirstName + ' ' + targetUser.LastName + ' из рейтинга'
        NotifyEmitter.emit('Update', 'Decline', msg, User.id)
    })
}

module.exports.waitForNotifies = async function (req, res) {
    var timer
    var flag = false
    var callback = (type, message, id) => {
        setImmediate(() => {
            if (!flag) {
                flag = true
                res.status(200).send({Type: type, Message: message, Id: id})
                clearTimeout(timer)
            }
        })
    }
    NotifyEmitter.once('Update', callback)

    timer = setTimeout(function () {
        if (!flag) {
            flag = true
            NotifyEmitter.removeListener('Update', callback)
            res.sendStatus(408)
        }
    }, 300000)
}
