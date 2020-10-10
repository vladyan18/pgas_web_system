const xlsx = require('xlsx');

module.exports = async function(sheet) {
    const Table = {};
    const Schema = {};
    const Limits = [];
    const lastCritInfo = {numTables: 0};

    const range = xlsx.utils.decode_range(sheet['!ref']);
    for (let row = range.s.r; row <= range.e.r; row++) {
        for (let col = range.s.c; col <= range.e.c; col++) {
            const cellValue = getCellValue(row, col, sheet);

            if (isValue(cellValue)) {
                if (!isMaxBallsCell(row, col, sheet)) {
                    attendInTable(cellValue, col, row, sheet, Table, lastCritInfo, Schema);
                } else {
                    Limits.push(cellValue);
                }
            }
        }
    }

    return {crits: Table, schema: Schema, limits: Limits};
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

function isCellUndefined(r, c, sheet) {
    return sheet[xlsx.utils.encode_cell({r: r, c: c})] === undefined;
}

function getCellValue(row, col, sheet) {
    const cell = sheet[xlsx.utils.encode_cell({r: row, c: col})];
    if (cell) {
        return cell.v;
    } else {
        return undefined;
    }
}

function isMaxBallsCell(r, c, sheet) {
    while (c >= 1) {
        const prevCellValue = getCellValue(r, c - 1, sheet);
        if (prevCellValue) {
            const isMaxBalls = prevCellValue.toString()
                .toUpperCase()
                .search('Максимальное количество баллов:'.toUpperCase()) !== -1;

            return isMaxBalls;
        }
        c--;
    }
    return false;
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
            if (!lastCritInfo.crit || (lastCritInfo.crit.toString().replace(/\s+/g, ' ').trim() !== critName.toString().replace(/\s+/g, ' ').trim())) {
                lastCritInfo.row = globalCategoryRowIndex;
                lastCritInfo.crit = critName;
                lastCritInfo.lastHeadRow = undefined;
            } else {
                globalCategoryRowIndex = lastCritInfo.row;
            }
        }
    } else lastCritInfo = {row: globalCategoryRowIndex, crit: getCellValue(globalCategoryRowIndex, 1, sheet).trim()};

    let currentColumnIndex = 1;
    let globalCategoryLastIndex = lastCritInfo.row;
    let globalCategoryLastName = lastCritInfo.crit.toString().replace(/\s+/g, ' ').trim();
    let leftColumnIndex = columnIndex;
    while (currentColumnIndex < (columnIndex - 1)) { // поиск критериев горизонтали
        let mergedRowIndex = rowIndex;
        while (mergedRowIndex > globalCategoryLastIndex && isCellUndefined(mergedRowIndex, currentColumnIndex, sheet)) {
            mergedRowIndex -= 1;
        }
        let critName = getCellValue(mergedRowIndex, currentColumnIndex, sheet);
        if (critName) critName = critName.trim();

        if (globalCategoryLastIndex < mergedRowIndex && (globalCategoryLastName !== critName.toString().replace(/\s+/g, ' ').trim())) {
            if (mergedRowIndex > globalCategoryLastIndex && mergedRowIndex > 247 && mergedRowIndex < 259) {
                globalCategoryLastName = critName;
            }
            globalCategoryLastIndex = mergedRowIndex;
        } else if (globalCategoryLastIndex > mergedRowIndex) mergedRowIndex = globalCategoryLastIndex;

        if (!isCellUndefined(mergedRowIndex, currentColumnIndex, sheet) && !isValue(getCellValue(mergedRowIndex, currentColumnIndex, sheet))) {
            const text = getCellValue(mergedRowIndex, currentColumnIndex, sheet).toString().replace(/\s+/g, ' ').trim();
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
            categoryList.splice(numberOfRowCategories, 0, getCellValue(currentRowIndex, mergedColumnIndex, sheet).toString().replace(/\s+/g, ' ').trim());
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
    // eslint-disable-next-line no-constant-condition
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


