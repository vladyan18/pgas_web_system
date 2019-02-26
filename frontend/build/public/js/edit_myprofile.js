
function getInfo() {
    var xhr = new XMLHttpRequest()
    xhr.open('GET', '/getUserInfo', true)
    xhr.onload = function () {
        let data = JSON.parse(xhr.responseText)
        user = data;
        $('#lastname').val(data.LastName);
        $('#name').val(data.FirstName);
        $('#patronymic').val(data.Patronymic);
        $('#date').val(getDate(data.Birthdate));
        $('#faculty').val(data.Faculty);
        $('#type').val(data.Type);
        $('#course').val(data.Course);
    }
    xhr.send()
}

function cancel() {
    $(location).attr('href','/profile')
}

function save() {
    var res = {}


    if (!validator.form()) return false

    res.lastname = $('#lastname').val();
    res.name = $('#name').val();
    res.patronymic = $('#patronymic').val();
    res.faculty = $('#faculty').val();
    res.course = $('#course').val();
    res.type = $('#type').val();
    let bdate = $('#date').val().split('.')
    res.birthdate = new Date(bdate[2]+'-'+bdate[1]+'-'+bdate[0])


    var oReq = new XMLHttpRequest()
    oReq.open('POST', '/registerUser', true)
    oReq.setRequestHeader('Content-type', 'application/json; charset=utf-8');
    oReq.onload = function (oEvent) {
        if (oReq.status === 200) {
            $(location).attr('href','/profile')
        }
        else {
            console.log(
                'Error ' + oReq.status + ' occurred when trying to edit profile.'
            )
        }
    }
    oReq.send(JSON.stringify(res))
}

function getDate(d) {
    if (!d) return undefined
    d = new Date(d)
    return (d.getDate()> 9 ? d.getDate() : '0' + d.getDate())  + "." + ((d.getMonth()+1) > 9 ? (d.getMonth()+1) : '0' + (d.getMonth()+1)) + "." + d.getFullYear();
}

getInfo()

