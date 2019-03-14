function ToggleRating (button, i) {
    let id = button.value
    if (!IsInRating[i])
    {
        $.post('/AddToRating', { Id: id}).done(function () {
            $('#H' + i).addClass("inRating");
            IsInRating[i] = true
            $('#BL'+i).remove()
        });

    }
    else
    {
        $.post('/RemoveFromRating', { Id: id}).done(function () {

            $('#H' + i).removeClass("inRating");
            IsInRating[i] = false
            $('#BL'+i).remove()
        });

    }



}

function Success (button, i, j) {
  let id = button.value
    if (usersInfo[i].Achievements[j].crit == '6 (9а)') {
        if (usersInfo[i].Achievements.filter(o => o.crit == '6 (9а)' && o._id != usersInfo[i].Achievements[j]._id).length < 1) {
            if (!(usersInfo[i].Achievements[j].chars[0] == 'Проведение (обеспечение проведения) деятельности, направленной на помощь людям (в том числе социального и правозащитного характера) (11)'
            || usersInfo[i].Achievements[j].chars[0] == 'Проведение (обеспечение проведения) деятельности природоохранного характера (12)')) {

                if (!(usersInfo[i].Achievements[j].chars[1] == 'На международном уровне'
                || usersInfo[i].Achievements[j].chars[1] == 'На уровне СНГ'
                || usersInfo[i].Achievements[j].chars[1] == 'На всероссийском уровне'
                || usersInfo[i].Achievements[j].chars[1] == 'На уровне федерального округа') || (usersInfo[i].Achievements[j].chars[3] == 'Волонтер' || usersInfo[i].Achievements[j].chars[3] == 'Участник' ))
                {
                alert('Систематика не может быть выполнена')
                return false
                }
                else {
                    if (!confirm('Вы уверены, что выполняются условия примечания 5?')) return false;
                    usersInfo[i].Achievements[j].systematics = 2
                }
            }
        }
        else if (usersInfo[i].Achievements.filter(o => o.crit == '6 (9а)' && (o.status == 'Принято' || o.status == 'Принято с изменениями')).length < 1) {
            alert('Не забудьте про требование систематики')
            usersInfo[i].Achievements[j].systematics = 1
        } else {
            if (usersInfo[i].Achievements[j].status == 'Изменено') {
                $('#Stat_' + i + '_' + j).text('Принято с изменениями')
                usersInfo[i].Achievements[j].status = 'Принято с изменениями'
            }
            usersInfo[i].Achievements[j].systematics = getSystematicsCoeff(usersInfo[i].Achievements[j])
        }
    }

    else if (usersInfo[i].Achievements[j].crit == '10 (10в)'
        || usersInfo[i].Achievements[j].crit == '12 (11б)') {
        var crit = usersInfo[i].Achievements[j].crit
        if (usersInfo[i].Achievements.filter(o => o.crit == crit && o._id != usersInfo[i].Achievements[j]._id).length < 1) {
             alert('Систематика не может быть выполнена')
                    return false
        }
        else if (usersInfo[i].Achievements.filter(o => o.crit == crit && (o.status == 'Принято' || o.status == 'Принято с изменениями')).length < 1) {
            alert('Не забудьте про требование систематики')
            usersInfo[i].Achievements[j].systematics = 1
        } else {
            if (usersInfo[i].Achievements[j].status == 'Изменено') {
                $('#Stat_' + i + '_' + j).text('Принято с изменениями')
                usersInfo[i].Achievements[j].status = 'Принято с изменениями'
            }
            usersInfo[i].Achievements[j].systematics = getSystematicsCoeff(usersInfo[i].Achievements[j])
        }
    }
  $.post('/AchSuccess', { Id: id})
    $('#TR' + i + '_' + j).removeClass("table-danger");
    $('#TR' + i + '_' + j).removeClass("table-warning");
    $('#TR' + i + '_' + j).addClass("table-success");
    if (usersInfo[i].Achievements[j].status == 'Изменено') {
        $('#Stat_' + i + '_' + j).text('Принято с изменениями')
        usersInfo[i].Achievements[j].status = 'Принято с изменениями'
    }
    else {$('#Stat_' + i + '_' + j).text('Принято')
        usersInfo[i].Achievements[j].status = 'Принято'}
}

function Failed (button, i, j) {
  let id = button.value
  $.post('/AchFailed', { Id: id}).done(() => {
      $('#TR' + i + '_' + j).removeClass("table-success");
      $('#TR' + i + '_' + j).addClass("table-danger");
      $('#Stat_' + i + '_' + j).text('Отказано')
      usersInfo[i].Achievements[j].status = 'Отказано'

      if (usersInfo[i].Achievements[j].crit == '6 (9а)' || usersInfo[i].Achievements[j].crit == '10 (10в)'
          || usersInfo[i].Achievements[j].crit == '12 (11б)') {
          recalcSyst(i, j, usersInfo[i].Achievements[j].crit)
      }
  })

}

