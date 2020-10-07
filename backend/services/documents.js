const db = require('../dataLayer');
const path = require('path');
const anketPath = path.join(__dirname, '..');
const Zip = require('node-zip');
const XlsxPopulate = require('xlsx-populate');
const translitter = require('cyrillic-to-translit-js');

const { achievementsProcessing, anketFormatter } = require('./utils');

module.exports.getAnket = async function(userId, facultyName) {
        const dbpromises = [db.findUserById(userId), db.findActualAchieves(userId)];
        const [user, achievs] = await Promise.all(dbpromises);
        const dbpromises2 = [db.getFaculty(user.Faculty), db.getCriteriasObject(user.Faculty)];
        const [faculty, criterias] = await Promise.all(dbpromises2);

        const [anket, allConfirmations, confirmNum] = await anketFormatter.createAnket(user, achievs, faculty, criterias);
        const confirmationWithLinks = await anketFormatter.createConfirmationsFile(allConfirmations, confirmNum);

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

module.exports.getResultTable = async function(facultyName) { // TODO refactor
    const [faculty, criterias] = await Promise.all([db.getFaculty(facultyName), db.getCriteriasAndLimits(facultyName)]);

    const kri = criterias.Crits;
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
        for (let j = 0; j < critNames.length; j++) {
            const crit = critNames[j];
            r.push(users[i].Crits[crit] || 0);
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
