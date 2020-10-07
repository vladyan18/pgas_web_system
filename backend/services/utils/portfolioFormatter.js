const fs = require('fs');
const { getFIO, getDateFromStr } = require('../../helpers');
const { CharsNiceVariants } = require('../../../common/consts');

function createCharsString(chars) {
    const charsDictionary = CharsNiceVariants;
    let str = '';
    for (let i = 1; i < chars.length; i++) {
        const char = charsDictionary[chars[i]] || chars[i];
        str += char + (i !== chars.length - 1 ? ', ' : '');
    }
    return str;
}

function createTable(achievements) {
    let accum = '';
    for (const ach of achievements) {
        accum += `<tr>
            <td style="color: grey; width: 10%; vertical-align: top; padding-bottom: 1rem;">${getDateFromStr(ach.achDate)}</td>
            <td style="padding-left: 2rem; vertical-align: top; padding-bottom: 1rem;">${ach.achievement} <br/> <span style="color:grey; font-weight: 350; font-size: small;">${createCharsString(ach.chars)}</span></td>  
            </tr>`;
    }
    return `<table><tbody>${accum}</tbody></table>`;
}

function getFieldOfWork(fieldName, crits, user) {
    const achievements = user.Achievement.filter((x) => crits.includes(x.crit))
        .sort((a, b) => new Date(b.achDate) - new Date(a.achDate));
    if (achievements.length === 0) return '';
    const block = createTable(achievements);
    return `<h2 class="subheader">${fieldName}</h2><hr/>` + block;
}

module.exports.buildPortfolioHTML = async function(user) {
    let template = await fs.promises.readFile('./client/public/portfolio.html', {encoding: 'utf-8'});
    template = template.replace('$FIO$', getFIO(user))
        .replace('$FACULTY$', user.Faculty)
        .replace('$TYPE$', user.Type)
        .replace('$COURSE$', user.Course);

    let achievementsBlock = '';

    const fields = [
        ['Олимпиады', ['7в']],
        ['Проекты', ['7б']],
        ['Публикации', ['8б']],
        ['Гранты и призы за научную деятельность', ['8а']],
        ['Творчество', ['10а', '10б']],
        ['Общественная деятельность', ['9а', '9б']],
        ['Спорт', ['11а', '11б', '11в']],
    ];

    for (const [fieldName, crits] of fields) {
        achievementsBlock += getFieldOfWork(fieldName, crits, user);
    }

    return template.replace('$ACHIEVEMENTS$', achievementsBlock);
};
