const Promise = require("bluebird")
const redis = Promise.promisifyAll(require('redis'))

var redisClient = redis.createClient(6379, 'localhost');

module.exports = redisClient
