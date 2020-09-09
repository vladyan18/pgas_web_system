const db = require('./../controllers/dbController');
const path = require('path');
const anketPath = path.join(__dirname, '..');
const fs = require('fs');
const util = require('util');
const readFile = util.promisify(fs.readFile);
const getDateFromStr = require('../helpers/getDateFromStr');
const achievementsProcessing = require('./achievementsProcessing');
const Zip = require('node-zip');
const XlsxPopulate = require('xlsx-populate');
const docx = require('docx');
const QRCode = require('qrcode');
const translitter = require('cyrillic-to-translit-js');

module.exports.getAnket = async function(userId, facultyName) { //TODO refactor
        const dbpromises = [db.findUserById(userId), db.findActualAchieves(userId)];
        const [user, achievs] = await Promise.all(dbpromises);
        const dbpromises2 = [db.getFaculty(user.Faculty), db.getCriteriasObject(user.Faculty)];
        const [faculty, criterias] = await Promise.all(dbpromises2);

        const [anket, allConfirmations, confirmNum] = await createAnket(user, achievs, faculty, criterias);
        const confirmationWithLinks = await createConfirmationsFile(allConfirmations, confirmNum);

        if (!confirmationWithLinks) {
            return [anket, translitter().transform(user.LastName + '_анкета_ПГАС.docx', '_')];
        }

        const zip = new Zip();
        zip.file(user.LastName + '_анкета_ПГАС.docx', anket);
        zip.file('QR-коды.docx', confirmationWithLinks);
        const archive = zip.generate({
            base64: false,
            compression: 'DEFLATE',
        });
        return [Buffer.from(archive, 'binary'), translitter().transform(user.LastName + '_ПГАС.zip', '_')];
};

module.exports.getResultTable = async function(facultyName) { //TODO refactor
    const [faculty, criterias] = await Promise.all([db.getFaculty(facultyName), db.getCriterias(facultyName)]);

    const kri = JSON.parse(criterias.Crits);
    const limits = criterias.Limits;
    const critNames = Object.keys(kri);
    if (critNames[0] === '7а') {
        critNames.splice(9, 0, '10в');
    }

    const users = await achievementsProcessing.getRating(facultyName, true);

    users.sort(function(obj1, obj2) {
        let diff = obj2.Ball-obj1.Ball;
        if (diff !== 0) {
            return obj2.Ball-obj1.Ball;
        } else {
            for (const crit of Object.keys(obj1.Crits)) {
                diff = obj2.Crits[crit] - obj1.Crits[crit];
                if (diff !== 0) return diff;
            }
            return 0;
        }
    });
    const workbook = await XlsxPopulate.fromFileAsync(anketPath + '/docs/ResultTable.xlsx');
    workbook.sheet(0).cell('A4').value(faculty.OfficialName);
    for (let i = 0; i < users.length; i++) {
        const r = [];
        r[0] = i + 1;
        r[1] = users[i].Name;
        r[2] = users[i].Type;
        r[3] = users[i].Course;
        for (let j = 0; j < Object.keys(users[i].Crits).length; j++) {
            r.push(users[i].Crits[Object.keys(users[i].Crits)[j]]);
        }
        r.push(users[i].Ball);
        workbook.sheet(0).cell('A' + (i + 5)).value([r]);
    }
    for (let i = 1; i < 19; i++) {
        workbook.sheet(0).column(i).style('horizontalAlignment', 'center');
    }
    workbook.sheet(0).column('B').style('horizontalAlignment', 'left');
    workbook.sheet(0).cell('B1').style('horizontalAlignment', 'center');

    const filename = 'PGAS_' + translitter().transform(faculty.Name, '_') + '_' + (new Date()).getFullYear() + '.xlsx';

    return [workbook.outputAsync(), filename];
};

async function createAnket(user, achievs, faculty, criterias) {
    const filenames = [
        '_rels/.rels',
        'docProps/app.xml',
        'docProps/core.xml',
        'word/_rels/document.xml.rels',
        'word/fontTable.xml',
        'word/document.xml',
        'word/header1.xml',
        'word/header2.xml',
        'word/numbering.xml',
        'word/settings.xml',
        'word/styles.xml',
        '[Content_Types].xml',
        'word/theme/theme1.xml',
        'word/webSettings.xml'
    ];
    const promises = filenames.map((filename) => readFile(anketPath + '/docs/Anketa/' + filename));
    const files = await Promise.all(promises);

    let f06 = files[5];

    f06 = insertPersonalInfo(f06, user, faculty);
    const [resultFile, allConfirmations, confirmNum]  = await insertAchievements(f06, criterias, achievs);

    files[5] = resultFile;

    const zip = new Zip();
    filenames.map((filename, index) => {
        zip.file(filename, files[index]);
    });

    const buffer = Buffer.from(zip.generate({
        base64: false,
        compression: 'DEFLATE',
    }), 'binary');
    return [buffer, allConfirmations, confirmNum]
}

