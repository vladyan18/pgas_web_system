module.exports = function({ LastName, FirstName, Patronymic}) {
    return LastName + ' ' + FirstName + (Patronymic ? ' ' + Patronymic : '');
};
