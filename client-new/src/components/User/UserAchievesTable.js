import React from 'react';
import BootstrapTable from 'react-bootstrap-table-next';
import {useHistory} from 'react-router';
/** @jsx jsx */
import {css, jsx} from '@emotion/core';
import './tableStyles.css';

const achievementFormatter = function(cell, row) {
  let statusTitle = null;
  if (row.status !== 'Принято на рассмотрение')
    statusTitle = <div css={css`
    font-size: x-small;
    color: #434343;
    `}>{row.status}</div>;
  return <><span css={css`margin-right: 1rem;`}><b>{ row.crit }</b></span>{ row.achievement }{statusTitle}</>;
};

const columns = [{
  dataField: 'achievement',
  text: 'Достижение',
  style: {width: '60%', textAlign: 'left', verticalAlign: 'middle'},
  headerStyle: {verticalAlign: 'middle', textAlign: 'left'},
  formatter: achievementFormatter,
}, {
  dataField: 'ball',
  text: 'Балл',
  style: {width: '10%', textAlign: 'right', verticalAlign: 'middle'},
  headerStyle: {verticalAlign: 'middle', textAlign: 'right'},
}, {
  dataField: 'comment',
  text: 'Комментарий',
  style: {textAlign: 'left', verticalAlign: 'middle'},
  headerStyle: {verticalAlign: 'middle', textAlign: 'left'},
}];

const dataMock = [{
  _id: '1',
  crit: '9a',
  achievement: 'Волонтерство на ПММФТ 19',
  ball: 100,
  comment: 'Необходимо подтвердить дату',
},
{
  _id: '2',
  crit: '9a',
  achievement: 'Организация мероприятия "Гала-концерт" в рамках праздника "Неделя прикладной математики"',
  status: 'Принято',
  ball: 100,
  comment: 'тест',
},
{
  _id: '3',
  crit: '9a',
  achievement: 'test mock',
  comment: 'teeeest',
},
{
  _id: '4',
  crit: '9a',
  achievement: 'test mock',
}];

function UserAchievesTable(props) {
  const history = useHistory();

  const rowEvents = {
    onClick: (e, row) => {
      console.log('CLICK')
      history.push('/achievement/' + row._id.toString());
      // window.location.assign('/achievement/'+row._id.toString())
    },
  };

  const rowClasses = (row) => {
    const baseClass = 'user-table__achieveRow';
    switch (row.status) {
      case 'Отказано':
        return baseClass + ' user-table__declined-row';
      case 'Изменено':
        return baseClass + ' user-table__edited-row';
      case 'Принято с изменениями':
      case 'Принято':
        return baseClass + ' user-table__accepted-row';
    }
    return baseClass;
  };

  const columnClasses = (cell, row, rowIndex, colIndex) => {
    if (colIndex === 2) return 'hideInMobile';
    else return '';
  };


  // if (props.currentAchieves && props.currentAchieves.length != 0) {
  return (
    <div style={{'display': 'block', 'overflow': 'auto'}}>
      <div >
        <BootstrapTable keyField='_id' data={dataMock} columns={columns}
          style="border: unset;"
          rowEvents={rowEvents}
          rowClasses={rowClasses} columnClasses={columnClasses}
          bordered={false}
        />
      </div>
    </div>
  );
  // } else return null;
}

export default UserAchievesTable;