function insertPersonalInfo(file, user, faculty) {
    const markers = {
        fio: 'FIO',
        type: '&lt;TYPE&gt;',
        course: '&lt;COURSE&gt;',
        email: 'EMAIL',
        direction: 'STDIR',
        birthdate: 'BD'
    };
    const fio = user.LastName + ' ' + user.FirstName + ' ' + (user.Patronymic ? user.Patronymic : '');

    let datestring;
    if (user.Birthdate) datestring = getDateFromStr(new Date(user.Birthdate));

    return String(file).replace(markers.fio, fio)
        .replace(markers.type, user.Type)
        .replace(markers.course, user.Course)
        .replace(markers.email, user.SpbuId)
        .replace(markers.direction, faculty.DirName)
        .replace(markers.birthdate, datestring);
}

async function insertAchievements(file, criterias, achievs) {
    const confirmNum = {val: 1, confirms: {}};
    const allConfirmations = [];
    const crits = Object.keys(criterias);
    if (crits.length !== 13) {
        crits.splice(9, 0, 'DUMMY');
    }

    for (let i = 0; i < 13; i++) {
        const curAchs = achievs.filter((o) => (o && o.crit === crits[i]));
        const cStr = '<w:p w:rsidR="00000000" w:rsidDel="00000000" w:rsidP="00000000" w:rsidRDefault="00000000" w:rsidRPr="00000000" w14:paraId="000000' + (16 + i * 3 + (i > 2 ? 3 : 0)).toString(16).toUpperCase() + '"><w:pPr><w:jc w:val="center"/><w:rPr/></w:pPr><w:r w:rsidDel="00000000" w:rsidR="00000000" w:rsidRPr="00000000"><w:rPr><w:rFonts w:ascii="Times New Roman" w:cs="Times New Roman" w:eastAsia="Times New Roman" w:hAnsi="Times New Roman"/><w:b w:val="1"/><w:sz w:val="20"/><w:szCs w:val="20"/><w:rtl w:val="0"/></w:rPr><w:t xml:space="preserve">A';
        if (curAchs.length === 0) {
            const nStr = '<w:p w:rsidR="00560C7E" w:rsidRDefault="00E56E56"><w:pPr><w:snapToGrid w:val="0" /><w:jc w:val="center" /></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" /><w:sz w:val="20" /><w:szCs w:val="20" /></w:rPr><w:t xml:space="preserve">Нет</w:t></w:r></w:p>';
            file = String(file).replace(cStr + (i + 1) + '</w:t></w:r><w:r w:rsidDel="00000000" w:rsidR="00000000" w:rsidRPr="00000000"><w:rPr><w:rtl w:val="0"/></w:rPr></w:r></w:p>', nStr);
        } else {
            let str = '';
            let num = 1;
            for (const ach of curAchs) {
                let proof = '';
                let proofStr = '';
                if (ach.confirmations.length === 0) {
                    proofStr = '<w:p w:rsidR="00560C7E" w:rsidRDefault="00E56E56"><w:pPr><w:snapToGrid w:val="0" /><w:jc w:val="left" /></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" /><w:b /><w:sz w:val="20" /><w:szCs w:val="20" /><w:rtl w:val="0"/><w:lang w:val="en-US" /></w:rPr><w:t xml:space="preserve">' + 'УКАЗАТЬ ПОДТВЕРЖДЕНИЕ' + '</w:t></w:r></w:p>';
                }
                for (const confirmWrapped of ach.confirmations) {
                    const confirm = await db.getConfirmByIdForUser(confirmWrapped.id);
                    confirm.additionalInfo = confirmWrapped.additionalInfo;
                    allConfirmations.push(confirm);
                    proof = getProofString(confirm, confirmNum).replace(/&/g, '&amp;').replace(/</g, '&lt;');
                    proofStr += '<w:p w:rsidR="00560C7E" w:rsidRDefault="00E56E56"><w:pPr><w:snapToGrid w:val="0" /><w:jc w:val="left" /></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" /><w:b /><w:sz w:val="20" /><w:szCs w:val="20" /><w:rtl w:val="0"/><w:lang w:val="en-US" /></w:rPr><w:t xml:space="preserve">' + proof + '</w:t></w:r></w:p>';
                }
                if (i === 0) str = '<w:p w:rsidR="00560C7E" w:rsidRDefault="00E56E56"><w:pPr><w:snapToGrid w:val="0" /><w:jc w:val="center" /></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" /><w:b /><w:sz w:val="20" /><w:szCs w:val="20" /><w:rtl w:val="0"/><w:lang w:val="en-US" /></w:rPr><w:t>Да</w:t></w:r></w:p>';
                else {
                    str += '<w:p w:rsidR="00560C7E" w:rsidRDefault="00E56E56"><w:pPr><w:snapToGrid w:val="0" /><w:jc w:val="left" /></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" /><w:b /><w:sz w:val="20" /><w:szCs w:val="20" /><w:rtl w:val="0"/><w:lang w:val="en-US" /></w:rPr><w:t xml:space="preserve">' +
                        ((num !== 1) ? '</w:t></w:r></w:p><w:p w:rsidR="00560C7E" w:rsidRDefault="00E56E56"><w:pPr><w:snapToGrid w:val="0" /><w:jc w:val="left" /></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" /><w:b /><w:sz w:val="20" /><w:szCs w:val="20" /><w:rtl w:val="0"/><w:lang w:val="en-US" /></w:rPr><w:t xml:space="preserve">' : '') + num + '. ' + ach.achievement.replace(/&/g, '&amp;').replace(/</g, '&lt;') + (ach.achDate ? (' (' + (ach.endingDate ? (getDateFromStr(new Date(ach.achDate)) + '-' + getDateFromStr(new Date(ach.endingDate))) : getDateFromStr(new Date(ach.achDate)) ) + ')') : '') + '</w:t></w:r></w:p>';
                    let charsStr = '<w:p w:rsidR="00560C7E" w:rsidRDefault="00E56E56"><w:pPr><w:snapToGrid w:val="0" /><w:jc w:val="left" /></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" /><w:i /><w:sz w:val="15" /><w:szCs w:val="15" /><w:rtl w:val="0"/><w:lang w:val="en-US" /></w:rPr><w:t xml:space="preserve">';
                    for (let c = 0; c < ach.chars.length; c++) {
                        if (c > 0) charsStr += ', ';
                        charsStr += ach.chars[c].replace(/&/g, '&amp;').replace(/</g, '&lt;');
                    }

                    str += charsStr + '</w:t></w:r></w:p>';

                    str += proofStr;
                }

                num += 1;
            }

            file = String(file).replace(cStr + (i + 1) + '</w:t></w:r><w:r w:rsidDel="00000000" w:rsidR="00000000" w:rsidRPr="00000000"><w:rPr><w:rtl w:val="0"/></w:rPr></w:r></w:p>', str);
        }
    }

    return [file, allConfirmations, confirmNum];
}

