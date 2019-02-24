function register() {
    var res = {}
    res.lastname = $('#lastname').val();
    res.name = $('#name').val();
    res.patronymic = $('#patronymic').val();
    res.faculty = $('#faculty').val();
    res.course = $('#course').val();
    res.type = $('#type').val();
    res.birthdate = $('#date').val();

    if (!res.lastname || !res.name || !res.patronymic || !res.faculty || !res.course || !res.type || !res.birthdate)

        return false;
    if (res.course < 1 || res.course > 6) return false;

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