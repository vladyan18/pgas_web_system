function getHistory() {
    var xhr = new XMLHttpRequest()
    xhr.open('GET', '/getHistory', true)

    xhr.onload = function () {
        let history = JSON.parse(xhr.responseText).History.reverse()
        console.log(history)
        var qq = ""

        for (var i = 0; i < history.length; i++) {
            note = history[i]
            if (note.Type == 'Success' || note.Type == 'Decline') {
                qq += '<div style="background-color: ' + (note.Type == 'Success' ? '#adffa0' : '#ffb686') + '">'
                qq += '<span style="font-size: x-small; margin-right: 10px">' +
                    getDate(note.Date) + ' </span>'
                qq += '<b>' + note.Author + '</b>' + ' ' + (note.Type == 'Success' ? 'подтвердил ' : 'отклонил ')
                qq += 'для <b><a style="color: black; text-decoration: underline;" target="_blank" href="/user/' + note.TargetUserID + '">' + note.TargetUser + '</a></b> '
                qq += ' достижение в ' + note.Crit + ' '
                qq += '"<a style="color: black; text-decoration: underline;" target="_blank" href="/achievement/' + note.AchID + '">' + note.AchText + '</a>"'
                qq += '</div>'
            }
        }
        document.getElementById('HistoryPanel').innerHTML = qq

        $('#panel').fadeIn(60);
    }
    xhr.send()
};


getHistory()

function getDate(d) {
    if (!d) return undefined
    d = new Date(d)
    return (d.getDate() > 9 ? d.getDate() : '0' + d.getDate()) + "." + ((d.getMonth() + 1) > 9 ? (d.getMonth() + 1) : '0' + (d.getMonth() + 1)) + "." + d.getFullYear() + ' '
        + d.getHours() + ':' + d.getMinutes();
}