
var validator;

$(document).ready(function() {
    validator = $('#register').validate({
        rules: {
            course: {
                course: {
                    otherprop: "type"
                },
                number : {}
            },
            date: {
                date : {}
            },
        },
    });


    $.validator.addMethod("course", function(value, element, params) {
        type = $('#'+params['otherprop']).val()
        if (type == 'Бакалавриат')
            return (value > 0) && (value < 5)
        else if (type == 'Специалитет')
            return (value > 0) && (value < 7)
        else if (type == 'Магистратура')
            return (value > 0) && (value < 3)
        },
        "<span style='color:#FF0000'>Неправильный курс</span>")

    $.validator.addMethod("required", function(value, element) {
            if (value) return true
        else return false
        },
        "<span style='color:#FF0000'>Обязательное поле</span>")

    $.validator.addMethod("date", function(value, element) {
            return /\d{2}.\d{2}.\d{4}/.test(value)
        },
        "<span style='color:#FF0000'>Неправильная дата</span>")

    $.validator.addMethod("number", function(value, element) {
        console.log(value, Number.isInteger(parseInt(value)))
        return isInt(value)
        },
        "<span style='color:#FF0000'>Пожалуйста, введите номер курса</span>")

});

function register() {
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

function isInt(value) {
    return !isNaN(value) && (function(x) { return (x | 0) === x; })(parseFloat(value))
}