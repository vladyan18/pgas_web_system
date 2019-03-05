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
    if (usersInfo[i].Achievements[j].status == 'Изменено')
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
        let a = {crit: usersInfo[i].Achievements[k].crit, _id: usersInfo[i].Achievements[k]._id.toString()}
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
    $('#Crit_' + editingUserNum + '_' + editingAchNum).text(crit)
    usersInfo[editingUserNum].Statuses[editingAchNum] = 'Изменено'
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
    $('#' + id).addClass("commentSended");
}


var IsInRating = []
var usersInfo

function getUsers () {
  var xhr = new XMLHttpRequest()

  xhr.open('GET', '/getUsersForAdmin', true)

  xhr.onload = function () {
    let data = JSON.parse(xhr.responseText)
      usersInfo = data.Info
    console.log(data)
    let qq = ''
      for (let i = 0; i < data.Info.length; i++) {
          IsInRating[i] = data.Info[i].IsInRating



          qq += '<div id="BL'+i+'"><div class="name"><div style="width: 100%; margin-bottom: 10px" class="input-group" id="H'+i+'"><h3 class="form-control nameHeader " style="border: 0; box-shadow: none">' + data.Info[i].user + '</h3><div class="input-group-append" ><button type="button" onclick="ToggleRating(this, '+i+')" value="' + data.Info[i].Id + '" class="btn btn-dark btn-xs" style="font-size: x-small; margin-right: 0px; border-radius: 0px">'+(data.Info[i].IsInRating ? 'Убрать из рейтинга' : 'Добавить в рейтинг')+'</button></div></div><block style="display: block;overflow: auto;">'
          qq += '<table class="table"><thead><th class="table-bordered">Крит.</th><th class="table-bordered">Достижение</th><th class="table-bordered">Хар-ки</th><th class="table-bordered">Дата</th><th class="table-bordered">Статус</th><th>Комментарий</th><th></th></thead><tbody>'
          for (let j = 0; j < data.Info[i].Achievements.length; ++j) {
              qq += '<tr id="TR'+i+'_'+j+'" ' + 'class="' + ((data.Info[i].Achievements[j].status == 'Принято' || data.Info[i].Achievements[j].status == 'Принято с изменениями') ? 'table-success' : '')  +
                  (data.Info[i].Achievements[j].status == 'Отказано' ? 'table-danger' : '')  + (data.Info[i].Achievements[j].status == 'Изменено' ? 'table-warning' : '') +
                  '"><td class="table-bordered" style="vertical-align: middle"width="5%"><span id="Crit_'+i+'_'+j+'">'+ data.Info[i].Achievements[j].crit+ '</span></td>';
              qq += '<td class="table-bordered" style="vertical-align: middle" ><span id="Ach_'+i+'_'+j+'">'+ data.Info[i].Achievements[j].achievement +'</span></td>';
              qq += '<td class="table-bordered" style="vertical-align: middle" width="24%"><span id="Chars_'+i+'_'+j+'">'+ data.Info[i].Achievements[j].chars +'</td>';
              qq += '<td class="table-bordered" style="vertical-align: middle" width="8%">'+ getDate(data.Info[i].Achievements[j].date) +'</td>'
              qq += '<td class="table-bordered" style="vertical-align: middle" width="9%"><span id="Stat_'+i+'_'+j+'">'+ data.Info[i].Achievements[j].status +'</span></td>';
              qq += '<td width="20%"><div class="input-group" style="min-height: 91px; width: 100%">'

              qq += '<textarea class="form-control '+ (data.Info[i].Achievements[j].comment? 'commentSended':'') +'" placeholder="Введите комментарий..." id="'+ data.Info[i].Achievements[j]._id.toString() + '">'+ data.Info[i].Achievements[j].comment +'</textarea>' +
                  '  <div class="input-group-append" style="margin-right: 0px">' +
                  '<button type="button" style="margin-right: 0px" onclick="Comment(this,'+i+' ,'+j+')" value="' + data.Info[i].Achievements[j]._id.toString() + '" class="btn btn-info btn-sm">Отправить</button>' +
                  '  </div>'
              qq += '</div></td>'
              qq += '<td width="5%"><div style="display: block">'
              qq += '<div width="5%"><button style="width: 100%" type="button" onclick="Edit(this, '+i+','+j+')" value="' + data.Info[i].Achievements[j]._id.toString() + '" class="btn btn-warning btn-sm" data-toggle="modal" data-target="#exampleModal">Изменить</button></div>'
              qq += '<div width="5%"><button style="width: 100%" type="button" onclick="Failed(this, '+i+' ,'+j+')" value="' + data.Info[i].Achievements[j]._id.toString() + '" class="btn btn-danger btn-sm">Отклонить</button></div>'
              qq += '<div width="5%"><button style="width: 100%" type="button" onclick="Success(this,'+i+' , '+j+')" value="' + data.Info[i].Achievements[j]._id.toString() + '" class="btn btn-success btn-sm">Принять</button></div>'
              qq += '</div></td>'
              qq += '</tr>'
          }
          qq += '</tbody></table></block></div></div>'
      }
      document.getElementById('users').innerHTML = qq

      $('.name h3').click(function () {
          console.log($(this).parent().parent().children())
          if (!$(this).parent().parent().find('block').is(':visible')) {
              $(this).parent().parent().find('block').show(200)
          }
          else {
              $(this).parent().parent().find('block').hide(200)
          }
      })
  }


    xhr.send()
};

function getDate(d) {
    if (!d) return undefined
    d = new Date(d)
    return (d.getDate()> 9 ? d.getDate() : '0' + d.getDate())  + "." + ((d.getMonth()+1) > 9 ? (d.getMonth()+1) : '0' + (d.getMonth()+1)) + "." + d.getFullYear();
}

getUsers()