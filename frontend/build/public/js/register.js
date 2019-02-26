
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
            console.log('TEST')
            r = /\d{2}.\d{2}.\d{4}/.test(value);
            if (r) r = r && (makeDate(value) < new Date ('2015-01-01')) && (makeDate(value) > new Date ('1900-01-01'))

            return r
        },
        "<span style='color:#FF0000'>Неправильная дата</span>")

    $.validator.addMethod("number", function(value, element) {
        console.log(value, Number.isInteger(parseInt(value)))
        return isInt(value)
        },
        "<span style='color:#FF0000'>Пожалуйста, введите номер курса</span>")

    $('#date').on("keyup", function(e) {
        if(!(e.which == 8))
         formatDate( $(e.target) )
    });
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

function makeDate(d) {
    if (!d) return undefined
    let date = d.split('.')
    return new Date(date[2] + '-' + date[1] + '-' + date[0])
}

function formatDate(el) {
    var value = el.val()
    el.val(value)

    var input = value;
    if (/\D\/$/.test(input)) input = input.substr(0, input.length - 3);
    var values = input.split('.').map(function (v) {
        return v.replace(/\D/g, '')
    });
    if (values[0]) values[0] = checkValue(values[0], 31);
    if (values[1]) values[1] = checkValue(values[1], 12);
    var output = values.map(function (v, i) {
        return v.length == 2 && i < 2 ? v + '.' : v;
    });
    el.val(output.join('').substr(0, 14))

}

function checkValue(str, max) {
    if (str.charAt(0) !== '0' || str == '00') {
        var num = parseInt(str);
        if (isNaN(num) || num <= 0 || num > max) num = 1;
        str = num > parseInt(max.toString().charAt(0)) && num.toString().length == 1 ? '0' + num : num.toString();
    };
    return str;
};

