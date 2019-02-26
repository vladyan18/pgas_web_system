var achId

function getAch() {
    let url = window.location.href
    let ip = url.slice(url.indexOf('achievement/') + 12).slice(0,24)
    achId = ip
    var xhr = new XMLHttpRequest()
    xhr.open('GET', '/getAch/?achievement=' + ip, true)

    xhr.onload = function () {
        let data = JSON.parse(xhr.responseText)

        document.getElementById('comment').value = data.achievement;

        k = kritSelector
        k.val(data.crit).change();

        for (ch of data.chars) {
            k = createdKrits[createdKrits.length - 1]
            k.val(ch).change()

        }

        if (data.SZ) {
            $("#szBox").attr('checked', true).change();
            $('#szNum').val(data.SZ['Num'])
            $('#szDate').val(getDate(data.SZ['Date']))
            $('#szPril').val(data.SZ['Pril'])
            $('#szPunkt').val(data.SZ['Punkt'])
        }

        if (kritSelector.val() != '1 (7а)'){
            $('#Date').val(getDate(data.achDate)).change()
        }
    }
    xhr.send()


}

function editCrit() {
    a = validator.form()
    b = textValidator.form()
    c = critValidator.form()
    if (!a || !b || !c) return false;
    if (!confirm('Вы уверены? Если достижение было принято, после изменения снова потребуется проверка.')) return false;

    var res = {}
    res.type = $('#check1').val();
    res.crit = $('#check2').val();
    res.chars = [];

    // получение списка характеристик
    if (kritSelector.kritChild)
        getChars(kritSelector.kritChild, res.chars);

    res.achDate = makeDate($("#Date").val());
    if (hasSZ) {
        res.SZ = {}
        res.SZ['Date'] = makeDate($('#szDate').val());
        res.SZ['Num'] = $('#szNum').val();
        res.SZ['Pril'] = $('#szPril').val();
        res.SZ['Punkt'] = $('#szPunkt').val();
    }

    res.achievement = $('#comment').val()
    res.status = 'Ожидает проверки'
    var form = document.forms.namedItem('fileinfo')
    var oData = new FormData(form)
    oData.append('data', JSON.stringify(res))
    oData.append('achId', achId)
    var oReq = new XMLHttpRequest()
    oReq.open('POST', '/update_achieve', true)
    oReq.onload = function (oEvent) {
        if (oReq.status === 200) {
            $(location).attr('href','/home')
        }
        else {
            console.log(
                'Error ' + oReq.status + ' occurred when trying to upload your file.'
            )
        }
    }
    oReq.send(oData)
}

function getDate(d) {
    if (!d) return undefined
    d = new Date(d)
    return (d.getDate()> 9 ? d.getDate() : '0' + d.getDate())  + "." + ((d.getMonth()+1) > 9 ? (d.getMonth()+1) : '0' + (d.getMonth()+1)) + "." + d.getFullYear();
}

getAch()