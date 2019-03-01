function AddToRating (button, i) {
    let id = button.value
    $.post('/AddToRating', { Id: id})
    $('#H' + i).css('background-color', '#178e3c')
}

function Success (button, i, j) {
  let id = button.value
  $.post('/AchSuccess', { Id: id})
    $('#TR' + i + '_' + j).removeClass("table-danger");
    $('#TR' + i + '_' + j).removeClass("table-warning");
    $('#TR' + i + '_' + j).addClass("table-success");
    $('#Stat_'+i).innerText = 'Принято'
}

function Failed (button, i, j) {
  let id = button.value
  $.post('/AchFailed', { Id: id})
  $('#TR' + i + '_' + j).removeClass("table-success");
    $('#TR' + i + '_' + j).addClass("table-danger");
    $('#Stat_'+i).innerHTML = 'Отказано'
}

function Edit (button) {
    let id = button.value
    $(location).attr('href','/achievement/' + id)
}

function Comment (button, i, j) {
  let id = button.value
  let comment = document.getElementById(id).value
  $.post('/comment', { Id: id, comment:comment})
    $('#' + id).addClass("table-success");
}


function getUsers () {
  var xhr = new XMLHttpRequest()

  xhr.open('GET', '/getUsersForAdmin', true)

  xhr.onload = function () {
    let data = JSON.parse(xhr.responseText)
    console.log(data)
    let qq = ''
    for (let i = 0; i < data.Info.length; i++) {
      qq += '<div class="name"><h3 id="H'+i+'"style="display: flex; justify-content: space-between; '+ (data.Info[i].IsInRating ? 'background-color:#178e3c' : '') + '">' + data.Info[i].user + '<div style="margin-bottom: auto; margin-top: auto"><button type="button" onclick="AddToRating(this, '+i+')" value="' + data.Info[i].Id + '" class="btn btn-xs" style="font-size: x-small">'+(data.Info[i].IsInRating ? 'Убрать из рейтинга' : 'Добавить в рейтинг')+'</button></div></h3><block style="display: block">'
      qq += '<table class="table"><thead><th>Критерий</th><th>Достижение</th><th>Хар-ки</th><th>Статус</th><th>Комментарий</th><th></th></thead><tbody>'
      for (let j = 0; j < data.Info[i].Achievements.length; ++j) {
        qq += '<tr id="TR'+i+'_'+j+'" style="cursor: pointer;" ' + 'class="' + (data.Info[i].Statuses[j] == 'Принято' ? 'table-success' : '')  +
            (data.Info[i].Statuses[j] == 'Отказано' ? 'table-danger' : '')  + (data.Info[i].Statuses[j] == 'Изменено' ? 'table-warning' : '') +
              '"><td>'+ data.Info[i].Achievements[j]+ '</td>';
        qq += '<td>'+ data.Info[i].AchTexts[j] +'</td>';
        qq += '<td>'+ data.Info[i].Chars[j] +'</td>';
        qq += '<td id="Stat_'+j+'">'+ data.Info[i].Statuses[j] +'</td>';
        qq += '<td>'
        qq += '<textarea placeholder="Введите комментарий..." id="'+ data.Info[i].AchId[j] + '">'+ data.Info[i].Comments[j] +'</textarea>'
        qq +=  '<button type="button" onclick="Comment(this,'+i+' ,'+j+')" value="' + data.Info[i].AchId[j] + '" class="btn btn-dark btn-sm">Отправить</button>'
        qq += '</td>'
          qq += '<td>'
          qq += '<button type="button" onclick="Success(this,'+i+' , '+j+')" value="' + data.Info[i].AchId[j] + '" class="btn btn-success btn-sm">Принять</button>&#160;&#160;'
          qq += '<button type="button" onclick="Failed(this, '+i+' ,'+j+')" value="' + data.Info[i].AchId[j] + '" class="btn btn-danger btn-sm">Отклонить</button>&#160;&#160;'
          qq += '<button type="button" onclick="Edit(this)" value="' + data.Info[i].AchId[j] + '" class="btn btn-warning btn-sm">Изменить</button>&#160;&#160;'
          qq += '</td>'
        qq += '</tr>'
      }
      qq += '</tbody></table></block></div>'
    }
    document.getElementById('users').innerHTML = qq

   /* $('.name h3').click(function () {
      if (!$(this).parent().find('block').is(':visible')) {
        $(this).parent().find('block').show(200)
      }
      else {
        $(this).parent().find('block').hide(200)
      }
    })*/
  }

  xhr.send()
};

getUsers()