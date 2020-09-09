const options = {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
};

module.exports = function () {
    return new Date().toLocaleString('ru', options);
}