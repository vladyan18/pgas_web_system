const db = require('./dbController')
const EventEmitter = require('events');

class UpdateEmitter extends EventEmitter {
}

const NotifyEmitter = new UpdateEmitter();

module.exports.emitSuccess = async function (req, targetUser) {
    if (req.user._json.email)
        id = req.user._json.email
    else id = req.user.user_id
    ach = await db.findAchieveById(req.body.Id)
    db.findUserById(id).then((User) => {
        var msg = User.FirstName + ' ' + User.LastName
        msg += ' подтвердил ' + ach.crit + ' для ' + targetUser.FirstName + ' ' + targetUser.LastName
        NotifyEmitter.emit('Update', 'Success', msg, User.id)
    })
}

module.exports.emitComment = async function (req, achieveId) {
    if (req.user._json.email)
        id = req.user._json.email
    else id = req.user.user_id
    ach = await db.findAchieveById(achieveId)
    db.findUserById(id).then(async (User) => {
        var msg = User.FirstName + ' ' + User.LastName
        targetUser = await db.findUserByAchieve(ach._id)
        msg += ' прокомментировал ' + ach.crit + ' для ' + targetUser.FirstName + ' ' + targetUser.LastName
        NotifyEmitter.emit('Update', 'Comment', msg, User.id)
    })
}

module.exports.emitDecline = async function (req, targetUser) {
    if (req.user._json.email)
        id = req.user._json.email
    else id = req.user.user_id
    ach = await db.findAchieveById(req.body.Id)
    db.findUserById(id).then((User) => {
        var msg = User.FirstName + ' ' + User.LastName
        msg += ' отклонил ' + ach.crit + ' для ' + targetUser.FirstName + ' ' + targetUser.LastName
        NotifyEmitter.emit('Update', 'Decline', msg, User.id)
    })
}

module.exports.emitChange = async function (req, achieve) {
    if (req.user._json.email)
        id = req.user._json.email
    else id = req.user.user_id
    db.findUserById(id).then(async (User) => {
        var msg = User.FirstName + ' ' + User.LastName
        targetUser = await db.findUserByAchieve(achieve._id)
        msg += ' изменил ' + achieve.crit + ' для ' + targetUser.FirstName + ' ' + targetUser.LastName
        NotifyEmitter.emit('Update', 'Change', msg, User.id)
    })
}

module.exports.AddToRating = async function (req, userId) {
    if (req.user._json.email)
        id = req.user._json.email
    else id = req.user.user_id
    targetUser = await db.findUser(userId)
    db.findUserById(id).then((User) => {
        var msg = User.FirstName + ' ' + User.LastName
        msg += ' включил ' + targetUser.FirstName + ' ' + targetUser.LastName + ' в рейтинг'
        NotifyEmitter.emit('Update', 'Success', msg, User.id)
    })
}

module.exports.RemoveFromRating = async function (req, userId) {
    if (req.user._json.email)
        id = req.user._json.email
    else id = req.user.user_id
    targetUser = await db.findUser(userId)
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
            flag = true
            res.status(200).send({Type: type, Message: message, Id: id})
            clearTimeout(timer)
        })
    }
    NotifyEmitter.once('Update', callback)

    timer = setTimeout(function () {
        NotifyEmitter.removeListener('Update', callback)
        res.sendStatus(408)
    }, 300000)
}