function recalcSyst(i, j, crit) {
    usersInfo[i].Achievements[j].systematics = 0
    console.log(usersInfo[i].Achievements.filter(o => o.crit == crit))
    var syst = usersInfo[i].Achievements.filter(o => o.crit == crit).reduce(function (a, b) {
        console.log(a)
        return (isFinite(a.systematics)  ? a.systematics : 1) + (isFinite(b.systematics) ? b.systematics : 1)
    });
    console.log(syst)
    if (syst < 2) {
        for (var k = 0; k < usersInfo[i].Achievements.length; k++)
        {
            if (usersInfo[i].Achievements[k].crit == crit)
            {
                let l = k
                $.post('/AchFailed', { Id: usersInfo[i].Achievements[l]._id.toString()}).done(() => {
                    usersInfo[i].Achievements[l].status = 'Отказано'
                    $('#TR' + i + '_' + l).removeClass("table-success");
                    $('#TR' + i + '_' + l).addClass("table-danger");
                    $('#Stat_' + i + '_' + l).text('Отказано');
                    usersInfo[i].Achievements[l].systematics = 0;
                })

            }
        }
    }
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
    usersInfo[editingUserNum].Achievements[editingAchNum].status = 'Изменено'
    $('#Ach_' + editingUserNum + '_' + editingAchNum).text(achievement)
    $('#Chars_' + editingUserNum + '_' + editingAchNum).text(chars)
    str = ''
    for (var k = 0; k < chars.length; k++)
    {
        if (k != 0) str += '; '
        str += chars[k]
    }
    $('#Chars_' + editingUserNum + '_' + editingAchNum).text(str)

    if (usersInfo[editingUserNum].Achievements[editingAchNum].crit == '6 (9а)' || usersInfo[editingUserNum].Achievements[editingAchNum].crit == '10 (10в)'
        || usersInfo[editingUserNum].Achievements[editingAchNum].crit == '12 (11б)'  ) {
        usersInfo[editingUserNum].Achievements[editingAchNum].systematics = getSystematicsCoeff(usersInfo[editingUserNum].Achievements[editingAchNum])
    }

}

function Comment (button, i, j) {
  let id = button.value
  let comment = document.getElementById(id).value
  $.post('/comment', { Id: id, comment:comment}).done(() => {
      $('#' + id).addClass("commentSended");
  })

}

function ToggleHide(id) {
    $.post('/toggleHide', {id: id}).done(() => {
    })

}


var IsInRating = []
var usersInfo

