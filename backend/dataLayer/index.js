const achievement = require('./achievement');
const confirmation = require('./confirmation');
const faculty = require('./faculty');
const history = require('./history');
const session = require('./session');
const user = require('./user');

module.exports = { ...achievement, ...confirmation, ...faculty, ...history, ...session, ...user };