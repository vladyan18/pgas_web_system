let xhr = new XMLHttpRequest()
xhr.open('GET', '/showMyNotes', true)
xhr.onload = function () {
    let alertWord = ''
    let data = JSON.parse(xhr.responseText)
    let MyNotes = ''
    let options = {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric'
      }
    let Now = new Date().toLocaleString('ru', options)
    let date = Now.split(',')[0]
    let time = Now.split(',')[1]
    let year = +date.split('.')[2]
    let month = +date.split('.')[1]
    let day = +date.split('.')[0]
    let hour = +time.split(':')[0]
    let minute = +time.split(':')[1]

    data.Notes.sort(function(a, b) {
        let Ayear = +a.Time.split('T')[0].split('-')[0]
        let Amonth= +a.Time.split('T')[0].split('-')[1]
        let Aday= +a.Time.split('T')[0].split('-')[2]
        let Ahour = +a.Time.split('T')[1].split(':')[0]
        let Aminute = +a.Time.split('T')[1].split(':')[1]
        let Byear = +b.Time.split('T')[0].split('-')[0]
        let Bmonth= +b.Time.split('T')[0].split('-')[1]
        let Bday= +b.Time.split('T')[0].split('-')[2]
        let Bhour = +b.Time.split('T')[1].split(':')[0]
        let Bminute = +b.Time.split('T')[1].split(':')[1]
        let Atime = Ayear*365*24*60 + Amonth*30*24*60 + Aday*24*60 + Ahour*60 + Aminute
        let Btime = Byear*365*24*60 + Bmonth*30*24*60 + Bday*24*60 + Bhour*60 + Bminute
        return Btime-Atime
    })

    for(note of data.Notes.reverse()){
        let notes = ''
        let important = (note.Important) ? "Важно" : "Не важно";
        let Nyear = +note.Time.split('T')[0].split('-')[0]
        let Nmonth= +note.Time.split('T')[0].split('-')[1]
        let Nday= +note.Time.split('T')[0].split('-')[2]
        let Nhour = +note.Time.split('T')[1].split(':')[0]
        let Nminute = +note.Time.split('T')[1].split(':')[1]
        notes +=  '<h2>' + note.Title + '</h2> <ul>'
        notes += '<li>'+ note.Text + '</li> </ul><br />'
        notes += Nday + '.' +  Nmonth + '.' + Nyear + ' ' + note.Time.split('T')[1] + '<br />' 
        notes += important + '<br />'
        if(note.Kind){
            notes += note.Kind + '<br />'
        }
        notes += '<button type="button"  class="btn btn-outline-danger btn-md white " onclick="deleteNote(value)"  value=\'' + JSON.stringify({"note" : note.Id }) + '\'>Удалить</button>'
        if(Nyear == year && Nmonth == month && Nday == day && (Nhour*60 + Nminute - ( hour*60 + minute) < 60) && (Nhour*60 + Nminute - ( hour*60 + minute)> 0)){
            notes = '<div class="yellow">' + notes + '</div>'
            alertWord += 'До события "' + note.Title + '" остался час\n'
        }else{
        if(Nyear < year || (Nyear == year && Nmonth < month) || (Nyear == year && Nmonth == month && Nday < day) ||  (Nyear == year && Nmonth == month && Nday == day && Nhour < hour) || (Nyear == year && Nmonth == month && Nday == day && Nhour == hour && Nminute <= minute)){
            alertWord += 'Событие "' + note.Title + '" закончилось\n'
            notes = '<div class="red">' + notes + '</div>'
        }
    }   
    MyNotes += notes 
    }
    document.getElementById('notes').innerHTML = MyNotes
    if(alertWord != ''){
    setTimeout(func, 100, alertWord)
}
}

xhr.send()

function deleteNote(note) {
    $.post('/deleteNote', JSON.parse(note))
    window.location.reload()
}

function func(phrase) {
    alert(phrase);
  }