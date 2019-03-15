var IsInRating = [];
var usersInfo;

function getUsers() {
    var xhr = new XMLHttpRequest();
    if (isProcessedPage) xhr.open('GET', '/checked', true);
    else xhr.open('GET', '/getUsersForAdmin', true);

    xhr.onload = function () {
        let data = JSON.parse(xhr.responseText);
        let infoBuf = usersInfo;
        if (infoBuf) for (user of infoBuf) {
            for (ach of user.Achievements)
                ach.systematics = undefined;
        }
        console.log(JSON.stringify(data.Info) == JSON.stringify(infoBuf));
        if (JSON.stringify(data.Info) == JSON.stringify(infoBuf)) {
            registerForUpdate();
            return false
        }
        usersInfo = data.Info;
        let qq = '';
        for (let i = 0; i < data.Info.length; i++) {
            IsInRating[i] = data.Info[i].IsInRating;


            for (var j = 0; j < data.Info[i].Achievements.length; j++) {
                qq += '<tr data-index="' + j + '" id="TR' + i + '_' + j + '" ' + 'class="' + ((data.Info[i].Achievements[j].status == 'Принято' || data.Info[i].Achievements[j].status == 'Принято с изменениями') ? 'table-success' : '') +
                    (data.Info[i].Achievements[j].status == 'Отказано' ? 'table-danger' : '') + (data.Info[i].Achievements[j].status == 'Изменено' ? 'table-warning' : '') +
                    '">' + '<td class="table-bordered" style="vertical-align: middle"width="15%"><b><a style="color: black" target="_blank" href="user/' + data.Info[i].Id + '">' + data.Info[i].user + '</a></b></td>' +
                    '<td class="table-bordered" style="vertical-align: middle"width="2%"> ' + data.Info[i].Type[0] + '</td>' + '<td class="table-bordered" style="vertical-align: middle"width="2%">' + data.Info[i].Course + '</td>' +
                    '<td class="table-bordered" style="vertical-align: middle"width="5%"><span id="Crit_' + i + '_' + j + '">' + data.Info[i].Achievements[j].crit + '</span></td>';
                qq += '<td class="table-bordered" style="vertical-align: middle" ><span id="Ach_' + i + '_' + j + '">' + data.Info[i].Achievements[j].achievement + '</span></td>';
                qq += '<td class="table-bordered" style="vertical-align: middle" width="24%"><span id="Chars_' + i + '_' + j + '">' + data.Info[i].Achievements[j].chars + '</td>';
                qq += '<td class="table-bordered" style="vertical-align: middle" width="8%">' + (data.Info[i].Achievements[j].achDate ? getDate(data.Info[i].Achievements[j].achDate) : '') + '</td>';
                qq += '<td class="table-bordered" style="vertical-align: middle" width="9%"><span id="Stat_' + i + '_' + j + '">' + data.Info[i].Achievements[j].status + '</span></td>';
                qq += '<td class="table-bordered" style="vertical-align: middle" width="15%">';

                qq += data.Info[i].Achievements[j].comment + '</td>';
                qq += '</tr>'
            }

        }


        document.getElementById('achTable').innerHTML = qq;

        var t = document.getElementById('achieves').innerHTML;
        $('#achT').remove();
        document.getElementById('achieves').innerHTML = t;

        $('#panel').fadeIn(60);
        registerForUpdate()
    };


    xhr.send()
}
function registerForUpdate() {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', '/waitForUpdates', true);
    xhr.onload = () => {
        console.log('UPDATE');
        getUsers()
    };

    xhr.onerror = () => {
        xhr.open('GET', '/waitForUpdates', true);
        setTimeout(() => {
            xhr.send()
        }, 5000)
    };
    xhr.send()
}

function registerForNotify() {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', '/waitForNotify', true);
    xhr.onload = () => {
        registerForNotify();
        if (xhr.responseText != 'Request Timeout') {
            let data = JSON.parse(xhr.responseText);
            if (data.Type == 'Success')
                $().toastmessage('showSuccessToast', data.Message);
            if (data.Type == 'Decline')
                $().toastmessage('showErrorToast', data.Message);
            if (data.Type == 'Change')
                $().toastmessage('showWarningToast', data.Message);
            if (data.Type == 'Comment')
                $().toastmessage('showNoticeToast', data.Message);
        }
    };

    xhr.onerror = () => {
        xhr.open('GET', '/waitForNotify', true);
        setTimeout(() => {
            xhr.send()
        }, 1000)
    };
    xhr.send()
}

function getDate(d) {
    if (!d) return undefined;
    d = new Date(d);
    return (d.getDate() > 9 ? d.getDate() : '0' + d.getDate()) + "." + ((d.getMonth() + 1) > 9 ? (d.getMonth() + 1) : '0' + (d.getMonth() + 1)) + "." + d.getFullYear();
}

registerForNotify();
getUsers();
