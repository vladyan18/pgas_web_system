
const db = require('./dbController');
const path = require('path');
//const promisify = require('promisify-node');
const util = require('util');
const fs = require('fs');
const fsReadFile = util.promisify(fs.readFile);
const XlsxPopulate = require('xlsx-populate');
const translitter = require('cyrillic-to-translit-js');
const pdflib = require('pdf-lib');
const fontkit = require('@pdf-lib/fontkit');
const anketPath = path.join(__dirname, '..');
const docx = require('docx');
const QRCode = require('qrcode');
const Zip = require('node-zip');

module.exports.getAnket = async function (req, res) {
    try {
        let achievs = [];

        let user;
        if (req.user._json.email) {
            user = await db.findUserById(req.user._json.email);
        } else {
            user = await db.findUserById(req.user.user_id);
        }

        achievs = await db.findActualAchieves(user.id);

        let faculty = await db.GetFaculty(user.Faculty);
        let criterias = JSON.parse((await db.GetCriterias(user.Faculty)).Crits);

        let zip = new Zip();

        /* читаем файлы архива в память */
        let f01 = fs.readFileSync(anketPath + '/docs/Anketa/_rels/.rels');
        let f02 = fs.readFileSync(anketPath + '/docs/Anketa/docProps/app.xml');
        let f03 = fs.readFileSync(anketPath + '/docs/Anketa/docProps/core.xml');
        let f04 = fs.readFileSync(anketPath + '/docs/Anketa/word/_rels/document.xml.rels');
        let f05 = fs.readFileSync(anketPath + '/docs/Anketa/word/fontTable.xml');
        let f06 = fs.readFileSync(anketPath + '/docs/Anketa/word/document.xml');
        let f07 = fs.readFileSync(anketPath + '/docs/Anketa/word/header1.xml');
        let f08 = fs.readFileSync(anketPath + '/docs/Anketa/word/header2.xml');
        let f09 = fs.readFileSync(anketPath + '/docs/Anketa/word/numbering.xml');
        let f10 = fs.readFileSync(anketPath + '/docs/Anketa/word/settings.xml');
        let f11 = fs.readFileSync(anketPath + '/docs/Anketa/word/styles.xml');
        let f12 = fs.readFileSync(anketPath + '/docs/Anketa/[Content_Types].xml');
        let f13 = fs.readFileSync(anketPath + '/docs/Anketa/word/theme/theme1.xml');
        let f14 = fs.readFileSync(anketPath + '/docs/Anketa/word/webSettings.xml');
        /* тут все остальные файлы */

        /* создаём zip-объект */
        zip.file('_rels/.rels', f01);
        zip.file('docProps/app.xml', f02);
        zip.file('docProps/core.xml', f03);
        zip.file('word/_rels/document.xml.rels', f04);
        zip.file('word/fontTable.xml', f05);
        zip.file('word/header1.xml', f07);
        zip.file('word/header2.xml', f08);
        zip.file('word/numbering.xml', f09);
        zip.file('word/settings.xml', f10);
        zip.file('word/styles.xml', f11);
        zip.file('[Content_Types].xml', f12);
        zip.file('word/theme/theme1.xml', f13);
        zip.file('word/webSettings.xml', f14);
        /* тут все остальные файлы */

        f06 = String(f06).replace("FIO", user.LastName + ' ' + user.FirstName + ' ' + user.Patronymic);
        f06 = String(f06).replace("&lt;TYPE&gt;", user.Type);
        f06 = String(f06).replace("&lt;COURSE&gt;", user.Course);
        f06 = String(f06).replace("EMAIL", user.SpbuId);
        f06 = String(f06).replace("STDIR", faculty.DirName);
        let datestring;
        if (user.Birthdate) datestring = getDateFromStr(new Date(user.Birthdate));
        f06 = String(f06).replace("BD", datestring);
        let confirmNum = {val: 1, confirms: {}};
        const allConfirmations = [];
        let crits = Object.keys(criterias);
        if (crits.length !== 13) {
          crits.splice(9, 0,'DUMMY');
        }

        for (let i = 0; i < 13; i++) {
            let curAchs = achievs.filter(o => (o && o.crit === crits[i]));
            let cStr = '<w:p w:rsidR="00000000" w:rsidDel="00000000" w:rsidP="00000000" w:rsidRDefault="00000000" w:rsidRPr="00000000" w14:paraId="000000' + (16 + i * 3 + (i > 2 ? 3 : 0)).toString(16).toUpperCase() + '"><w:pPr><w:jc w:val="center"/><w:rPr/></w:pPr><w:r w:rsidDel="00000000" w:rsidR="00000000" w:rsidRPr="00000000"><w:rPr><w:rFonts w:ascii="Times New Roman" w:cs="Times New Roman" w:eastAsia="Times New Roman" w:hAnsi="Times New Roman"/><w:b w:val="1"/><w:sz w:val="20"/><w:szCs w:val="20"/><w:rtl w:val="0"/></w:rPr><w:t xml:space="preserve">A';
            if (curAchs.length === 0) {
                let nStr = '<w:p w:rsidR="00560C7E" w:rsidRDefault="00E56E56"><w:pPr><w:snapToGrid w:val="0" /><w:jc w:val="center" /></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" /><w:sz w:val="20" /><w:szCs w:val="20" /></w:rPr><w:t xml:space="preserve">Нет</w:t></w:r></w:p>';
                f06 = String(f06).replace(cStr + (i + 1) + '</w:t></w:r><w:r w:rsidDel="00000000" w:rsidR="00000000" w:rsidRPr="00000000"><w:rPr><w:rtl w:val="0"/></w:rPr></w:r></w:p>', nStr);
            }
            else {
                let str = "";
                let num = 1;
                for (let ach of curAchs) {
                    let proof = '';
                    let proofStr = '';
                    if (ach.confirmations.length === 0)
                        proofStr = '<w:p w:rsidR="00560C7E" w:rsidRDefault="00E56E56"><w:pPr><w:snapToGrid w:val="0" /><w:jc w:val="left" /></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" /><w:b /><w:sz w:val="20" /><w:szCs w:val="20" /><w:rtl w:val="0"/><w:lang w:val="en-US" /></w:rPr><w:t xml:space="preserve">' + 'УКАЗАТЬ ПОДТВЕРЖДЕНИЕ' + '</w:t></w:r></w:p>';
                    for (let confirmWrapped of ach.confirmations) {
                        let confirm = await db.getConfirmByIdForUser(confirmWrapped.id);
                        confirm.additionalInfo = confirmWrapped.additionalInfo;
                        allConfirmations.push(confirm);
                        proof = getProofString(confirm, confirmNum).replace(/&/g, '&amp;').replace(/</g, '&lt;');
                        proofStr += '<w:p w:rsidR="00560C7E" w:rsidRDefault="00E56E56"><w:pPr><w:snapToGrid w:val="0" /><w:jc w:val="left" /></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" /><w:b /><w:sz w:val="20" /><w:szCs w:val="20" /><w:rtl w:val="0"/><w:lang w:val="en-US" /></w:rPr><w:t xml:space="preserve">' + proof + '</w:t></w:r></w:p>';
                    }
                    if (i === 0) str = '<w:p w:rsidR="00560C7E" w:rsidRDefault="00E56E56"><w:pPr><w:snapToGrid w:val="0" /><w:jc w:val="center" /></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" /><w:b /><w:sz w:val="20" /><w:szCs w:val="20" /><w:rtl w:val="0"/><w:lang w:val="en-US" /></w:rPr><w:t>Да</w:t></w:r></w:p>';
                    else {
                        str += '<w:p w:rsidR="00560C7E" w:rsidRDefault="00E56E56"><w:pPr><w:snapToGrid w:val="0" /><w:jc w:val="left" /></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" /><w:b /><w:sz w:val="20" /><w:szCs w:val="20" /><w:rtl w:val="0"/><w:lang w:val="en-US" /></w:rPr><w:t xml:space="preserve">'
                            + ((num !== 1) ? '</w:t></w:r></w:p><w:p w:rsidR="00560C7E" w:rsidRDefault="00E56E56"><w:pPr><w:snapToGrid w:val="0" /><w:jc w:val="left" /></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" /><w:b /><w:sz w:val="20" /><w:szCs w:val="20" /><w:rtl w:val="0"/><w:lang w:val="en-US" /></w:rPr><w:t xml:space="preserve">' : '') + num + '. ' + ach.achievement.replace(/&/g, '&amp;').replace(/</g, '&lt;') + (ach.achDate ? (' (' + (ach.endingDate ? (getDateFromStr(new Date(ach.achDate)) + '-' + getDateFromStr(new Date(ach.endingDate))) : getDateFromStr(new Date(ach.achDate)) )  + ')') : '') + '</w:t></w:r></w:p>';
                        let charsStr = '<w:p w:rsidR="00560C7E" w:rsidRDefault="00E56E56"><w:pPr><w:snapToGrid w:val="0" /><w:jc w:val="left" /></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" /><w:i /><w:sz w:val="15" /><w:szCs w:val="15" /><w:rtl w:val="0"/><w:lang w:val="en-US" /></w:rPr><w:t xml:space="preserve">';
                        for (let c = 0; c < ach.chars.length; c++) {
                            if (c > 0) charsStr += ', ';
                            charsStr += ach.chars[c].replace(/&/g, '&amp;').replace(/</g, '&lt;')
                        }

                        str += charsStr + '</w:t></w:r></w:p>';

                        str += proofStr;
                    }

                    num += 1;
                }

                f06 = String(f06).replace(cStr + (i + 1) + '</w:t></w:r><w:r w:rsidDel="00000000" w:rsidR="00000000" w:rsidRPr="00000000"><w:rPr><w:rtl w:val="0"/></w:rPr></w:r></w:p>', str);
            }
        }
        zip.file('word/document.xml', f06);

        const anket = Buffer.from(zip.generate({
            base64: false,
            compression: 'DEFLATE'
        }), 'binary');

        const zip2 = new Zip();

        zip2.file(user.LastName + '_анкета_ПГАС.docx', anket);

        const filteredConfirmations = getFilteredConfirms(allConfirmations, confirmNum);
        const links = [];
        for (let i = 0; i < filteredConfirmations.length; i++) {
            /*try {
                if (filteredConfirmations[i].data.Type === 'doc') {
                    if (filteredConfirmations[i].data.FilePath.endsWith('.pdf')) {
                        const confFile = await fsReadFile(filteredConfirmations[i].data.FilePath);
                        zip2.file(filteredConfirmations[i].num + '. ' + filteredConfirmations[i].data.Name + '.pdf',
                            await makeStamp(confFile, 'Приложение № ' + filteredConfirmations[i].num));
                    } else {
                        const confFile = await fsReadFile(filteredConfirmations[i].data.FilePath);
                        zip2.file(filteredConfirmations[i].num + '. ' + filteredConfirmations[i].data.Name +
                            filteredConfirmations[i].data.FilePath.slice(
                                filteredConfirmations[i].data.FilePath.lastIndexOf('.'),
                                filteredConfirmations[i].data.FilePath.length
                            ),
                            confFile);
                    }
                }
            } catch (e) {
                console.log('Error with confirmations', user.id, filteredConfirmations[i].data.Name);
            }*/

            if (filteredConfirmations[i].data.Type === 'link') {
                links.push(filteredConfirmations[i]);
            }
        }

        if (links.length > 0) {
            const confirmationWithLinks = await makeConfirmationFileWithLinks(links);
            zip2.file('QR-коды.docx', confirmationWithLinks);
        }

        const archive = zip2.generate({
            base64: false,
            compression: 'DEFLATE'
        });
        const archiveForResp = Buffer.from(archive, 'binary');

        res.setHeader('Content-Disposition', 'attachment; filename=' + translitter().transform(user.LastName + '_ПГАС.zip', '_'));
        res.send(archiveForResp);
        //fs.writeFileSync(anketPath + "/docs/result/" + user._id + "_data.zip", archive, 'binary');
        //res.download(path.resolve(anketPath + "/docs/result/" + user._id + "_data.zip"), user.LastName + "_data.zip");
            //res.send(new Buffer(archive));
        //res.download(path.resolve(anketPath + "/docs/result/" + user._id + "_anketa.docx"), user.LastName + '_анкета_ПГАС.docx');
    }
    catch (err) {
        console.log(err);
        res.status(500).send(err)
    }

};

