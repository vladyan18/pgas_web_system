import React from 'react';
import XLSX from 'xlsx';
import { getDate } from '../helpers/';
const FileSaver = require('file-saver');

function s2ab(s) {
  const buf = new ArrayBuffer(s.length);
  const view = new Uint8Array(buf);
  for (let i = 0; i !== s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
  return buf;
}

function fitToColumn(arrayOfArray) {
  // get maximum character of each column
  return arrayOfArray[0].map((a, i) => {
    if (i !== 6) return {wch: Math.max(...arrayOfArray.map((a2) => a2[i] ? a2[i].toString().length : 20))};
    else return {wch: 20, alignment: { wrapText: true }};
  });
}

export const makeExportUsersTable = async (users, faculty, filters) => {
  if (!users || users.length === 0) return;

  const table = [];
  table.push(['ФИО', 'Ст. об.', 'Курс', 'Критерий', 'Достижение', 'Дата', 'Хар-ки', 'Балл']);

  for (const user of users) {
    if (filters && filters.length > 0) {
      user.Achievements = user.Achievements.filter((x) => {
        let res = false;
        for (const filter of filters) {
          let filterRes = true;
          for (const char of filter) {
            filterRes = filterRes && x.chars.includes(char);
          }
          res = res || filterRes;
        }
        return res;
      });
    }

    user.Achievements = user.Achievements.sort(function(obj1, obj2) {
      if (obj1.crit.indexOf('(') !== -1) {
return Number.parseInt(obj1.crit.substr(0, 2)) - Number.parseInt(obj2.crit.substr(0, 2));
} else {
        const letter1 = obj1.crit[obj1.crit.length - 1].charCodeAt(0);
        const letter2 = obj2.crit[obj2.crit.length - 1].charCodeAt(0);
        const number1 = obj1.crit.substr(0, obj1.crit.length - 1);
        const number2 = obj2.crit.substr(0, obj2.crit.length - 1);
        let result = Number.parseInt(number1) - Number.parseInt(number2);
        if (result === 0) {
          result = letter1 - letter2;
        }
        return result;
      }
    });

    for (const ach of user.Achievements) {
      if (ach.status !== 'Принято' && ach.status !== 'Принято с изменениями') continue;
      const row = [];
      row.push(user.user);
      row.push(user.Type ? user.Type[0] : 'н/д');
      row.push(user.Course);
      row.push(ach.chars[0]);
      row.push(ach.achievement);
      row.push(ach.achDate ? getDate(ach.achDate) : 'н/д');
      row.push(ach.chars.toString());
      row.push(ach.ball);
      table.push(row);
    }
  }

  const wb = XLSX.utils.book_new();
  wb.SheetNames[0] = 'Лист 1';
  const worksheet = new XLSX.utils.aoa_to_sheet(table);
  worksheet['!cols'] = fitToColumn(table);
  wb.Sheets['Лист 1'] = worksheet;

  const wopts = {bookType: 'xlsx', bookSST: false, type: 'binary'};
  const wbout = XLSX.write(wb, wopts);

  /* the saveAs call downloads a file on the local machine */
  FileSaver.saveAs(new Blob([s2ab(wbout)], {type: ''}), faculty + '_Export.xlsx');
};
