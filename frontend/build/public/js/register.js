function register() {
    var res = {}
    res.lastname = $('#lastname').val();
    res.name = $('#name').val();
    res.patronymic = $('#patronymic').val();
    res.faculty = $('#faculty').val();
    res.course = $('#course').val();
    res.type = $('#type').val();

    var oReq = new XMLHttpRequest()
    oReq.open('POST', '/registerUser', true)
    oReq.setRequestHeader('Content-type', 'application/json; charset=utf-8');
    oReq.onload = function (oEvent) {
        if (oReq.status === 200) {
            $(location).attr('href','/home')
        }
        else {
            console.log(
                'Error ' + oReq.status + ' occurred when trying to register.'
            )
        }
    }
    oReq.send(JSON.stringify(res))
    console.log(res)
}