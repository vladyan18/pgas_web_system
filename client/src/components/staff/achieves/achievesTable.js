import React, {Component} from 'react';
import '../../../style/user_main.css';
import {withRouter} from "react-router-dom";
import {fetchSendObj, fetchSendWithoutRes} from "../../../services/fetchService";
import AchievesComment from "./achievesComment";
import {OverlayTrigger, Popover} from "react-bootstrap";
import Table from '../../common/table'
import staffContextStore from "../../../stores/staff/staffContextStore";
import userPersonalStore from '../../../stores/userPersonalStore';
import ReactMarkdown from 'react-markdown';
import {Statuses} from "../../../../../common/consts";
import ChangeStatusButton from "./changeStatusButton";
import HideIfForMyself from "./HideIfForMyself";
import HideForObserver from "./HideIfForObserver";

function needToShowConfirmationsAlert(row) {
    if (row.crit === '7а' || row.crit === '1 (7а)' || row.status === Statuses.DECLINED) return false;
    return (!row.confirmations || row.confirmations.length === 0);
}

async function changeAchieveStatus(endPoint, id, userId, updater) {
    const resp = await fetchSendObj(endPoint, {Id: id, UserId: userId});

    if (resp) {
        console.log(resp);
        updater();
        return true;
    } else {
        return false;
    }
}

class AchievesTable extends Component {

    constructor(props) {
        super(props);
        this.state = {};
        this.accept = this.accept.bind(this);
        this.decline = this.decline.bind(this);
        this.edit = this.edit.bind(this);
        this.handleCommentChange = this.handleCommentChange.bind(this);
        this.auto_grow = this.auto_grow.bind(this);
        this.statusFormatter = this.statusFormatter.bind(this);
    };

    auto_grow(e) {
        e.target.style.height = "5px";
        e.target.style.height = (e.target.scrollHeight)+"px";
    }

    statusFormatter = (cell, row) => (
        <span>{row.status}{(row.isPendingChanges ? <span style={{color: 'blue'}} title='Пользователь догрузил документ'>*</span> : null)}
            {(row.ball !== undefined && row.ball !== null ? '('+row.ball+')': '')}</span>
    );

    charsFormatter = (cell, row) =>
        (   <>
                {needToShowConfirmationsAlert(row) && <span style={{color: 'red'}}>Нет подверждений</span>}
            <div style={{"display": "flex", 'flexWrap': "wrap", "maxWidth": "20rem"}}>
                {row.chars.map((x) => {
                    let str = x;
                    if (str.length > 35) {
                        str = x.substr(0, 15) + '...' + x.substr(x.length - 15, 15)
                    }
                    return (<div key={row._id.toString() + x} className="charsItem">{str}</div>)
                })}
            </div>
            </>
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
            <HideForObserver>
                <HideIfForMyself userId={this.props.userOuterId}>
                    <div style={{"width": "100%", display: "flex", justifyContent: "center", marginBottom: "1rem"}}>
                        <ChangeStatusButton cb={this.decline} id={row._id} iconClass={"fa fa-times redText custom_icon_button"}/>
                    </div>
                    <div style={{"width": "100%", display: "flex", justifyContent: "center"}}>
                        <ChangeStatusButton cb={this.accept} id={row._id} iconClass={"fa fa-check greenText custom_icon_button"}/>
                    </div>
                </HideIfForMyself>
            </HideForObserver>
        </div>
    );

    allowAccessPopover = (crit) => (
        <Popover id="popover-basic" style={{width: "120rem"}}>
            <Popover.Title as="h3">Критерий {crit}</Popover.Title>
            <Popover.Content>
                {staffContextStore.annotations && <ReactMarkdown linkTarget={() => '_blank'} source={staffContextStore.annotations[crit]}/>}
            </Popover.Content>
        </Popover>
    );

    columns = [{
        dataField: 'crit',
        style: {width: "5%", textAlign: "center", verticalAlign: "middle"},
        text: 'Крит.',
        formatter: (cell, row) => (<>
            <OverlayTrigger trigger={['hover', 'focus']} placement="right"
                            overlay={this.allowAccessPopover(row.crit)} >
            {<span style={{textDecoration:"underline", textDecorationStyle: "dotted"}}>{row.crit}</span>}
            </OverlayTrigger>
        </>),
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
        let className = '';

        if (row.isPendingChanges) {
            className = 'pendingChanges ';
        }
        if (row.status === 'Отказано')
           className += 'declined-row';
        if (row.status === 'Изменено')
            className += 'edited-row';
        if (row.status === 'Принято' || row.status === 'Принято с изменениями') {
            if (this.props.systematicsConflicts && this.props.systematicsConflicts.some((x) => x.crit === row.crit)) {
                className += ' systematicsFailed ';
            }
            className += 'accepted-row';
        }
        return className;
    };

    async accept(e, id) {
        return changeAchieveStatus("/AchSuccess", id, this.props.userId, this.props.updater);
    }

    async decline(e, id) {
        return changeAchieveStatus("/AchFailed", id, this.props.userId, this.props.updater);
    }


    edit(e, id) {
        this.props.openModal(id);
        e.stopPropagation()
    }

    handleCommentChange(e, id) {
        document.getElementById(id).defaultValue = this.newComments[id];
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
            filteredAchieves = this.props.data.filter(x => (x.status !== 'Принято' && x.status !== 'Принято с изменениями'))
        }
        else filteredAchieves = this.props.data;
        return (
            <div className="adminAchievesTableContainer">
                <Table keyField='_id' data={filteredAchieves} columns={this.columns}
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