const AchieveModel = require('../models/achieve')

exports.allAchieves = function () {
  return AchieveModel.find({})
}

exports.createAchieve = function (achieve) {
  return AchieveModel.create(achieve)
}

exports.deleteAchieves = function(){
  return AchieveModel.remove({})
}
