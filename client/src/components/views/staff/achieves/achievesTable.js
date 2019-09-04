import React, {Component} from 'react';
import '../../../../style/user_main.css';
import BootstrapTable from 'react-bootstrap-table-next';
import {withRouter} from "react-router";

class AchievesTable extends Component {

    constructor(props) {
        super(props);
        this.accept = this.accept.bind(this);
        this.decline = this.decline.bind(this);
        this.edit = this.edit.bind(this);
    };

    actionsFormatter = (cell, row) => (
        <div style={{"display": "block"}}>
            <div style={{"width": "6rem"}}>
                <button style={{"width": "100%"}} type="button" className="btn btn-warning btn-sm" data-toggle="modal"
                        data-target="#exampleModal" onClick={(e) => this.edit(e, row._id)}>Изменить
                </button>
            </div>
            <div style={{"width": "6rem"}}>
                <button style={{"width": "100%"}} type="button" className="btn btn-danger btn-sm"
                        onClick={(e) => this.decline(e, row._id)}>Отклонить
                </button>
            </div>
            <div style={{"width": "6rem"}}>
                <button style={{"width": "100%"}} type="button" className="btn btn-success btn-sm"
                        onClick={(e) => this.accept(e, row._id)}>Принять
                </button>
            </div>
        </div>
    );

    columns = [{
        dataField: 'crit',
        text: 'Крит.'
    }, {
        dataField: 'achievement',
        text: 'Достижение'
    }, {
        dataField: 'chars',
        text: 'Хар-ки'
    }, {
        dataField: 'achDate',
        text: 'Дата'
    }, {
        dataField: 'status',
        text: 'Статус'
    }, {
        dataField: 'comment',
        text: 'Комментарий'
    }, {
        dataField: 'actions',
        text: '',
        isDummyField: true,
        csvExport: false,
        formatter: this.actionsFormatter,
    },
    ];

    rowClasses = (row, rowIndex) => {
        return '';
    };

    accept(e, id) {
        fetch("/api/AchSuccess", {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({Id: id})
        }).then((resp) => {
            if (resp.status === 200) {
                this.props.updater()
            }
        })
            .catch((error) => console.log(error))
    }

    decline(e, id) {
        fetch("/api/AchFailed", {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({Id: id})
        }).then((resp) => {
            if (resp.status === 200) {
                this.props.updater()
            }
        })
            .catch((error) => console.log(error))
    }


    edit(e, id) {

    }

    render() {
        return (
            <BootstrapTable keyField='_id' data={this.props.data} columns={this.columns}
                            rowClasses={this.rowClasses}></BootstrapTable>

        )
    }
}

export default withRouter(AchievesTable)