import React, {Component} from 'react';
import '../../../style/user_main.css';
import {withRouter} from "react-router-dom";
import {css, jsx} from '@emotion/core';
import './tableStyles.css';
import { Statuses } from '../../../consts';
import Table from '../../common/table'

function needToShowConfirmationsAlert(row) {
    if (row.crit === '7а' || row.crit === '1 (7а)' || row.status === Statuses.ACCEPTED) return false;
    return (!row.confirmations || row.confirmations.length === 0);
}

const achievementFormatter = function(cell, row) {
  let statusTitle = null;
  if (row.status !== 'Принято на рассмотрение')
    statusTitle = <div style={{
    fontSize: "x-small",
    color: "#434343"
    }}>{row.status}</div>;

  return <div><span style={{marginRight: "1rem"}}><b>{ row.crit }</b></span>{ row.achievement }{statusTitle} {
      needToShowConfirmationsAlert(row) &&
      <span style={{color: '#ea0000', fontSize: 'small'}}>Не приложено подтверждение!</span>
  }</div>;
};


const columns = [
{
  dataField: 'achievement',
  text: 'Достижение',
  style: {width: '50%', textAlign: 'left', verticalAlign: 'middle'},
  headerStyle: {verticalAlign: 'middle', textAlign: 'left'},
  formatter: achievementFormatter,
}, {
  dataField: 'ball',
  text: 'Балл',
  style: {width: '10%', textAlign: 'right', verticalAlign: 'middle'},
  headerStyle: {verticalAlign: 'middle', textAlign: 'right'},
    formatter: (cell, row) => {
      if (row.ball !== undefined && row.ball !== null) {
          return <><b>{row.ball} </b>
              {(row.preliminaryBall && row.preliminaryBall !== row.ball) ? <i><span style={{color: 'grey', fontSize: 'small'}} title="Предварительный балл, может измениться">({row.preliminaryBall})</span></i> : ''}</>;
      }
      if (row.preliminaryBall) {
          return <i><span style={{color: 'grey'}} title="Предварительный балл, может измениться">{row.preliminaryBall}</span></i>
      }
    }
}, {
  dataField: 'comment',
  text: 'Комментарий',
  style: {maxWidth: '40%', textAlign: 'right', verticalAlign: 'middle', wordBreak: 'break-word'},
  headerStyle: {maxWidth: '30%', verticalAlign: 'middle', textAlign: 'right'},
}];

class CurrentAchievesTable extends Component {
    constructor(props) {
        super(props);
        this.rowEvents.onClick = this.rowEvents.onClick.bind(this);
    };

    rowEvents = {
        onClick: (e, row, rowIndex) => {
            this.props.history.push('/achievement/' + row._id.toString());
            //window.location.assign('/achievement/'+row._id.toString())
        }
    };

    rowClasses(row) {
    let baseClass = 'user-table__achieveRow';
    switch (row.status) {
      case Statuses.DECLINED:
        baseClass += ' user-table__declined-row';
        break;
      case Statuses.INCORRECT:
        baseClass += ' user-table__incorrect-row';
        break;
      case Statuses.CHANGED:
        baseClass += ' user-table__edited-row';
        break;
      case Statuses.CHANGED_AND_ACCEPTED:
      case Statuses.ACCEPTED:
        baseClass += ' user-table__accepted-row';
    }

       if (needToShowConfirmationsAlert(row)) {
           baseClass += ' without_confirmation';
       }
    return baseClass;
  };

    columnClasses(cell, row, rowIndex, colIndex) {
        if (colIndex == 2) return 'hideInMobile';
        else return ''
    }


    render() {
        if (this.props.currentAchieves && this.props.currentAchieves.length != 0)
            return (
                <div id="achBlock" style={{'display': 'block', 'overflow': 'auto'}}>
                    <div id="row_docs">
                        <Table keyField='_id' data={this.props.currentAchieves} columns={columns}
                                        rowEvents={this.rowEvents}
                                        headerClasses={"withoutTopBorder"}
                                        rowClasses={this.rowClasses}
                                        columnClasses={this.columnClasses}
bordered={false}
/>
                    </div>
                </div>
            );
        else return null
    }
}

export default withRouter(CurrentAchievesTable)
