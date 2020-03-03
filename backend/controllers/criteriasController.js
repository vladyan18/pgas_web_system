const adminController = require( './adminController');
const db = require('./dbController');
const path = require('path');
const fs = require('fs');
const upload = require(path.join(__dirname, '../config/multer'));
const uploadsPath = path.join(__dirname, '../docs/');
const xlsx = require('xlsx');


module.exports.upload = async function(req, res) {
  if (!req.isAuthenticated() || req.user.Role !== 'SuperAdmin') return res.sendStatus(404);
  if (!fs.existsSync(uploadsPath)) {
    fs.mkdirSync(uploadsPath);
  }

  upload(req, res, async function(err) {
    // try {
    if (err) {
      return res.status(400).send('ERROR: Max file size = 15MB');
    }

    const workbook = xlsx.readFile(req.file.path);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const result = parseCrits(worksheet);
    res.status(200).send(result);
    fs.unlink(req.file.path, (err) => {
      if (err) console.log(err);
    });
    // } catch (e) {
    //    return res.status(500).send()
    // }
  });
};

module.exports.uploadAnnotationsToFaculty = async function(req, res) {
  await db.uploadAnnotationsToFaculty(req.body.annotations, req.body.learningProfile, req.body.faculty);
  return res.sendStatus(200);
};

module.exports.getAnnotationsForFaculty = async function(req, res) {
  const annotations = await db.getAnnotationsForFaculty(req.query.faculty);
  if (annotations && (annotations.AnnotationsToCrits || annotations.LearningProfile) ) {
    const result = {};
    result.annotations = annotations.AnnotationsToCrits;
    result.learningProfile = annotations.LearningProfile;
    return res.status(200).send(result);
  } else return res.sendStatus(404);
};

module.exports.saveCriteriasForFaculty = async function (req, res) {
    await db.UploadCriteriasToFaculty(req.body.crits, req.body.faculty);
    //checkActualityOfUsersAchievements(req.body.faculty).then(() => console.log('Check finished'));

  return res.sendStatus(200);
};

const checkActualityOfUsersAchievements = async function(faculty) {
  const users = (await db.getUsersWithAllInfo(faculty, false)).concat(await db.getUsersWithAllInfo(faculty, true));
  const crits = await db.getCriterias(faculty, true);

  console.log(faculty);
  console.log(Object.keys(crits));
  for (const user of users) {
    for (const achievement of user.Achievement) {
      await db.checkActualityOfAchievementCharacteristics(achievement, crits);
    }
    await adminController.balls(user.id, faculty);
  }
};

module.exports.getCriterias = async function(req, res) {
  try {
    const criterias = await db.getCriterias(req.query.faculty);
    if (criterias) {
      res.status(200).send(criterias.Crits);
    } else res.status(404).send({Error: 404, facultyRawName: req.user.facultyRawName});
  } catch (e) {
    res.status(500).send(e);
  }
};

module.exports.getCriteriasAndSchema = async function(req, res) {
  try {
    const criterias = await db.getCriteriasAndSchema(req.query.faculty);
    if (criterias) {
      res.status(200).send(criterias);
    } else res.status(404).send({});
  } catch (e) {
    res.status(500).send(e);
  }
};

function isValue(str) { // проверка содержатся ли в ячейке баллы
  if (str === '' || str === undefined || str === null) return false;
  str = str.toString();
  const l = str.length;

  for (let i = 0; i < l; i++) {
    if (!/[\d|\s,.]/i.test(str[i])) return false;
  }
  return true;
}

