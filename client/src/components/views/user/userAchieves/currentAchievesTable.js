import React, {Component} from 'react';
import '../../../../style/user_main.css';
import BootstrapTable from 'react-bootstrap-table-next';
import {withRouter} from "react-router";


const columns = [{
    dataField: 'crit',
    text: 'Критерий',
    style: {width: "8%", textAlign: "center", verticalAlign: "middle"},
    headerStyle: {fontSize: "x-small", verticalAlign: "middle", textAlign: "center"}
}, {
    dataField: 'achievement',
    text: 'Достижение',
    style: {width: "40%", textAlign: "left", verticalAlign: "middle"},
    headerStyle: {verticalAlign: "middle", textAlign: "center"}
}, {
    dataField: 'status',
    hidden: window.screen.width < 700,
    text: 'Статус',
    style: {width: "15%", textAlign: "center", verticalAlign: "middle"},
    headerStyle: {verticalAlign: "middle", textAlign: "center"},
}, {
    dataField: 'ball',
    text: 'Балл',
    style: {width: "10%", textAlign: "center", verticalAlign: "middle"},
    headerStyle: {verticalAlign: "middle", textAlign: "center"}
}, {
    dataField: 'comment',
    text: 'Комментарий',
    style: {textAlign: "left"},
    headerStyle: {verticalAlign: "middle", textAlign: "center"}
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

    rowClasses = (row, rowIndex) => {
        if (row.status == 'Отказано')
            return 'achieveRow declined-row';
        if (row.status == 'Принято' || row.status == 'Принято с изменениями')
            return 'achieveRow accepted-row';
        else return 'achieveRow'
    };

    columnClasses(cell, row, rowIndex, colIndex) {
        if (colIndex == 2) return 'hideInMobile';
        else return ''
    }


    render() {
        if (this.props.currentAchieves && this.props.currentAchieves.length != 0)
            return (
                <block_1 id="achBlock" style={{'display': 'block', 'overflow': 'auto'}}>
                    <div id="row_docs" className='block_1'>
                        <BootstrapTable keyField='_id' data={this.props.currentAchieves} columns={columns}
                                        rowEvents={this.rowEvents}
                                        rowClasses={this.rowClasses} columnClasses={this.columnClasses}/>
                    </div>
                </block_1>
            );
        else return null
    }
}

export default withRouter(CurrentAchievesTable)