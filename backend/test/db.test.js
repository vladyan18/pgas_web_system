var assert = require("assert");
var db = require("../controllers/dbController.js");
var userModel = require("../models/user.js");

describe("User tests", function () {
    it('Should create, get User by Id and remove', (done) => {
        user = {};
        user.id = 'TEST';
        db.createUser(user).then(() => {
            db.findUserById('TEST').then((newUser) => {
                assert.equal(user.id, newUser.id);
                userModel.findByIdAndRemove(newUser._id.toString()).then(done())

            })
        })
    });

    it('Should add achievement to user', (done) => {
        user = {};
        user.id = 'TEST';
        db.createUser(user).then(() => {
            db.addAchieveToUser('TEST', 'TEST').then(() => {
                db.findUserById('TEST').then((newUser) => {
                    assert.ok(newUser.Achievement.some(o => o == 'TEST'));
                    userModel.findByIdAndRemove(newUser._id.toString()).then(done())

                })
            })
        })
    })

});
