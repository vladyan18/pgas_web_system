function getUsers () {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', '/getRating', true);

  xhr.onload = function () {
      let data = JSON.parse(xhr.responseText);
      let qq = '';
      let Users = data.Users;
    Users.sort(function(obj1, obj2) {
      diff = obj2.Ball-obj1.Ball;
      if (diff != 0)
        return obj2.Ball-obj1.Ball;
      else {
          for (crit of Object.keys(obj1.Crits)) {
              diff = obj2.Crits[crit] - obj1.Crits[crit];
              if (diff != 0) return diff
          }
          return 0
      }
    });

      let i = 0;
    for (let user of Users) {
        i++;
        qq += '<tr><td style="text-align: center"><b>' + i + '</b></td><td style="vertical-align: middle"><a target="_blank" style="color: black" href="user/' + user._id + '">' + user.Name + '</a></td><td style="vertical-align: middle">' + user.Type + '</td><td style="text-align: center; vertical-align: middle">' + user.Course + '</td>';
        for (crit of Object.keys(user.Crits)) {
          qq += '<td style="text-align: center; vertical-align: middle">' + user.Crits[crit] + '</td>'
        }
      qq +=  '<td style="text-align: center;vertical-align: middle"><b>' + user.Ball + '</b></td></tr>'
    }
      document.getElementById('usersTable').innerHTML = qq;

      $('#panel').fadeIn(60);
    registerForUpdate()
  };
  xhr.send()
}
function registerForUpdate(){
    var xhr = new XMLHttpRequest();
    xhr.open('GET', '/waitForUpdates', true);
    xhr.onload = () => {
        console.log('UPDATE');
        getUsers()
    };

    xhr.onerror = () => {
        xhr.open('GET', '/waitForUpdates', true);
        setTimeout(() => {
            xhr.send()
        }, 5000)
    };
    xhr.send()
}

getUsers();
