var assert = require("assert");
var operations = require("../controllers/userController.js");
var Achieve = require("../models/achieve.js")

describe('Achs', () => {
    beforeEach((done) => { //Перед каждым тестом чистим базу
        Achieve.remove({}, (err) => {
            done();
        });
    });

    describe("Operation Tests", function () {

    })