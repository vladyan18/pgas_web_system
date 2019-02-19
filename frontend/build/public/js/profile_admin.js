function getUsers () {
  var xhr = new XMLHttpRequest()
  let url = window.location.href
  let ip = url.slice(url.indexOf('user/') + 5)

  xhr.open('GET', '/user=' + ip, true)

  xhr.onload = function () {
    let data = JSON.parse(xhr.responseText)
    let qq = '<p class="headline">' + data.LastName + ' ' + data.FirstName + ' ' + data.Patronymic + '</p><hr class="hr_blue"><div class="profile"><div>Факультет: <faculty class="info">' + data.Faculty + '</faculty></div>'
    qq += '<div>Курс: <course class="info">' + data.Course + '</course></div><div>Средний балл: <ave_ball class="info">' + data.AverageMark + '</ave_ball></div></div><p class="headline">Текущие достижения</p><hr class="hr_blue">'
    for (let i = 0; i < data.Achs.length; ++i) {
      qq += '<div class="name"><h3>' + data.Achs[i].Date + '</h3><block>'
      for (let j of data.Achs[i].Files) {
        qq += '<p><a  href="' + '/uploads/' + j + '" class="goto">Подтверждающий документ</a></p>'
      }
      qq += '<p>Критерий: <criteria class="info">' + data.Achs[i].Crit + '</criteria></p><p>Описание: <desc class="info">' + data.Achs[i].Popisal + '</desc></p><p>Статус: <status class="info">' + data.Achs[i].Status + '</status></p></block></div>'
    }
    document.getElementById('info').innerHTML = qq

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