const getFilteredConfirms = function (confirms, confirmNum) {
    const filtered = [];
    const addedIds = [];

    for (let i = 0; i < confirms.length; i++) {
        if (addedIds.indexOf(confirms[i]._id) !== -1) continue;

        filtered.push({data: confirms[i], num: confirmNum.confirms[confirms[i]._id]});
        addedIds.push(confirms[i]._id);
    }
    return filtered
};

const getProofString = function (confirm, confirmNum) {
    if (confirm.Type === 'doc') {
        let str;
        if (confirmNum.confirms[confirm._id])
            str = 'Приложение ' + confirmNum.confirms[confirm._id] +
                (confirm.additionalInfo ? ' ' + confirm.additionalInfo : '') + '. (' + confirm.Name + ')';
        else {
            str = 'Приложение ' + confirmNum.val +
                (confirm.additionalInfo ? ' ' + confirm.additionalInfo : '') + '. (' + confirm.Name + ')';
            confirmNum.confirms[confirm._id] = confirmNum.val;
            confirmNum.val++
        }
        return str
    }
    if (confirm.Type === 'link') {
        let str;
        if (confirmNum.confirms[confirm._id])
            str = 'Приложение ' + confirmNum.confirms[confirm._id] +
                (confirm.additionalInfo ? ' ' + confirm.additionalInfo : '') + '. (QR-код, ' + confirm.Name + ')';
        else {
            str = 'Приложение ' + confirmNum.val +
                (confirm.additionalInfo ? ' ' + confirm.additionalInfo : '') + '. (QR-код, ' + confirm.Name + ')';
            confirmNum.confirms[confirm._id] = confirmNum.val;
            confirmNum.val++
        }

        return str
    }
    if (confirm.Type === 'SZ') {
        if (!confirm.SZ)
            return 'СЗ: ' + confirm.Name;
        else
            return 'СЗ: ' + confirm.Name + (confirm.SZ.Appendix ? ', прил. ' + confirm.SZ.Appendix : '') +
                (confirm.SZ.Paragraph ? ', п. ' + confirm.SZ.Paragraph : '')
    }
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
                            text: "Приложение № " + links[i].num + '. ' ,
                            bold: true,
                            size: 26,
                            font: 'Calibri'
                        }),
                        new docx.TextRun({
                            text: (links[i].data.additionalInfo ? links[i].data.additionalInfo : ''),
                            size: 26,
                            font: 'Calibri'
                        })
                    ],
                })
        )
        paragraphs.push(new docx.Paragraph(imageOfQR));
        paragraphs.push(new docx.Paragraph({ children: [new docx.TextRun('')]}));

        }
    doc.addSection({
        children: paragraphs
    });

    return docx.Packer.toBuffer(doc);
}

