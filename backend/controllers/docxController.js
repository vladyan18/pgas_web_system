const db = require('./dbController')
const path = require('path')
const fs = require('fs')

const anketPath = path.join(__dirname, '..')
const studyDirections = {"ПМ-ПУ": 'Процессы управления'}

module.exports.getAnket = async function (req, res) {
    try {
        achievs = []

        if (req.user._json.email)
            user = await
        db.findUserById(req.user._json.email)
    else
        user = await
        db.findUserById(req.user.user_id)
        let W = user.Achievement
        for (let i of W) {
            let Ach = await
            db.findAchieveById(i)
            await
            achievs.push(Ach)
        }


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
        f06 = String(f06).replace("STDIR", studyDirections[user.Faculty]);
        datestring = user.Birthdate.getDate()  + "." + (user.Birthdate.getMonth()+1) + "." + user.Birthdate.getFullYear();
        f06 = String(f06).replace("BD", datestring);

        crits = ['1 (7а)', '2 (7б)', '3 (7в)', '4 (8а)', '5 (8б)', '6 (9а)', '7 (9б)', '8 (10а)', '9 (10б)', '10 (10в)', '11 (11а)', '12 (11б)', '13 (11в)']

        for (var i = 0; i < 13; i++) {
            curAchs = achievs.filter(o => o.crit == crits[i]);
            cStr = '<w:p w:rsidR="00560C7E" w:rsidRDefault="00E56E56"><w:pPr><w:snapToGrid w:val="0" /><w:jc w:val="center" /></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" /><w:b /><w:sz w:val="20" /><w:szCs w:val="20" /><w:lang w:val="en-US" /></w:rPr><w:t>A';

            if (curAchs.length == 0) {
                nStr = '<w:p w:rsidR="00560C7E" w:rsidRDefault="00E56E56"><w:pPr><w:snapToGrid w:val="0" /><w:jc w:val="center" /></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" /><w:b /><w:sz w:val="20" /><w:szCs w:val="20" /><w:lang w:val="en-US" /></w:rPr><w:t>Нет</w:t></w:r></w:p>';
                f06 = String(f06).replace(cStr + (i + 1) + '</w:t></w:r></w:p>', nStr);
            }
            else {
                str = "";
                let num = 1;
                proofStr = '<w:p w:rsidR="00560C7E" w:rsidRDefault="00E56E56"><w:pPr><w:snapToGrid w:val="0" /><w:jc w:val="left" /></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" /><w:sz w:val="20" /><w:szCs w:val="20" /><w:lang w:val="en-US" /></w:rPr><w:t>УКАЗАТЬ ПОДТВЕРЖДЕНИЕ</w:t></w:r></w:p>';
                for (ach of curAchs) {
                    if (i == 0) str = '<w:p w:rsidR="00560C7E" w:rsidRDefault="00E56E56"><w:pPr><w:snapToGrid w:val="0" /><w:jc w:val="center" /></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" /><w:b /><w:sz w:val="20" /><w:szCs w:val="20" /><w:lang w:val="en-US" /></w:rPr><w:t>Да</w:t></w:r></w:p>';
                    else {
                        str += '<w:p w:rsidR="00560C7E" w:rsidRDefault="00E56E56"><w:pPr><w:snapToGrid w:val="0" /><w:jc w:val="left" /></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" /><w:b /><w:sz w:val="20" /><w:szCs w:val="20" /><w:lang w:val="en-US" /></w:rPr><w:t>'
                            + ((num != 1) ? '<w:br />' : '') + num + '. ' + ach.achievement + '</w:t></w:r></w:p>';
                        charsStr = '<w:p w:rsidR="00560C7E" w:rsidRDefault="00E56E56"><w:pPr><w:snapToGrid w:val="0" /><w:jc w:val="left" /></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" /><w:i /><w:sz w:val="15" /><w:szCs w:val="15" /><w:lang w:val="en-US" /></w:rPr><w:t>'
                        for (var c = 0; c < ach.chars.length; c++) {
                            if (c > 0) charsStr += ', ';
                            charsStr += ach.chars[c]
                        }

                        str += charsStr + '</w:t></w:r></w:p>'

                        str += proofStr;
                    }

                    num += 1;
                }

                f06 = String(f06).replace(cStr + (i + 1) + '</w:t></w:r></w:p>', str);
            }
        }

        zip.file('word/document.xml', f06)

        fs.writeFileSync(anketPath + "/docs/result/" + user._id + "_anketa.docx", zip.generate({
            base64: false,
            compression: 'DEFLATE'
        }), 'binary');

        res.download(path.resolve(anketPath + "/docs/result/" + user._id + "_anketa.docx"));
    }
    catch (err) {
        console.log(err)
        res.status(500).send(err)
    }

}