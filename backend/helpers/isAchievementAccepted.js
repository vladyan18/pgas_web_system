module.exports = function(achievement) {
    return achievement.status === 'Принято' || achievement.status === 'Принято с изменениями';
}