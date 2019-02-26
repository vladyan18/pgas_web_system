function getUsers () {
  var xhr = new XMLHttpRequest()
  xhr.open('GET', '/getRating', true)

  xhr.onload = function () {
    let data = JSON.parse(xhr.responseText)
    let qq = ''
    let Users = data.Users
    Users.sort(function(obj1, obj2) {
      return obj2.Ball-obj1.Ball;
    });
    for (let user of Users) {
      qq += '<tr><td style="vertical-align: middle">' + user.Name + '</td><td style="vertical-align: middle">'+ user.Type + '</td><td style="text-align: center; vertical-align: middle">' + user.Course + '</td>'
        for (crit of Object.keys(user.Crits)) {
          qq += '<td style="text-align: center; vertical-align: middle">' + user.Crits[crit] + '</td>'
        }
      qq +=  '<td style="text-align: center;vertical-align: middle"><b>' + user.Ball + '</b></td></tr>'
    }
    document.getElementById('usersTable').innerHTML = qq
  }
  xhr.send()
};

getUsers()