function listing(str) { // преобразование ячейки с баллами в list
  const list = [];
  let lastIndex = -1;
  let lastIsDigit = false;
  let hadComma = false;
  let numOfDigit = 1;
  str = str.toString();
  str = str.replace(' ', '');
  for (const symbol of str) {
    if (!isNaN(Number.parseInt(symbol))) {
      if (lastIsDigit && !hadComma) {
        list[lastIndex] = list[lastIndex] * 10 + Number.parseInt(symbol);
      } else {
        if (hadComma) {
          list[lastIndex] = list[lastIndex] + Number.parseInt(symbol) / (10 ** numOfDigit);
          numOfDigit += 1;
        } else {
          list.push(Number.parseInt(symbol));
          lastIndex += 1;
        }
        lastIsDigit = true;
      }
    } else {
      if (symbol === ',' || symbol === '.') {
        hadComma = true;
      } else {
        hadComma = false;
        numOfDigit = 1;
      }
      lastIsDigit = false;
    }
  }
  return list;
}

function ierarchyAttend(prevRep, currentRepIndex, categoryList, value) {
  const l = categoryList.length;
  while (currentRepIndex < (l - 1)) {
    prevRep[categoryList[currentRepIndex]] = {};
    prevRep = prevRep[categoryList[currentRepIndex]];
    currentRepIndex += 1;
  }
  prevRep[categoryList[currentRepIndex]] = value;
}

function getCellValue(row, col, sheet) {
  const cell = sheet[xlsx.utils.encode_cell({r: row, c: col})];
  if (cell) {
    return cell.v;
  } else {
    return undefined;
  }
}

function isCellUndefined(r, c, sheet) {
  return sheet[xlsx.utils.encode_cell({r: r, c: c})] === undefined;
}

function addToSchema(categoryList, typesList, schema) {
  const l = categoryList.length;
  let i = 0;
  while (i < (l - 1)) {
    if (!schema[categoryList[i]]) {
      schema[categoryList[i]] = {};
    }
    if (!schema['META']) {
      schema['META'] = typesList[i];
    }

    schema = schema[categoryList[i]];
    i += 1;
  }
  if (!schema[categoryList[i]]) {
    schema[categoryList[i]] = {};
  }
  if (!schema['META']) {
    schema['META'] = typesList[i];
  }
}

