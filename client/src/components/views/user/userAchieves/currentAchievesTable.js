import React, {Component} from 'react';
import '../../../../style/user_main.css';
import BootstrapTable from 'react-bootstrap-table-next';
import {withRouter} from "react-router";


const columns = [{
    dataField: 'crit',
    text: 'Критерий'
}, {
    dataField: 'achievement',
    text: 'Достижение'
}, {
    dataField: 'status',
    text: 'Статус'
}, {
    dataField: 'ball',
    text: 'Балл'
}, {
    dataField: 'comment',
    text: 'Комментарий'
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
        return 'achieveRow';
    };

    render() {
        if (this.props.currentAchieves && this.props.currentAchieves.length != 0)
            return (
                <block_1 id="achBlock" style={{'display': 'block', 'overflow': 'auto'}}>
                    <div id="row_docs" className='block_1'>
                        <BootstrapTable keyField='_id' data={this.props.currentAchieves} columns={columns}
                                        rowEvents={this.rowEvents}
                                        rowClasses={this.rowClasses}></BootstrapTable>
                    </div>
                </block_1>
            );
        else return null
    }
}

export default withRouter(CurrentAchievesTable)