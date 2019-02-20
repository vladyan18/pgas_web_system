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
      qq += '<tr><td class="name">' + user.Name + '</td><td class="ball">' + user.Ball + '</td></tr>'
    }
    document.getElementById('users').innerHTML = qq
  }
  xhr.send()
};

getUsers()