function getUsers () {
  var xhr = new XMLHttpRequest()
  if (isProcessedPage)  xhr.open('GET', '/checked', true)
  else xhr.open('GET', '/getUsersForAdmin', true)

  xhr.onload = function () {
    let data = JSON.parse(xhr.responseText)
      let infoBuf = usersInfo
      if (infoBuf) for (user of infoBuf)
      {
          for (ach of user.Achievements)
              ach.systematics = undefined;
      }
      console.log(JSON.stringify(data.Info) == JSON.stringify(infoBuf))
      if (JSON.stringify(data.Info) == JSON.stringify(infoBuf)) {registerForUpdate(); return false}
      usersInfo = data.Info
    let qq = ''
      for (let i = 0; i < data.Info.length; i++) {
          IsInRating[i] = data.Info[i].IsInRating


          qq += '<div id="BL' + i + '"><div class="name"><div style="width: 100%; text-align: center" class="input-group" id="H' + i + '"><div class ="nameHeader ' + (isProcessedPage ? 'inRating' : '') + '" style="text-align: center;"><i id="IC' + i + '" class="fas fa-chevron-' + (data.Info[i].IsHiddenInRating ? 'right' : 'down') + ' mychevron"></i></div><h3 class="form-control nameHeader ' + (isProcessedPage ? 'inRating' : '') + '" style="border: 0; box-shadow: none">' + data.Info[i].user + '</h3><div class="input-group-append" ><button type="button" onclick="ToggleRating(this, ' + i + ')" value="' + data.Info[i].Id + '" class="btn btn-dark btn-xs" style="font-size: x-small; margin-right: 0px; border-radius: 0px">' + (data.Info[i].IsInRating ? 'Убрать из рейтинга' : 'Добавить в рейтинг') + '</button></div></div><div id="SH' + i + '"></div><div class="cover"></div><block style="display: ' + (data.Info[i].IsHiddenInRating ? 'none' : 'block') + ';overflow: auto;">'
          qq += '<table class="table"><thead><th class="table-bordered">Крит.</th><th class="table-bordered">Достижение</th><th class="table-bordered">Хар-ки</th><th class="table-bordered">Дата</th><th class="table-bordered">Статус</th><th>Комментарий</th><th></th></thead><tbody>'
          for (var j = 0; j < data.Info[i].Achievements.length; j++) {
              if (data.Info[i].Achievements[j].crit == '6 (9а)') data.Info[i].Achievements[j].systematics = getSystematicsCoeff(data.Info[i].Achievements[j])
              qq += '<tr id="TR'+i+'_'+j+'" ' + 'class="' + ((data.Info[i].Achievements[j].status == 'Принято' || data.Info[i].Achievements[j].status == 'Принято с изменениями') ? 'table-success' : '')  +
                  (data.Info[i].Achievements[j].status == 'Отказано' ? 'table-danger' : '')  + (data.Info[i].Achievements[j].status == 'Изменено' ? 'table-warning' : '') +
                  '"><td class="table-bordered" style="vertical-align: middle"width="5%"><span id="Crit_'+i+'_'+j+'">'+ data.Info[i].Achievements[j].crit+ '</span></td>';
              qq += '<td class="table-bordered" style="vertical-align: middle" ><span id="Ach_'+i+'_'+j+'">'+ data.Info[i].Achievements[j].achievement +'</span></td>';
              qq += '<td class="table-bordered" style="vertical-align: middle" width="24%"><span id="Chars_'+i+'_'+j+'">'+ data.Info[i].Achievements[j].chars +'</td>';
              qq += '<td class="table-bordered" style="vertical-align: middle" width="8%">'+ (data.Info[i].Achievements[j].achDate ? getDate(data.Info[i].Achievements[j].achDate) : '') +'</td>'
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


      if (qq == "") qq = '<div style="display: flex; justify-content: center"><h4>Заявок нет</h4></div>'
      document.getElementById('users').innerHTML = qq

      $('#panel').fadeIn(60);
      for (let i = 0; i < data.Info.length; i++) {
          if ($('#BL' + i).height() > 650) {
              $('#SH' + i).addClass('shadow')
              $('#H' + i).addClass('sticky')
          }
      }
      $('.mychevron').click(function () {
          var id = $(this).attr('id').slice(2)
          id = Number.parseInt(id)

          if (!$(this).parent().parent().parent().find('block').is(':visible')) {
              $(this).removeClass('fa-chevron-right')
              $(this).addClass('fa-chevron-down')
              $(this).parent().parent().parent().find('block').show(200)
          }
          else {
              $(this).parent().parent().parent().find('block').hide(200)
              $(this).removeClass('fa-chevron-down')
              $(this).addClass('fa-chevron-right')
          }
          data.Info[id].IsHiddenInRating = !data.Info[id].IsHiddenInRating
          ToggleHide(data.Info[id].Id)
      })
      registerForUpdate()
  }


    xhr.send()
};

function registerForUpdate(){
    var xhr = new XMLHttpRequest()
    xhr.open('GET', '/waitForUpdates', true)
    xhr.onload = () => {
        console.log('UPDATE')
        getUsers()
    }

    xhr.onerror = () => {xhr.open('GET', '/waitForUpdates', true); setTimeout(()=>{xhr.send()}, 5000)}
    xhr.send()
}

function getDate(d) {
    if (!d) return undefined
    d = new Date(d)
    return (d.getDate()> 9 ? d.getDate() : '0' + d.getDate())  + "." + ((d.getMonth()+1) > 9 ? (d.getMonth()+1) : '0' + (d.getMonth()+1)) + "." + d.getFullYear();
}

getUsers()

function getSystematicsCoeff(a) {
    if (a.status == 'Отказано') return 0
    if (a.crit == '6 (9а)') {
        if ((a.chars[0] == 'Проведение (обеспечение проведения) деятельности, направленной на помощь людям (в том числе социального и правозащитного характера) (11)'
            || a == 'Проведение (обеспечение проведения) деятельности природоохранного характера (12)')) {
            return 2
        }
        else if ((a.chars[1] == 'На международном уровне' // Опасно
            || a.chars[1] == 'На уровне СНГ'
            || a.chars[1] == 'На всероссийском уровне'
            || a.chars[1] == 'На уровне федерального округа') && !(a.chars[3] == 'Волонтер'
            || a.chars[3] == 'Участник')) {
            return 2
        }
        else return 1
    } else return 1

}