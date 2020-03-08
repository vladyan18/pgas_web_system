import React, {Component} from 'react';
import '../../../../style/user_main.css';
import BootstrapTable from 'react-bootstrap-table-next';
import {withRouter} from "react-router-dom";
import {fetchSendWithoutRes} from "../../../../services/fetchService";
import {observer} from "mobx-react";
import AchievesComment from "./achievesComment";

class AchievesTable extends Component {

    constructor(props) {
        super(props);
        this.state = {};
        this.accept = this.accept.bind(this);
        this.decline = this.decline.bind(this);
        this.edit = this.edit.bind(this);
        this.handleCommentChange = this.handleCommentChange.bind(this);
        this.auto_grow = this.auto_grow.bind(this);
    };

    auto_grow(e) {
        e.target.style.height = "5px";
        e.target.style.height = (e.target.scrollHeight)+"px";
    }

    statusFormatter = (cell, row) => (
        row.status + (row.ball !== undefined && row.ball !== null ? '('+row.ball+')': '')
    );

    charsFormatter = (cell, row) =>
        (
            <div style={{"display": "flex", 'flexWrap': "wrap", "maxWidth": "20rem"}}>
                {row.chars.map((x) => {
                    let str = x;
                    if (str.length > 35) {
                        str = x.substr(0, 15) + '...' + x.substr(x.length - 15, 15)
                    }
                    return (<div key={row._id.toString() + x} className="charsItem">{str}</div>)
                })}
            </div>
        );

    newComments = {};
    commentsFormatter = (cell, row) => <AchievesComment row={row} updater={this.props.updater}/>;

    actionsFormatter = (cell, row) => (
        <div style={{"display": "block"}}>
            <div style={{"width": "100%", display: "flex", justifyContent: "center", marginBottom: "1rem", padding: "0.1rem"}}>
                <button type="button" className="custom_button centered_hor" data-toggle="modal"
                        data-target="#exampleModal" onClick={(e) => this.edit(e, row._id)}><i style={{paddingLeft: "0.5rem"}}
                                                                                              className="fa fa-edit editText custom_icon_button"/>
                </button>
            </div>
            <div style={{"width": "100%", display: "flex", justifyContent: "center", marginBottom: "1rem"}}>
                <button type="button" className="custom_button centered_hor"
                        onClick={(e) => this.decline(e, row._id)}><i className="fa  fa-times redText custom_icon_button"/>
                </button>
            </div>
            <div style={{"width": "100%", display: "flex", justifyContent: "center"}}>
                <button type="button" className="custom_button centered_hor"
                        onClick={(e) => this.accept(e, row._id)}><i style={{paddingLeft: "0.2rem"}} className="fa fa-check greenText custom_icon_button"/>
                </button>
            </div>
        </div>
    );

    columns = [{
        dataField: 'crit',
        style: {width: "5%", textAlign: "center", verticalAlign: "middle"},
        text: 'Крит.'
    }, {
        dataField: 'achievement',
        text: 'Достижение',
        style: {width: "30%", verticalAlign: "middle"},
    }, {
        dataField: 'chars',
        isDummyField: true,
        text: 'Хар-ки',
        style: {verticalAlign: "middle", width: "20%"},
        formatter: this.charsFormatter,
    }, {
        dataField: 'achDate',
        text: 'Дата',
        style: {width: "5%", textAlign: "center", verticalAlign: "middle"},
        formatter: (cell, row) => (<>
            {row.achDate && <>{getDate(row.achDate)}</>}
        </>),
    }, {
        dataField: 'status',
        style: {width: "5%", textAlign: "center", fontSize: "small", verticalAlign: "middle"},
        text: 'Статус',
        formatter: this.statusFormatter,
    }, {
        dataField: 'comments',
        text: 'Комментарий',
        isDummyField: true,
        csvExport: false,
        formatter: this.commentsFormatter,
    }, {
        dataField: 'actions',
        text: '',
        isDummyField: true,
        style: { width: "1rem", backgroundColor: "white" },
        csvExport: false,
        formatter: this.actionsFormatter,
    },
    ];

    rowClasses = (row, rowIndex) => {
        if (row.status === 'Отказано')
            return 'declined-row';
        if (row.status === 'Изменено')
            return 'edited-row';
        if (row.status === 'Принято' || row.status === 'Принято с изменениями')
            return 'accepted-row';
        else return ''
    };

    accept(e, id) {
        fetch("/api/AchSuccess", {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({Id: id, UserId: this.props.userId})
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
            body: JSON.stringify({Id: id, UserId: this.props.userId})
        }).then((resp) => {
            if (resp.status === 200) {
                this.props.updater()
            }
        })
            .catch((error) => console.log(error))
    }


    edit(e, id) {
        this.props.openModal(id);
        e.stopPropagation()
    }

    handleCommentChange(e, id) {
        document.getElementById(id).defaultValue = this.newComments[id];
        console.log(this.newComments[id]);
        fetchSendWithoutRes('/api/comment', {Id: id, comment: this.newComments[id]}).then( () => {
                this.props.updater()
            }
        );
        e.preventDefault()
    }

    render() {
        let filteredAchieves;
        if (this.props.filters.hideCheckedAchieves)
        {
            filteredAchieves = this.props.data.filter(x => (x.status != 'Принято' && x.status != 'Принято с изменениями'))
        }
        else filteredAchieves = this.props.data;
        return (
            <div className="adminAchievesTableContainer">
                <BootstrapTable keyField='_id' data={filteredAchieves} columns={this.columns}
                                rowClasses={this.rowClasses}/>
            </div>
        )
    }
}

function getDate(d) {
    if (!d) return undefined;
    d = new Date(d);
    return (d.getDate() > 9 ? d.getDate() : '0' + d.getDate()) + "." + ((d.getMonth() + 1) > 9 ? (d.getMonth() + 1) : '0' + (d.getMonth() + 1)) + "." + d.getFullYear();
}

export default withRouter(AchievesTable)