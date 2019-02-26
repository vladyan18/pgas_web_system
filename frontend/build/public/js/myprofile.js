function getInfo() {
    var xhr = new XMLHttpRequest()
    xhr.open('GET', '/getUserInfo', true)
    xhr.onload = function () {
        let data = JSON.parse(xhr.responseText)
        user = data;
        $(' <b>' + data.LastName + ' ' + data.FirstName + ' ' + (data.Patronymic ? data.Patronymic : '') + '</b>').appendTo('#FIO')
        $(' <b>' + getDate(data.Birthdate) + '</b>').appendTo('#Bdate')
        $(' <b>' + data.Faculty + '</b>').appendTo('#Faculty')
        $(' <b>' + data.Type + '</b>').appendTo('#Type')
        $(' <b>' + data.Course + '</b>').appendTo('#Course')
    }
    xhr.send()
}

function getDate(d) {
    if (!d) return undefined
    d = new Date(d)
    return (d.getDate()> 9 ? d.getDate() : '0' + d.getDate())  + "." + ((d.getMonth()+1) > 9 ? (d.getMonth()+1) : '0' + (d.getMonth()+1)) + "." + d.getFullYear();
}

getInfo()