const getProofString = function(confirm, confirmNum) {
    if (confirm.Type === 'doc') {
        let str;
        if (confirmNum.confirms[confirm._id]) {
            str = 'Приложение ' + confirmNum.confirms[confirm._id] +
                (confirm.additionalInfo ? ' ' + confirm.additionalInfo : '') + '. (' + confirm.Name + ')';
        } else {
            str = 'Приложение ' + confirmNum.val +
                (confirm.additionalInfo ? ' ' + confirm.additionalInfo : '') + '. (' + confirm.Name + ')';
            confirmNum.confirms[confirm._id] = confirmNum.val;
            confirmNum.val++;
        }
        return str;
    }
    if (confirm.Type === 'link') {
        let str;
        if (confirmNum.confirms[confirm._id]) {
            str = 'Приложение ' + confirmNum.confirms[confirm._id] +
                (confirm.additionalInfo ? ' ' + confirm.additionalInfo : '') + '. (QR-код, ' + confirm.Name + ')';
        } else {
            str = 'Приложение ' + confirmNum.val +
                (confirm.additionalInfo ? ' ' + confirm.additionalInfo : '') + '. (QR-код, ' + confirm.Name + ')';
            confirmNum.confirms[confirm._id] = confirmNum.val;
            confirmNum.val++;
        }

        return str;
    }
    if (confirm.Type === 'SZ') {
        if (!confirm.SZ) {
            return 'СЗ: ' + confirm.Name;
        } else {
            return 'СЗ: ' + confirm.Name + (confirm.SZ.Appendix ? ', прил. ' + confirm.SZ.Appendix : '') +
                (confirm.SZ.Paragraph ? ', п. ' + confirm.SZ.Paragraph : '');
        }
    }
};

async function createConfirmationsFile(confirmations, confirmNum) {
    const filteredConfirmations = getFilteredConfirms(confirmations, confirmNum);
    const links = filteredConfirmations.filter((x) => x.data.Type === 'link');

    if (links.length > 0) {
        return makeConfirmationFileWithLinks(links);
    }
    return null;
};

const getFilteredConfirms = function(confirms, confirmNum) {
    const filtered = [];
    const addedIds = [];

    for (let i = 0; i < confirms.length; i++) {
        if (addedIds.indexOf(confirms[i]._id) !== -1) continue;

        filtered.push({data: confirms[i], num: confirmNum.confirms[confirms[i]._id]});
        addedIds.push(confirms[i]._id);
    }
    return filtered;
};

async function makeConfirmationFileWithLinks(links) {
    const doc = new docx.Document();

    const paragraphs = [];
    for (let i = 0; i < links.length; i++) {
        const buffer = QRCode.toBuffer(links[i].data.Data);

        const imageOfQR = docx.Media.addImage(doc, buffer);

        paragraphs.push(
            new docx.Paragraph({
                children: [
                    new docx.TextRun({
                        text: 'Приложение № ' + links[i].num + '. ',
                        bold: true,
                        size: 26,
                        font: 'Calibri',
                    }),
                    new docx.TextRun({
                        text: (links[i].data.additionalInfo ? links[i].data.additionalInfo : ''),
                        size: 26,
                        font: 'Calibri',
                    }),
                ],
            }),
        );
        paragraphs.push(new docx.Paragraph(imageOfQR));
        paragraphs.push(new docx.Paragraph({children: [new docx.TextRun('')]}));
    }
    doc.addSection({
        children: paragraphs,
    });

    return docx.Packer.toBuffer(doc);
};