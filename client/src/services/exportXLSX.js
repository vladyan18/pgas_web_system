import React from 'react';
import XLSX from 'xlsx'
let FileSaver = require('file-saver')

function s2ab (s) {
    let buf = new ArrayBuffer(s.length)
    let view = new Uint8Array(buf)
    for (let i = 0; i != s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF
    return buf
}

function fitToColumn (arrayOfArray) {
    // get maximum character of each column
    return arrayOfArray[0].map((a, i) => {
        if (i < 4) return { wch: Math.max(...arrayOfArray.map((a2) => a2[i] ? a2[i].toString().length : 10)) }
        else return {}
    })
}

function getDate(d) {
    if (!d) return undefined;
    d = new Date(d);
    return (d.getDate() > 9 ? d.getDate() : '0' + d.getDate()) + "." + ((d.getMonth() + 1) > 9 ? (d.getMonth() + 1) : '0' + (d.getMonth() + 1)) + "." + d.getFullYear();
}

export const makeExportUsersTable = async (users, faculty) => {

    if (!users || users.length == 0) return

    let table = []
    table.push(['ФИО', 'Ст. об.', 'Курс', 'Дата', 'Критерий', 'Хар-ки', 'Достижение', 'Балл'])

    for (let user of users)
    {
        for (let ach of user.Achievements)
        {
            if (ach.status != 'Принято' && ach.status != 'Принято с изменениями') continue
            let row = []
            row.push(user.user)
            row.push(user.Type[0])
            row.push(user.Course)
            row.push(ach.achDate ? getDate(ach.achDate) : 'н/д')
            row.push(ach.chars[0])
            row.push(ach.chars.toString())
            row.push(ach.achievement)
            row.push(ach.ball)
            table.push(row)
        }
    }

    let wb = XLSX.utils.book_new()
    wb.SheetNames[0] = 'Лист 1'
    let worksheet = new XLSX.utils.aoa_to_sheet(table)
    worksheet['!cols'] = fitToColumn(table)
    wb.Sheets['Лист 1'] = worksheet

    let wopts = { bookType: 'xlsx', bookSST: false, type: 'binary' }
    let wbout = XLSX.write(wb, wopts)

    /* the saveAs call downloads a file on the local machine */
    FileSaver.saveAs(new Blob([s2ab(wbout)],{ type: '' }), faculty + '_Export.xlsx')
}
