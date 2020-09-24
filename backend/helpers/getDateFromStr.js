module.exports = function(d) {
    return (d.getDate()> 9 ? d.getDate() : '0' + d.getDate()) + '.' +
        ((d.getMonth()+1) > 9 ? (d.getMonth()+1) : '0' + (d.getMonth()+1)) + '.' + d.getFullYear();
}