
function getUsers () {
  var xhr = new XMLHttpRequest()

  xhr.open('GET', '/checked', true)

  xhr.onload = function () {
    let data = JSON.parse(xhr.responseText)
    let qq = ''
    for (let i = 0; i < data.Info.length; ++i) {
      for (let j = 0; j < data.Info[i].Achievements.length; ++j) {
        qq += '<div class="name"><h3>' + data.Info[i].user + '</h3><block><p><a href="/user/' + data.Info[i].Id + '" class="goto">Перейти к профилю</a></p>'
        qq += '<br><p>Критерий: <criteria>' + data.Info[i].Achievements[j] + '</criteria></p>'
        qq += '<div>Описание: <desc>' + data.Info[i].Comments[j] + '</desc></div>'
        qq += '<p>Статус: <status class="info">' + data.Info[i].Status[j] + '</status></p></block></div>'
      }
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
