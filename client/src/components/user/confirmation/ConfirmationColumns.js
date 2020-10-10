import React from 'react';

const types = {'link': 'Ссылка', 'doc': 'Документ', 'SZ': 'Служ. записка'};
const columns = [{
  dataField: 'Type',
  text: 'Тип',
  style: {width: '10%', fontSize: 'small'},
  formatter: (cell, row) => {
    if (row.Type == 'link') {
      if (row.Data.startsWith('https://elibrary.ru/item.asp?id=') || row.Data.startsWith('elibrary.ru/item.asp?id=')) {
        return 'e-library';
      }
    }
    return types[row.Type];
  },
},
  {
  dataField: 'Data',
  text: 'Подтверждение',
  style: {width: '40%', overflow: 'hidden'},
  formatter: (cell, row) => {
    if (row.Type == 'SZ') {
      return (<div style={{fontSize: 'small'}}>{row.Name}
        {row.SZ ? (row.SZ.Appendix ? ', прил. ' + row.SZ.Appendix : '') : ''}
        {row.SZ ? (row.SZ.Paragraph ? ', п. ' + row.SZ.Paragraph : '') : ''}
      </div>);
    } else {
      return (<div style={{overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '18rem', fontSize: 'small'}}>
        <a href={row.Data} onClick={(e) => e.stopPropagation()} target="_blank" rel="noopener noreferrer">{row.Name}</a>
        <br/>{row.additionalInfo}</div>);
    }
  },
}, {
  isDummyField: true,
  text: 'Размер',
  formatter: (cell, row) => {
    if (row.Type == 'doc') {
      return <span>{(row.Size / 1024 / 1024).toFixed(2)} Мб</span>;
    }
    return '';
  },
},,
  {
    dataField: 'CreationDate',
    text: 'Дата загрузки',
    style: {},
    formatter: (cell, row) => {
      return getDate(row.CreationDate);
    },
  }];

function getDate(d) {
  if (!d) return undefined;
  d = new Date(d);
  return (d.getDate() > 9 ? d.getDate() : '0' + d.getDate()) + '.' + ((d.getMonth() + 1) > 9 ? (d.getMonth() + 1) : '0' + (d.getMonth() + 1)) + '.' + d.getFullYear();
}

export {columns as ConfirmationColumns};