module.exports.getResultTable = async function (req, res) {
    try {
        let faculty = await db.GetFaculty(req.query.faculty);
        let kri = JSON.parse((await db.GetCriterias(req.query.faculty)).Crits);
        let users = [];
        let Users = await db.CurrentUsers(req.query.faculty);
        for (let user of Users) {
            let sumBall = 0;
            let crits = {};
            for (let key of Object.keys(kri)) {
                crits[key] = 0;
            }
            let Achs = await db.findActualAchieves(user.id);
            for (let ach of Achs) {
                if (!ach) continue;
                if (ach.ball) {
                    crits[ach.crit] += ach.ball;
                    sumBall += ach.ball;
                }
            }
            let fio = user.LastName + ' ' + user.FirstName + ' ' + (user.Patronymic ? user.Patronymic : '');
            users.push({Name: fio, Type: user.Type, Course: user.Course, Crits: crits, Ball: sumBall})
        }

            users.sort(function(obj1, obj2) {
                let diff = obj2.Ball-obj1.Ball;
                if (diff !== 0)
                    return obj2.Ball-obj1.Ball;
                else {
                    for (let crit of Object.keys(obj1.Crits)) {
                        diff = obj2.Crits[crit] - obj1.Crits[crit];
                        if (diff !== 0) return diff
                    }
                    return 0
                }
            });


        XlsxPopulate.fromFileAsync(anketPath + "/docs/ResultTable.xlsx")
            .then(workbook => {
                try {
                    workbook.sheet(0).cell("A4").value(faculty.OfficialName);
                    // Modify the workbook.
                    for (let i = 0; i < users.length; i++) {
                        let r = [];
                        r[0] = i + 1;
                        r[1] = users[i].Name;
                        r[2] = users[i].Type;
                        r[3] = users[i].Course;
                        for (let j = 0; j < Object.keys(users[i].Crits).length; j++) {
                            r.push(users[i].Crits[Object.keys(users[i].Crits)[j]])
                        }
                        r.push(users[i].Ball);
                        workbook.sheet(0).cell("A" + (i + 5)).value([r]);
                    }
                    for (let i = 1; i < 19; i++) {
                        workbook.sheet(0).column(i).style("horizontalAlignment", "center");
                    }
                    workbook.sheet(0).column("B").style("horizontalAlignment", "left");
                    workbook.sheet(0).cell("B1").style("horizontalAlignment", "center");

                    workbook.toFileAsync(anketPath + "/docs/ResultTable2.xlsx").then(() => {
                        res.download(path.resolve(anketPath + "/docs/ResultTable2.xlsx"), "PGAS_" + translitter().transform(faculty.Name, '_') + "_" + (new Date()).getFullYear() + ".xlsx");
                    })
                }
                catch (e) {
                    res.status(500).send(e)
                }
            }).catch((e) => {res.status(500).send(e)});
    }
    catch (err) {
        console.log(err);
        res.status(500).send(err)
    }

};

const font9404 = fs.readFileSync(path.join(__dirname, '../fonts/9404.ttf'));
// eslint-disable-next-line no-unused-vars
async function makeStamp(file, stamp) {
    const pdfDoc = await pdflib.PDFDocument.load(file);
    pdfDoc.registerFontkit(fontkit);
    const customFont = await pdfDoc.embedFont(font9404);
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];
    const { height } = firstPage.getSize();

    firstPage.drawText(stamp, {
        x: 15,
        y: height - 25,
        size: 10,
        font: customFont,
    });
    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
}

function getDateFromStr(d) {
    console.log(d);
    return (d.getDate()> 9 ? d.getDate() : '0' + d.getDate())  + "." + ((d.getMonth()+1) > 9 ? (d.getMonth()+1) : '0' + (d.getMonth()+1)) + "." + d.getFullYear();
}
