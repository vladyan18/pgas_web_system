
function getAcievement () {
  var xhr = new XMLHttpRequest()

  xhr.open('GET', '/getUserInfo', true)

  xhr.onload = function () {
    let data = JSON.parse(xhr.responseText)
    document.getElementById('username').innerHTML = data.LastName + ' ' + data.FirstName
    let qq = ''
    let k = data.Achs.length
    for (let i = 0; i < k; ++i) {
      if (data.Achs[i].status !== 'Ожидает проверки') {
        continue
      }
      qq += '<div class="name"> <h4>' + data.Achs[i].date + '</h4> <block_2>'
      for (let j of data.Achs[i].files) {
        qq += '<p><a target="_blank" rel="noopener noreferrer" href="' + '/uploads/' + j + '" class="goto">Подтверждающий документ</a></p>'
      }
      qq += '<p>Критерий: <criteria class="info">' + data.Achs[i].crit+ '</criteria></p><p>Статус: <status class="info">' + data.Achs[i].status + '</status></p> </block_2> </div>'
    }
    document.getElementById('row_docs').innerHTML = qq
    qq = ''
    for (let i = 0; i < k; ++i) {
      if (data.Achs[i].Status === 'Ожидает проверки') {
        continue
      }
      qq += '<div class="name"> <h4>' + data.Achs[i].date + '</h4> <block_2>'
      for (let j of data.Achs[i].files) {
        qq += '<p><a target="_blank" rel="noopener noreferrer" href="' + '/uploads/' + j + '" class="goto">Подтверждающий документ</a></p>'
      }
      qq += '<p>Критерий: <criteria class="info">' + data.Achs[i].crit+ '</criteria></p><p>Статус: <status class="info">' + data.Achs[i].status + '</status></p> </block_2> </div>'
    }


    document.getElementById('archive_docs').innerHTML = qq
    $('.name h4').click(function () {
      if (!$(this).parent().find('block_2').is(':visible')) {
        $(this).parent().find('block_2').show(200)
      }
      else {
        $(this).parent().find('block_2').hide(200)
      }
    })
  }
  $('.category h3').click(function () {
    if (!$(this).parent().find('block_1').is(':visible')) {
      $(this).parent().find('block_1').show(200)
    }
    else {
      $(this).parent().find('block_1').hide(200)
    }
  })
  xhr.send()
};

getAcievement()
