function setUser (button) {
    let id = button.value;
    $.post('/setUser', { Id: id })
  }
  
  function setAdmin (button) {
      let id = button.value;
    $.post('/setAdmin', { Id: id })
  }
  


function getAdmins () {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', '/getAdmins', true);
  
    xhr.onload = function () {
        let data = JSON.parse(xhr.responseText);
        let qq = '';
        console.log(data);
        let Users = data.Users;
      Users.sort(function(obj1, obj2) {
        return obj2.Ball-obj1.Ball;
      });
      for (let user of Users) {
        if(user.Role === 'Admin'){
            qq += '<tr><td class="name">' + user.Name + '</td><td class="ball">' + user.Role + '</td><td><button type="button" onclick="setUser(this)" value="' + user.Id + '" class="btn btn-info btn-sm">Изменить роль на User</button></td></tr>'
        }
          if (user.Role === 'SuperAdmin') {
              qq += '<tr><td class="name">' + user.Name + '</td><td class="ball">' + user.Role + '</td><td></td></tr>'
          }
        if(user.Role === 'User'){
            qq += '<tr><td class="name">' + user.Name + '</td><td class="ball">' + user.Role + '</td><td><button type="button" onclick="setAdmin(this)" value="' + user.Id + '" class="btn btn-info btn-sm">Изменить роль на Admin</button></td></tr>'
        }
    }
      document.getElementById('users').innerHTML = qq
    };
    xhr.send()
}

getAdmins();
  