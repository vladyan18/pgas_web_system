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
}, {
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
        <a href={row.Data} onClick={(e) => e.stopPropagation()} target="_blank">{row.Name}</a>
        <br/>{row.additionalInfo}</div>);
    }
  },
}, {
  isDummyField: true,
  formatter: (cell, row) => {
    if (row.Type == 'doc') {
      return <span>{(row.Size / 1024 / 1024).toFixed(2)} Мб</span>;
    }
    if (row.Type == 'link') {
      if (row.Data.startsWith('https://elibrary.ru/item.asp?id=') || row.Data.startsWith('elibrary.ru/item.asp?id=')) {
        if (row.CrawlResult) {
          return (
            <div style={{display: 'flex', justifyContent: 'space-between', fontSize: 'x-small'}}>
              {row.CrawlResult.title ? <div style={{maxWidth: '10rem', fontSize: 'xx-small'}}>
                <div>"{row.CrawlResult.title.toLowerCase()}"</div>
                <div><i>{row.CrawlResult.magazine ? row.CrawlResult.magazine.toLowerCase() : ''}</i>
                </div>
              </div> : ''}
              <div style={{width: '100%', marginLeft: '0.5rem'}}>
                <div style={{display: 'flex', justifyContent: 'space-between'}}>
                  {row.CrawlResult.inRINC ?
                                        <div className="greenText">В РИНЦе <i className="fa fa-check"/></div> :
                                        <div className="redText">Не в РИНЦе<i className="fa fa-times"/></div>}
                  {row.CrawlResult.isAuthor ?
                                        <div className="greenText">Указан в авторах <i className="fa fa-check"/>
                                        </div> :
                                        <div className="redText">Не указан в авторах<i className="fa fa-times"/>
                                        </div>}
                </div>
                {row.CrawlResult.year ? <div style={{fontSize: 'small', merginTop: '0.5rem'}}>
                  <b>Год: {row.CrawlResult.year}</b></div> : ''}
              </div>
            </div>


          );
        } else return (<div style={{color: '#505050'}}>Нет информации из e-library</div>);
      }
    }
    return '';
  },
}];

export {columns as ConfirmationColumns};
