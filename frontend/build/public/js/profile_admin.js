function getUser() {
    var xhr = new XMLHttpRequest();
    let url = window.location.href;
    let ip = url.slice(url.indexOf('user/') + 5);

    xhr.open('GET', '/user=' + ip, true);

  xhr.onload = function () {
      let data = JSON.parse(xhr.responseText);
      let qq = '<p class="headline">' + data.LastName + ' ' + data.FirstName + (data.Patronymic ? ' ' + data.Patronymic : '') + '</p><hr class="hr_blue"><div class="profile"><div>Факультет: <faculty class="info">ПМ-ПУ</faculty></div>';
      qq += '</div><p class="headline">Текущие достижения</p>';
      qq += '<table class="table">';

      qq += '<thead class="thead-dark"><th>Критерий</th><th>Достижение</th><th>Хар-ки</th><th style="text-align: center">Статус</th><th style="text-align: center">Балл</th><th>Комментарий</th></thead><tbody>';
      let k = data.Achs.length;
      if (k > 1)
          data.Achs = data.Achs.sort(function (obj1, obj2) {
              return Number.parseInt(obj1.crit.substr(0, 2)) > Number.parseInt(obj2.crit.substr(0, 2))
          });

      for (let i = 0; i < k; ++i) {
          if (!data.Achs[i]) continue;
          qq += '<tr id="TR' + i + '"><td>' + data.Achs[i].crit + '</td>';
          qq += '<td>' + data.Achs[i].achievement + '</td>';
          qq += '<td>' + data.Achs[i].chars + '</td>';
          if (data.Achs[i].status == 'Изменено')
              qq += '<td class="table-warning" style="text-align: center">' + data.Achs[i].status + '</td>';
          else if (data.Achs[i].status == 'Принято' || data.Achs[i].status == 'Принято с изменениями')
              qq += '<td class="table-success" style="text-align: center">' + data.Achs[i].status + '</td>';
          else if (data.Achs[i].status == 'Отказано')
              qq += '<td class="table-danger" style="text-align: center">' + data.Achs[i].status + '</td>';
          else qq += '<td style="text-align: center">' + data.Achs[i].status + '</td>';
          qq += '<td style="text-align: center">' + (data.Achs[i].ball !== null ? data.Achs[i].ball : '-') + '</td>';
          qq += '<td>' + (data.Achs[i].comment ? data.Achs[i].comment : '') + '</td>';
          //qq += '<td>'

          //for (let j of data.Achs[i].files) {
          //  qq += '<p><a target="_blank" rel="noopener noreferrer" href="' + '/uploads/' + j + '" class="goto">Документ</a></p>'
          //}
          qq += '</tr>'
      }
      qq += '</tbody></table>';
      document.getElementById('info').innerHTML = qq;
      $('#panel').fadeIn(60);

  };
  xhr.send()
}

getUser();
