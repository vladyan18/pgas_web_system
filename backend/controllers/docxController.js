
const db = require('./dbController');
const path = require('path');
const fs = require('fs');
const XlsxPopulate = require('xlsx-populate');

const anketPath = path.join(__dirname, '..');

module.exports.getAnket = async function (req, res) {
    try {
        achievs = [];

        if (req.user._json.email)
            user = await
                db.findUserById(req.user._json.email);
    else
        user = await
            db.findUserById(req.user.user_id);
        let W = user.Achievement;
        for (let i of W) {
            let Ach = await
                db.findAchieveById(i);
            await
            achievs.push(Ach)
        }

        let faculty = await db.GetFaculty(user.Faculty);


        var zip = new require('node-zip')();

        /* читаем файлы архива в память */
        f01 = fs.readFileSync(anketPath + '/docs/Anketa/_rels/.rels');
        f02 = fs.readFileSync(anketPath + '/docs/Anketa/docProps/app.xml');
        f03 = fs.readFileSync(anketPath + '/docs/Anketa/docProps/core.xml');
        f04 = fs.readFileSync(anketPath + '/docs/Anketa/word/_rels/document.xml.rels');
        f05 = fs.readFileSync(anketPath + '/docs/Anketa/word/fontTable.xml');
        f06 = fs.readFileSync(anketPath + '/docs/Anketa/word/document.xml');
        f07 = fs.readFileSync(anketPath + '/docs/Anketa/word/header1.xml');
        f08 = fs.readFileSync(anketPath + '/docs/Anketa/word/header2.xml');
        f09 = fs.readFileSync(anketPath + '/docs/Anketa/word/numbering.xml');
        f10 = fs.readFileSync(anketPath + '/docs/Anketa/word/settings.xml');
        f11 = fs.readFileSync(anketPath + '/docs/Anketa/word/styles.xml');
        f12 = fs.readFileSync(anketPath + '/docs/Anketa/[Content_Types].xml');
        f13 = fs.readFileSync(anketPath + '/docs/Anketa/word/theme/theme1.xml');
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
        /* тут все остальные файлы */

        f06 = String(f06).replace("FIO", user.LastName + ' ' + user.FirstName + ' ' + user.Patronymic);
        f06 = String(f06).replace("&lt;TYPE&gt;", user.Type);
        f06 = String(f06).replace("&lt;COURSE&gt;", user.Course);
        f06 = String(f06).replace("EMAIL", user.SpbuId);
        f06 = String(f06).replace("STDIR", faculty.DirName);
        if (user.Birthdate) datestring = getDateFromStr(new Date(user.Birthdate));
        f06 = String(f06).replace("BD", datestring);
        let confirmNum = {val: 1, confirms: {}};
        crits = ['1 (7а)', '2 (7б)', '3 (7в)', '4 (8а)', '5 (8б)', '6 (9а)', '7 (9б)', '8 (10а)', '9 (10б)', '10 (10в)', '11 (11а)', '12 (11б)', '13 (11в)'];
        for (var i = 0; i < 13; i++) {
            curAchs = achievs.filter(o => (o && o.crit == crits[i]));
            cStr = '<w:p w:rsidR="00000000" w:rsidDel="00000000" w:rsidP="00000000" w:rsidRDefault="00000000" w:rsidRPr="00000000" w14:paraId="000000' + (16 + i * 3 + (i > 2 ? 3 : 0)).toString(16).toUpperCase() + '"><w:pPr><w:jc w:val="center"/><w:rPr/></w:pPr><w:r w:rsidDel="00000000" w:rsidR="00000000" w:rsidRPr="00000000"><w:rPr><w:rFonts w:ascii="Times New Roman" w:cs="Times New Roman" w:eastAsia="Times New Roman" w:hAnsi="Times New Roman"/><w:b w:val="1"/><w:sz w:val="20"/><w:szCs w:val="20"/><w:rtl w:val="0"/></w:rPr><w:t xml:space="preserve">A';
            console.log(cStr + (i + 1) + '</w:t></w:r><w:r w:rsidDel="00000000" w:rsidR="00000000" w:rsidRPr="00000000"><w:rPr><w:rtl w:val="0"/></w:rPr></w:r></w:p>');
            if (curAchs.length == 0) {
                nStr = '<w:p w:rsidR="00560C7E" w:rsidRDefault="00E56E56"><w:pPr><w:snapToGrid w:val="0" /><w:jc w:val="center" /></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" /><w:sz w:val="20" /><w:szCs w:val="20" /></w:rPr><w:t xml:space="preserve">Нет</w:t></w:r></w:p>';
                f06 = String(f06).replace(cStr + (i + 1) + '</w:t></w:r><w:r w:rsidDel="00000000" w:rsidR="00000000" w:rsidRPr="00000000"><w:rPr><w:rtl w:val="0"/></w:rPr></w:r></w:p>', nStr);
            }
            else {
                str = "";
                let num = 1;
                for (ach of curAchs) {
                    proof = '';
                    proofStr = '';
                    if (ach.confirmations.length == 0)
                        proofStr = '<w:p w:rsidR="00560C7E" w:rsidRDefault="00E56E56"><w:pPr><w:snapToGrid w:val="0" /><w:jc w:val="left" /></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" /><w:b /><w:sz w:val="20" /><w:szCs w:val="20" /><w:rtl w:val="0"/><w:lang w:val="en-US" /></w:rPr><w:t xml:space="preserve">' + 'УКАЗАТЬ ПОДТВЕРЖДЕНИЕ' + '</w:t></w:r></w:p>';
                    for (let confirmWrapped of ach.confirmations) {
                        confirm = await db.getConfirmByIdForUser(confirmWrapped.id);
                        confirm.additionalInfo = confirmWrapped.additionalInfo;
                        proof = getProofString(confirm, confirmNum);
                        proofStr += '<w:p w:rsidR="00560C7E" w:rsidRDefault="00E56E56"><w:pPr><w:snapToGrid w:val="0" /><w:jc w:val="left" /></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" /><w:b /><w:sz w:val="20" /><w:szCs w:val="20" /><w:rtl w:val="0"/><w:lang w:val="en-US" /></w:rPr><w:t xml:space="preserve">' + proof + '</w:t></w:r></w:p>';
                    }
                    if (i == 0) str = '<w:p w:rsidR="00560C7E" w:rsidRDefault="00E56E56"><w:pPr><w:snapToGrid w:val="0" /><w:jc w:val="center" /></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" /><w:b /><w:sz w:val="20" /><w:szCs w:val="20" /><w:rtl w:val="0"/><w:lang w:val="en-US" /></w:rPr><w:t>Да</w:t></w:r></w:p>';
                    else {
                        str += '<w:p w:rsidR="00560C7E" w:rsidRDefault="00E56E56"><w:pPr><w:snapToGrid w:val="0" /><w:jc w:val="left" /></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" /><w:b /><w:sz w:val="20" /><w:szCs w:val="20" /><w:rtl w:val="0"/><w:lang w:val="en-US" /></w:rPr><w:t xml:space="preserve">'
                            + ((num != 1) ? '</w:t></w:r></w:p><w:p w:rsidR="00560C7E" w:rsidRDefault="00E56E56"><w:pPr><w:snapToGrid w:val="0" /><w:jc w:val="left" /></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" /><w:b /><w:sz w:val="20" /><w:szCs w:val="20" /><w:rtl w:val="0"/><w:lang w:val="en-US" /></w:rPr><w:t xml:space="preserve">' : '') + num + '. ' + ach.achievement + (ach.achDate ? (' (' + (ach.endingDate ? (getDateFromStr(new Date(ach.achDate)) + '-' + getDateFromStr(new Date(ach.endingDate))) : getDateFromStr(new Date(ach.achDate)) )  + ')') : '') + '</w:t></w:r></w:p>';
                        charsStr = '<w:p w:rsidR="00560C7E" w:rsidRDefault="00E56E56"><w:pPr><w:snapToGrid w:val="0" /><w:jc w:val="left" /></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" /><w:i /><w:sz w:val="15" /><w:szCs w:val="15" /><w:rtl w:val="0"/><w:lang w:val="en-US" /></w:rPr><w:t xml:space="preserve">';
                        for (var c = 0; c < ach.chars.length; c++) {
                            if (c > 0) charsStr += ', ';
                            charsStr += ach.chars[c]
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

        fs.writeFileSync(anketPath + "/docs/result/" + user._id + "_anketa.docx", zip.generate({
            base64: false,
            compression: 'DEFLATE'
        }), 'binary');

        res.download(path.resolve(anketPath + "/docs/result/" + user._id + "_anketa.docx"), user.LastName + '_анкета_ПГАС.docx');
    }
    catch (err) {
        console.log(err);
        res.status(500).send(err)
    }

};

getProofString = function (confirm, confirmNum) {
    if (confirm.Type == 'doc') {
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
    if (confirm.Type == 'link') {
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
    if (confirm.Type == 'SZ') {
        if (!confirm.SZ)
            return 'СЗ: ' + confirm.Name;
        else
            return 'СЗ: ' + confirm.Name + (confirm.SZ.Appendix ? ', прил. ' + confirm.SZ.Appendix : '') +
                (confirm.SZ.Paragraph ? ', п. ' + confirm.SZ.Paragraph : '')
    }
};

module.exports.getResultTable = async function (req, res) {
    try {
        let kri = Kri;
        let users = [];
        let Users = await db.CurrentUsers();
        for (let user of Users) {
            let sumBall = 0;
            let crits = {};
            for (key of Object.keys(kri)) {
                crits[key] = 0;
            }
            Achs = await db.findAchieves(user.id);
            for (let ach of Achs) {
                if (!ach) continue;
                if (ach.ball) {
                    crits[ach.crit] += ach.ball;
                    sumBall += ach.ball;
                }
            }
            let fio = user.LastName + ' ' + user.FirstName + ' ' + user.Patronymic;
            users.push({Name: fio, Type: user.Type, Course: user.Course, Crits: crits, Ball: sumBall})
        }

            users.sort(function(obj1, obj2) {
                let diff = obj2.Ball-obj1.Ball;
                if (diff != 0)
                    return obj2.Ball-obj1.Ball;
                else {
                    for (crit of Object.keys(obj1.Crits)) {
                        diff = obj2.Crits[crit] - obj1.Crits[crit];
                        if (diff != 0) return diff
                    }
                    return 0
                }
            });


        XlsxPopulate.fromFileAsync(anketPath + "/docs/ResultTable.xlsx")
            .then(workbook => {
                try {
                    // Modify the workbook.
                    for (var i = 0; i < users.length; i++) {
                        var r = [];
                        r[0] = i + 1;
                        r[1] = users[i].Name;
                        r[2] = users[i].Type;
                        r[3] = users[i].Course;
                        for (var j = 0; j < Object.keys(users[i].Crits).length; j++) {
                            r.push(users[i].Crits[Object.keys(users[i].Crits)[j]])
                        }
                        r.push(users[i].Ball);
                        workbook.sheet(0).cell("A" + (i + 5)).value([r]);
                    }
                    for (var i = 1; i < 19; i++)
                        workbook.sheet(0).column(i).style("horizontalAlignment", "center");
                    workbook.sheet(0).column("B").style("horizontalAlignment", "left");
                    workbook.sheet(0).cell("B1").style("horizontalAlignment", "center");

                    workbook.toFileAsync(anketPath + "/docs/ResultTable2.xlsx").then(() => {
                        res.download(path.resolve(anketPath + "/docs/ResultTable2.xlsx"));
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


function getDateFromStr(d) {
    console.log(d);
    return (d.getDate()> 9 ? d.getDate() : '0' + d.getDate())  + "." + ((d.getMonth()+1) > 9 ? (d.getMonth()+1) : '0' + (d.getMonth()+1)) + "." + d.getFullYear();
}