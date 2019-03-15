
function getAcievement () {
    var xhr = new XMLHttpRequest();

    xhr.open('GET', '/getUserInfo', true);

  xhr.onload = function () {
      let data = JSON.parse(xhr.responseText);
      document.getElementById('username').innerHTML = data.LastName + ' ' + data.FirstName + ' ' + data.Patronymic + (data.IsInRating ? '<svg style="float: right" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="green"><path d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z"/></svg>' : '');
      document.getElementById('faculty').innerHTML = data.Faculty;
      document.getElementById('course').innerHTML = data.Course;

      let qq = "";
    //if ($('#achBlock').width() < 100)
    //     qq = '<table class="table table-sm">'
      qq = '<table class="table">';

      qq += '<thead><th>Критерий</th><th>Достижение</th><th style="text-align: center">Статус</th><th style="text-align: center">Балл</th><th>Комментарий</th></thead><tbody>';
    let k = data.Achs.length;
    if (k > 1)
    data.Achs = data.Achs.sort(function(obj1, obj2) {
        return Number.parseInt(obj1.crit.substr(0,2)) > Number.parseInt(obj2.crit.substr(0,2))
    });

    for (let i = 0; i < k; ++i) {
        if (!data.Achs[i]) continue;
        qq += '<tr id="TR' + i + '" style="cursor: pointer"><td>'+ data.Achs[i].crit+ '</td>';
        qq += '<td>'+data.Achs[i].achievement+'</td>';
        if (data.Achs[i].status == 'Изменено')
            qq += '<td class="table-warning" style="text-align: center">'+ data.Achs[i].status +'</td>';
        else if (data.Achs[i].status == 'Принято' || data.Achs[i].status == 'Принято с изменениями')
            qq += '<td class="table-success" style="text-align: center">'+ data.Achs[i].status +'</td>';
        else if (data.Achs[i].status == 'Отказано')
            qq += '<td class="table-danger" style="text-align: center">'+ data.Achs[i].status +'</td>';
        else qq += '<td style="text-align: center">'+ data.Achs[i].status +'</td>';
        qq += '<td style="text-align: center">' + (data.Achs[i].ball !== null ? data.Achs[i].ball : '-') + '</td>';
        qq += '<td>'+ (data.Achs[i].comment ? data.Achs[i].comment : '') +'</td>';
        //qq += '<td>'

      //for (let j of data.Achs[i].files) {
      //  qq += '<p><a target="_blank" rel="noopener noreferrer" href="' + '/uploads/' + j + '" class="goto">Документ</a></p>'
      //}
      qq += '</tr>'
    }
      qq += '</tbody></table>';
    document.getElementById('row_docs').innerHTML = qq;
      $('#panel').fadeIn(60);

      for (let i = 0; i < k; ++i) {
          if (!data.Achs[i]) continue;
          var a = document.getElementById('TR'+i);
          a.onclick = function () {
              editAch(data.Achs[i]._id.toString())
          }
      }


      qq = '';
    for (let i = 0; i < k; ++i) {
        if (!data.Achs[i]) continue;
      if (data.Achs[i].Status === 'Ожидает проверки') {
        continue
      }
        qq += '<div class="name"> <h4>' + data.Achs[i].date + '</h4> <block_2>';
      for (let j of data.Achs[i].files) {
        qq += '<p><a target="_blank" rel="noopener noreferrer" href="' + '/uploads/' + j + '" class="goto">Подтверждающий документ</a></p>'
      }
      qq += '<p>Критерий: <criteria class="info">' + data.Achs[i].crit+ '</criteria></p><p>Статус: <status class="info">' + data.Achs[i].status + '</status></p> </block_2> </div>'
    }


      document.getElementById('archive_docs').innerHTML = qq;
    $('.name h4').click(function () {
      if (!$(this).parent().find('block_2').is(':visible')) {
        $(this).parent().find('block_2').show(200)
      }
      else {
        $(this).parent().find('block_2').hide(200)
      }
    })
  };
      $('.category h3').click(function () {
    if (!$(this).parent().find('block_1').is(':visible')) {
      $(this).parent().find('block_1').show(200)
    }
    else {
      $(this).parent().find('block_1').hide(200)
    }
      });
  xhr.send()
}
function editAch(id)
{
    $(location).attr('href','/achievement/' + id)
}

getAcievement();
