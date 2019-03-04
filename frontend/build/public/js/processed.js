function ToggleRating (button, i) {
    let id = button.value
    if (!IsInRating[i])
    {
        $.post('/AddToRating', { Id: id});
        $('#H' + i).addClass("inRating");
        IsInRating[i] = true
    }
    else
    {
        $.post('/RemoveFromRating', { Id: id});
        $('#H' + i).removeClass("inRating");
        IsInRating[i] = false
    }

    $('#BL'+i).remove()
}

function Success (button, i, j) {
    let id = button.value
    $.post('/AchSuccess', { Id: id})
    $('#TR' + i + '_' + j).removeClass("table-danger");
    $('#TR' + i + '_' + j).removeClass("table-warning");
    $('#TR' + i + '_' + j).addClass("table-success");
    if (usersInfo[i].Statuses[j] == 'Изменено')
        $('#Stat_' + i + '_' + j).text('Принято с изменениями')
    else $('#Stat_' + i + '_' + j).text('Принято')
}

function Failed (button, i, j) {
    let id = button.value
    $.post('/AchFailed', { Id: id})
    $('#TR' + i + '_' + j).removeClass("table-success");
    $('#TR' + i + '_' + j).addClass("table-danger");
    $('#Stat_' + i + '_' + j).text('Отказано')
}

var editingAchNum;
var editingUserNum;
function Edit (button, i, j) {
    editingUserNum = i
    editingAchNum = j
    let id = button.value
    let Achs = []
    for (var k = 0 ; k < usersInfo[i].Achievements.length; k++) {
        let a = {crit: usersInfo[i].Achievements[k], _id: usersInfo[i].AchId[k]}
        Achs.push(a)
    }
    prepareModal({Course: usersInfo[i].Course, Achs : Achs})
    setAch(id, {Course: usersInfo[i].Course, Achs : Achs})
    $('#myModal').modal('show');
    //$(location).attr('href','/achievement/' + id)
}

function SaveEdition () {
    editCrit()
    $('#TR' + editingUserNum + '_' + editingAchNum).removeClass("table-danger");
    $('#TR' + editingUserNum + '_' + editingAchNum).removeClass("table-success");
    $('#TR' + editingUserNum + '_' + editingAchNum).addClass("table-warning");


    let crit = $('#check2').val();
    let chars = [];

    // получение списка характеристик
    if (kritSelector.kritChild)
        getChars(kritSelector.kritChild, chars);

    let achievement = $('#comment').val()

    $('#Stat_' + editingUserNum + '_' + editingAchNum).text('Изменено')
    usersInfo[editingUserNum].Statuses[editingAchNum] = 'Изменено'
    $('#Crit_' + editingUserNum + '_' + editingAchNum).text(crit)
    $('#Ach_' + editingUserNum + '_' + editingAchNum).text(achievement)

    str = ''
    for (var k = 0; k < chars.length; k++)
    {
        if (k != 0) str += ', '
        str += chars[k]
    }
    $('#Chars_' + editingUserNum + '_' + editingAchNum).text(str)
}

function Comment (button, i, j) {
    let id = button.value
    let comment = document.getElementById(id).value
    $.post('/comment', { Id: id, comment:comment})
    $('#' + id).addClass("table-success");
}


var IsInRating = []
var usersInfo
function getUsers () {
    var xhr = new XMLHttpRequest()

    xhr.open('GET', '/checked', true)

    xhr.onload = function () {
        let data = JSON.parse(xhr.responseText)
        usersInfo = data.Info
        console.log(data)
        let qq = ''
        for (let i = 0; i < data.Info.length; i++) {
            IsInRating[i] = data.Info[i].IsInRating
            qq += '<div id="BL'+i+'"><div class="name"><h3 id="H'+i+'"style="display: flex; justify-content: space-between; "'+ (data.Info[i].IsInRating ? 'class="inRating"' : '') + '>' + data.Info[i].user + '<div style="margin-bottom: auto; margin-top: auto"><button type="button" onclick="ToggleRating(this, '+i+')" value="' + data.Info[i].Id + '" class="btn btn-xs" style="font-size: x-small">'+(data.Info[i].IsInRating ? 'Убрать из рейтинга' : 'Добавить в рейтинг')+'</button></div></h3><block style="display: block">'
            qq += '<table class="table"><thead><th>Критерий</th><th>Достижение</th><th>Хар-ки</th><th>Статус</th><th>Комментарий</th><th></th></thead><tbody>'
            for (let j = 0; j < data.Info[i].Achievements.length; ++j) {
                qq += '<tr id="TR'+i+'_'+j+'" style="cursor: pointer;" ' + 'class="' + ((data.Info[i].Statuses[j] == 'Принято' || data.Info[i].Statuses[j] == 'Принято с изменениями') ? 'table-success' : '')  +
                    (data.Info[i].Statuses[j] == 'Отказано' ? 'table-danger' : '')  + (data.Info[i].Statuses[j] == 'Изменено' ? 'table-warning' : '') +
                    '"><td><span id="Crit_'+i+'_'+j+'">'+ data.Info[i].Achievements[j]+ '</span></td>';
                qq += '<td><span id="Ach_'+i+'_'+j+'">'+ data.Info[i].AchTexts[j] +'</span></td>';
                qq += '<td><span id="Chars_'+i+'_'+j+'">'+ data.Info[i].Chars[j] +'</td>';
                qq += '<td><span id="Stat_'+i+'_'+j+'">'+ data.Info[i].Statuses[j] +'</span></td>';
                qq += '<td>'
                qq += '<textarea placeholder="Введите комментарий..." id="'+ data.Info[i].AchId[j] + '">'+ data.Info[i].Comments[j] +'</textarea>'
                qq +=  '<button type="button" onclick="Comment(this,'+i+' ,'+j+')" value="' + data.Info[i].AchId[j] + '" class="btn btn-dark btn-sm">Отправить</button>'
                qq += '</td>'
                qq += '<td><div style="display: block">'
                qq += '<div><button type="button" onclick="Success(this,'+i+' , '+j+')" value="' + data.Info[i].AchId[j] + '" class="btn btn-success btn-sm">Принять</button></div>'
                qq += '<div><button type="button" onclick="Failed(this, '+i+' ,'+j+')" value="' + data.Info[i].AchId[j] + '" class="btn btn-danger btn-sm">Отклонить</button></div>'
                qq += '<div><button type="button" onclick="Edit(this, '+i+','+j+')" value="' + data.Info[i].AchId[j] + '" class="btn btn-warning btn-sm" data-toggle="modal" data-target="#exampleModal">Изменить</button></div>'
                qq += '</div></td>'
                qq += '</tr>'
            }
            qq += '</tbody></table></block></div></div>'
        }
        document.getElementById('users').innerHTML = qq

    }

    xhr.send()
};

getUsers()