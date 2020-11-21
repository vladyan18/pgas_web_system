// super-ultra-light version of react-bootstrap-table-next :)
import React from 'react';

function Cell({key, row, rowIndex, column}) {
    let value;
    if (column.dataField) {
        const path = column.dataField.split('.');
        value = row;
        for (let i = 0; i < path.length; i++) {
            value = value[path[i]];
        }
    }
    return <td key={key} style={column.style} className={getClassesStr(column.classes)}>{column.formatter ? column.formatter(value, row, rowIndex) : value}</td>;
}

function getRowEvents(rowEvents, row, rowIndex) {
    if (!rowEvents) return {};
    const rowEventsWrapped = {};
    for (const rowEvent of Object.keys(rowEvents)) {
        rowEventsWrapped[rowEvent] = (e) => rowEvents[rowEvent](e, row, rowIndex);
    }
    return rowEventsWrapped;
}

function getClassesStr(classes) {
    if (!classes) return '';
    if (!Array.isArray(classes)) return classes;
    let res = ' ';
    for (const cl of classes) {
        res += cl + ' ';
    }
    return res;
}

function Table({keyField, data, columns, rowEvents, rowClasses, headerClasses, columnClasses, classes, bordered}) {
    if (!data || data.length === 0) return null;
    return <table style={{width: '100%'}} className={'table' + getClassesStr(classes) + (bordered !== false ? ' table-bordered' : '')}>
        <thead>
            <tr className={headerClasses}>
            {columns.map((column) => <th key={column.text} style={column.headerStyle} className={getClassesStr(column.headerClasses)}>{column.text}</th>)}
            </tr>
        </thead>
        <tbody>
        {
            data.map((row, rowIndex) => <tr key={row[keyField]} className={rowClasses && rowClasses(row)} {...getRowEvents(rowEvents, row, rowIndex)}>
                {columns.map((column) => <Cell key={column.dataField} row={row} rowIndex={rowIndex} column={column}/>)}
            </tr>)
        }
        </tbody>
    </table>;
}

export default Table;
