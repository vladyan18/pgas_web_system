import React, {Component} from 'react';
import '../../../../style/user_main.css';
import BootstrapTable from 'react-bootstrap-table-next';
import {withRouter} from "react-router-dom";
import {css, jsx} from '@emotion/core';
import './tableStyles.css';

const achievementFormatter = function(cell, row) {
  let statusTitle = null;
  if (row.status !== 'Принято на рассмотрение')
    statusTitle = <div style={{
    fontSize: "x-small",
    color: "#434343"
    }}>{row.status}</div>;
  return <><span style={{marginRight: "1rem"}}><b>{ row.crit }</b></span>{ row.achievement }{statusTitle}</>;
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

    columnClasses(cell, row, rowIndex, colIndex) {
        if (colIndex == 2) return 'hideInMobile';
        else return ''
    }


    render() {
        if (this.props.currentAchieves && this.props.currentAchieves.length != 0)
            return (
                <div id="achBlock" style={{'display': 'block', 'overflow': 'auto'}}>
                    <div id="row_docs">
                        <BootstrapTable keyField='_id' data={this.props.currentAchieves} columns={columns}
                                        rowEvents={this.rowEvents}
                                        rowClasses={this.rowClasses} columnClasses={this.columnClasses}
bordered={false}
/>
                    </div>
                </div>
            );
        else return null
    }
}

export default withRouter(CurrentAchievesTable)
