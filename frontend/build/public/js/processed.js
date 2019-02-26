function Success (button) {
  let id = button.value
  $.post('/AchSuccess', { Id: id,comment : comment})
}

function Failed (button) {
  let id = button.value
  $.post('/AchFailed', { Id: id})
}

function Comment (button) {
  let id = button.value
  let comment = document.getElementById(id).value
  $.post('/comment', { Id: id, comment:comment})
}

function getUsers () {
  var xhr = new XMLHttpRequest()

  xhr.open('GET', '/checked', true)

  xhr.onload = function () {
    let data = JSON.parse(xhr.responseText)
    let qq = ''
    for (let i = 0; i < data.Info.length; ++i) {
      qq += '<div class="name"><h3>' + data.Info[i].user + '</h3><block><p><a href="/user/' + data.Info[i].Id + '" class="goto">Перейти к профилю</a></p>'
      qq += '<table class="table"><thead><th>Критерий</th><th>Достижение</th><th>Статус</th><th>Балл</th><th>Комментарий</th><th></th></thead><tbody>'
      for (let j = 0; j < data.Info[i].Achievements.length; ++j) {
        if(data.Info[i].Status[j] === 'Отказано'){
          qq += '<tr id="TR " style="cursor: pointer" bgcolor="#ffa29c">'
        }
        if(data.Info[i].Status[j] === 'Принято'){
          qq += '<tr id="TR " style="cursor: pointer" bgcolor="#b5ff8c">'
        }
        if(data.Info[i].Status[j] === 'Изменено'){
          qq += '<tr id="TR " style="cursor: pointer" bgcolor="#fff77b">'
        }
        if(data.Info[i].Status[j] === 'Принято с изменениями'){
          qq += '<tr id="TR " style="cursor: pointer" bgcolor="#73ebff">'
        }
        qq += '<td>'+ data.Info[i].Achievements[j]+ '</td>'
        qq += '<td>' + data.Info[i].AchTexts[j] + '</td>'
        qq += '<td>'+ data.Info[i].Status[j] +'</td>'
        qq += '<td>'+ (data.Info[i].Ball[j] ?  data.Info[i].Ball[j] : '-')+ '</td>'
        qq += '<td>'+ (data.Info[i].Comment[j] ? data.Info[i].Comment[j] : '') +'</td>'
        qq += '<td><ul><form action="/achievement/' + data.Info[i].AchId[j] + '" method="get">'
        qq += '<li><textarea cols=50  placeholder="Введите комментарий..."  id="'+ data.Info[i].AchId[j] + '" ></textarea></li>'
        qq += '<li>&#160;&#160;&#160;&#160;<button type="button" onclick="Success(this)" value="' + data.Info[i].AchId[j] + '" class="btn btn-success btn-sm">Принять</button>&#160;&#160;'
        qq += '<button type="button" onclick="Failed(this)" value="' + data.Info[i].AchId[j] + '" class="btn btn-danger btn-sm">Отклонить</button>&#160;&#160;'
        qq += '<button type="submit" value="' + data.Info[i].AchId[j] + '" class="btn btn-warning btn-sm">Изменить</button>&#160;&#160;'
        qq +=  '<button type="button" onclick="Comment(this)" value="' + data.Info[i].AchId[j] + '" class="btn btn-dark btn-sm">Отправить</button></li>'
        qq += '</form></ul></td>'
        qq += '</tr>'
      }
      qq += '</tbody></table></block></div>'
    }
    document.getElementById('users').innerHTML = qq

    $('.name h3').click(function () {
      if (!$(this).parent().find('block').is(':visible')) {
        $(this).parent().find('block').show(200)
      }
      else {
        $(this).parent().find('block').hide(200)
      }
    })
  }
  xhr.send()
};

getUsers()
