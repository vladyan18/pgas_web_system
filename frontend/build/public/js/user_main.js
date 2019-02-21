
function getAcievement () {
  var xhr = new XMLHttpRequest()

  xhr.open('GET', '/getUserInfo', true)

  xhr.onload = function () {
    let data = JSON.parse(xhr.responseText)
    document.getElementById('username').innerHTML = data.LastName + ' ' + data.FirstName + ' ' + data.Patronymic;
    document.getElementById('faculty').innerHTML = data.Faculty
    let qq = '<table class="table"><thead><th>Критерий</th><th>Достижение</th><th>Статус</th><th>Балл</th><th>Комментарий</th></thead><tbody>'
    let k = data.Achs.length;
    if (k > 1)
    data.Achs = data.Achs.sort(function (a, b) {
        if(!a || !b) return 0;
        if (a.crit > b.crit) {
            return 1;
        }
        if (a.crit < b.crit) {
            return -1;
        }
        // a должно быть равным b
        return 0;
    });

    for (let i = 0; i < k; ++i) {
      if (!data.Achs[i]) continue
        qq += '<tr id="TR' + i + '" style="cursor: pointer"><td>'+ data.Achs[i].crit+ '</td>';
        qq += '<td>'+data.Achs[i].achievement+'</td>';
        qq += '<td>'+ data.Achs[i].status +'</td>';
        qq += '<td>'+ (data.Achs[i].ball ?  data.Achs[i].ball : 0)+ '</td>';
        qq += '<td>'+ data.Achs[i].comment +'</td>';
        //qq += '<td>'

      //for (let j of data.Achs[i].files) {
      //  qq += '<p><a target="_blank" rel="noopener noreferrer" href="' + '/uploads/' + j + '" class="goto">Документ</a></p>'
      //}
      qq += '</tr>'
    }
    qq += '</tbody></table>'
    document.getElementById('row_docs').innerHTML = qq;

      for (let i = 0; i < k; ++i) {
          if (!data.Achs[i]) continue;
          var a = document.getElementById('TR'+i);
          a.onclick = function () {
              editAch(data.Achs[i]._id.toString())
          }
      }


    qq = ''
    for (let i = 0; i < k; ++i) {
        if (!data.Achs[i]) continue
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


function editAch(id)
{
    $(location).attr('href','/achievement/' + id)
}
getAcievement()