function attendInTable(cellValue, columnIndex, rowIndex, sheet, Table, lastCritInfo, schema) { // добавление ячейки с баллами в словарь
  const value = listing(cellValue);
  const categoryList = [];
  const typesList = [];
  let numberOfRowCategories = 0;
  let globalCategoryRowIndex = rowIndex;

  while (globalCategoryRowIndex > 1 && isCellUndefined(globalCategoryRowIndex, 1, sheet)) {
    globalCategoryRowIndex -= 1;
  }

  if (lastCritInfo) {
    if (lastCritInfo.row !== globalCategoryRowIndex) {
      const critName = getCellValue(globalCategoryRowIndex, 1, sheet);
      if (!lastCritInfo.crit || (lastCritInfo.crit.toString().replace(/\s+/g, ' ') !== critName.toString().replace(/\s+/g, ' '))) {
        lastCritInfo.row = globalCategoryRowIndex;
        lastCritInfo.crit = critName;
        lastCritInfo.lastHeadRow = undefined;
      } else {
        globalCategoryRowIndex = lastCritInfo.row;
      }
    }
  } else lastCritInfo = {row: globalCategoryRowIndex, crit: getCellValue(globalCategoryRowIndex, 1, sheet)};

  let currentColumnIndex = 1;
  let globalCategoryLastIndex = lastCritInfo.row;
  let globalCategoryLastName = lastCritInfo.crit.toString().replace(/\s+/g, ' ');
  let leftColumnIndex = columnIndex;
  while (currentColumnIndex < (columnIndex - 1)) { // поиск критериев горизонтали
    let mergedRowIndex = rowIndex;
    while (mergedRowIndex > globalCategoryLastIndex && isCellUndefined(mergedRowIndex, currentColumnIndex, sheet)) {
      mergedRowIndex -= 1;
    }
    const critName = getCellValue(mergedRowIndex, currentColumnIndex, sheet);

    if (globalCategoryLastIndex < mergedRowIndex && (globalCategoryLastName !== critName.toString().replace(/\s+/g, ' '))) {
      if (mergedRowIndex > globalCategoryLastIndex && mergedRowIndex > 247 && mergedRowIndex < 259) {
        globalCategoryLastName = critName;
      }
      globalCategoryLastIndex = mergedRowIndex;
    } else if (globalCategoryLastIndex > mergedRowIndex) mergedRowIndex = globalCategoryLastIndex;

    if (!isCellUndefined(mergedRowIndex, currentColumnIndex, sheet) && !isValue(getCellValue(mergedRowIndex, currentColumnIndex, sheet))) {
      const text = getCellValue(mergedRowIndex, currentColumnIndex, sheet).toString().replace(/\s+/g, ' ');
      categoryList.push(text);
      typesList.push({type: 'r'});
      numberOfRowCategories += 1;
    }
    if (isValue(getCellValue(mergedRowIndex, currentColumnIndex, sheet))) {
      leftColumnIndex = currentColumnIndex;
      break;
    }
    currentColumnIndex += 1;
  }
  let currentRowIndex = rowIndex - 1;
  let lastCategory = false;
  while (currentRowIndex >= globalCategoryRowIndex) { // поиск критериев по вертикали
    let mergedColumnIndex = columnIndex;
    while (mergedColumnIndex > leftColumnIndex && isCellUndefined(currentRowIndex, mergedColumnIndex, sheet)) {
      mergedColumnIndex -= 1;
    }
    if (!isCellUndefined(currentRowIndex, mergedColumnIndex, sheet) && !isValue(getCellValue(currentRowIndex, mergedColumnIndex, sheet))) {
      categoryList.splice(numberOfRowCategories, 0, getCellValue(currentRowIndex, mergedColumnIndex, sheet).toString().replace(/\s+/g, ' '));
      if (!lastCritInfo.lastHeadRow) lastCritInfo.lastHeadRow = currentRowIndex;
      typesList.push({type: 'c'});
      if (lastCritInfo.lastHeadRow < currentRowIndex) {
        lastCritInfo.lastHeadRow = currentRowIndex;
        typesList[2].isNewSubTable = true;
      }

      lastCategory = true;
    }
    if (isValue(getCellValue(currentRowIndex, mergedColumnIndex, sheet)) && lastCategory) {
      break;
    }
    currentRowIndex -= 1;
  }

  let prevRep = Table;
  let currentRepIndex = 0;

  addToSchema(categoryList, typesList, schema);
  while (true) {
    if (!(categoryList[currentRepIndex] in prevRep)) {
      ierarchyAttend(prevRep, currentRepIndex, categoryList, value);
      break;
    } else {
      prevRep = prevRep[categoryList[currentRepIndex]];
      currentRepIndex += 1;
    }
  }
}


function isMaxBallsCell(r, c, sheet) {
  while (c >= 1) {
    const prevCellValue = getCellValue(r, c - 1, sheet);
    if (prevCellValue) {
      return prevCellValue.toString()
          .toUpperCase()
          .search('Максимальное количество баллов:'.toUpperCase()) !== -1;
    }
    c--;
  }
  return false;
}

function parseCrits(sheet) {
  const Table = {};
  const Schema = {};
  const lastCritInfo = {numTables: 0};

  const range = xlsx.utils.decode_range(sheet['!ref']);
  const start = new Date().getTime();
  for (let row = range.s.r; row <= range.e.r; row++) {
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cellValue = getCellValue(row, col, sheet);

      if (isValue(cellValue) && !isMaxBallsCell(row, col, sheet)) {
        attendInTable(cellValue, col, row, sheet, Table, lastCritInfo, Schema);
      }
    }
  }

  const end = new Date().getTime();
  console.log('SecondWay: ' + (end - start).toString() + ' ms');
  return {crits: Table, schema: Schema};
}


