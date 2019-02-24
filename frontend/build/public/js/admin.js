function Success (button) {
  let id = button.value
  $.post('/AchSuccess', { Id: id })
}

function Failed (button) {
  let id = button.value
  $.post('/AchFailed', { Id: id })
}

function getUsers () {
  var xhr = new XMLHttpRequest()

  xhr.open('GET', '/getUsersForAdmin', true)

  xhr.onload = function () {
    let data = JSON.parse(xhr.responseText)
    console.log(data)
    let qq = ''
    for (let i = 0; i < data.Info.length; ++i) {
      qq += '<div class="name"><h3>' + data.Info[i].user + '</h3><block>'
      qq += '<table class="table"><thead><th>Критерий</th><th>Достижение</th><th>Комментарий</th><th></th><th></th><th></th></thead><tbody>'
      for (let j = 0; j < data.Info[i].Achievements.length; ++j) {
        qq += '<tr id="TR " style="cursor: pointer"><td>'+ data.Info[i].Achievements[j]+ '</td>';
        qq += '<td></td>';
        qq += '<td>'+ data.Info[i].AchTexts[j] +'</td>';
        qq += '<td><button type="button" onclick="Success(this)" value="' + data.Info[i].AchId[j] + '" class="btn btn-success btn-sm">Принять</button></td>'
        qq += '<td><button type="button" onclick="Failed(this)" value="' + data.Info[i].AchId[j] + '" class="btn btn-danger btn-sm">Отклонить</button></td>'
        qq += '<td> <form action="achievement/' + data.Info[i].AchId[j] + '" method="get"><button type="submit" onclick="Change(this)" value="' + data.Info[i].AchId[j] + '" class="btn btn-warning btn-sm">Изменить</button></form></td>'
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