import React, {Component} from 'react';
import '../../../style/user_main.css';
import Table from '../../common/table'
import staffContextStore from "../../../stores/staff/staffContextStore";
import {withRouter} from "react-router-dom";
/** @jsx jsx */
import {css, jsx} from '@emotion/core';
import styled from '@emotion/styled';
import MainPanel from "../components/mainPanel";
import criteriasStore from "../../../stores/criteriasStore";

function getAreaNum(critName, criterias) {
    const critNum = Object.keys(criterias).indexOf(critName);
    if (critNum === -1) return undefined;
    const shift = Object.keys(criterias).length === 12 ? 0 : 1;

    if (critNum < 3) return 0;
    if (critNum < 5) return 1;
    if (critNum < 7) return 2;
    if (critNum < 9 + shift) return 3;
    return 4;
}

function hasOverhead(user, crit, criterias, limits) {
    return limits && criterias && user.Crits[crit] > 0 &&
        (user.sums[getAreaNum(crit, criterias)] > limits[getAreaNum(crit, criterias)]);
}

class StaffStudentsRating extends Component {
    constructor(props) {
        super(props);

        this.state = {};

        this.handleDirectionSelect = this.handleDirectionSelect.bind(this);
        this.toggleDetailedMode = this.toggleDetailedMode.bind(this);

        this.accessNotAllowedNotify = () => {
            alert('Подробный рейтинг доступен только тем, кто открыл доступ к своим достижениям для участников конкурса \n(на странице "Мой профиль")');
        }
    };

    numFormatter = (cell, row, rowIndex) => (rowIndex + 1);

    columns = [
        ];

    toggleDetailedMode() {
        if (this.props.toggleDetailedModeCallback) {
            this.props.toggleDetailedModeCallback();
        }
    }

    handleDirectionSelect(e) {
        this.setState({currentDirection: e.target.value})
    }

    componentDidMount() {
        this.columns = [{
            dataField: 'Num',
            text: '№',
            isDummyField: true,
            csvExport: false,
            formatter: this.numFormatter,
            headerClasses: 'text-center',
            headerStyle: {fontSize:'smaller'},
            style: {'vertical-align': 'middle', fontSize:'smaller'},
            classes: 'text-center'

        },
            {
                dataField: 'Name',
                text: 'Ф.И.О.',
                headerStyle: {fontSize:'smaller'},
                style: {fontSize:'smaller'},
                headerClasses: ''
            },
            {
                dataField: 'Type',
                text: 'Ст. об.',
                headerClasses: 'text-center',
                headerStyle: {width: '10px', fontSize:'smaller'},
                style: {'vertical-align': 'middle', fontSize: 'small', overflow: 'hidden', width: '10px'},
                classes: 'text-center',
                formatter: (cell, row) => row.Type ? row.Type[0] : ''
            },
            {
                dataField: 'Course',
                text: 'Курс',
                headerClasses: 'text-center',
                headerStyle: {fontSize:'smaller'},
                style: {'vertical-align': 'middle',  fontSize:'smaller'},
                classes: 'text-center'
            }]

        let critsNames = ['7а', '7б', '7в', '8а', '8б', '9а', '9б', '10а', '10б', '11а', '11б', '11в'];
        let crits = Object.keys(this.props.crits);
        if (crits[0] !== '7а') {
            critsNames.splice(9, 0, '10в')
        }
        if (this.props.userMode)
            this.columns.push({
                dataField: 'Ball',
                text: 'Итого',
                headerClasses: 'text-center',
                headerStyle: {borderRight: '3px dotted black', fontSize:'smaller'},
                style: {'vertical-align': 'middle', borderRight: '3px dotted black', fontWeight: 'bold', fontSize:'smaller'},
                classes: 'text-center'
            });


        for (let i = 0; i < crits.length; i++) {
            this.columns.push({
                dataField: "Crits." + crits[i] + "",
                text: critsNames[i],
                headerClasses: 'text-center',
                headerStyle: {'vertical-align': 'middle', fontSize:'x-small', padding: '3px'},
                style: {'vertical-align': 'middle', fontSize:'x-small', padding: '3px'},
                classes: 'text-center',
                formatter: (cell, row) => {
                    const hasOh = hasOverhead(row, crits[i], this.props.crits, this.props.limits);
                    if (hasOh) return <span
                        title='Суммарный балл за область превышает установленное ограничение, поэтому при итоговом суммировании он будет считаться с ограничением.'
                        style={{ textDecoration: 'underline', textDecorationStyle: 'dotted', color: 'red' }}
                    >{row.Crits[crits[i]]}</span>;
                    return  row.Crits[crits[i]];
                }
            })
        }
        if (!this.props.userMode)
        this.columns.push({
            dataField: 'Ball',
            text: 'Итого',
            headerClasses: 'text-center',
            style: {'vertical-align': 'middle'},
            classes: 'text-center'
        })
        this.setState({columns: this.columns})
    }

    render() {
        let filtered = this.props.data;
        let sorted = [];
        if (filtered) {
            for (let i = 0; i < filtered.length; i++) {
                const sums = [0, 0, 0, 0, 0];
                for (const crit of Object.keys(filtered[i].Crits)) {
                    sums[getAreaNum(crit, this.props.crits)] += filtered[i].Crits[crit];
                }
                filtered[i].sums = sums;
            }
            sorted = filtered.sort(function (obj1, obj2) {
                let diff = obj2.Ball - obj1.Ball;
                if (diff != 0)
                    return obj2.Ball - obj1.Ball;
                else {
                    for (let crit of Object.keys(obj1.Crits)) {
                        diff = obj2.Crits[crit] - obj1.Crits[crit];
                        if (diff !== 0) return diff
                    }
                    return 0
                }
            });

        }
        return (
            <MainPanel heading={"Рейтинг студентов"}
                       panelClass={"col-md-9"}
            buttons={
                <>
                    {this.props.userMode &&
                    <button id="DeleteButton" style={{marginLeft: '1rem'}} className="btn btn-outline-info"
                            value="Подробно" onClick={this.props.toggleDetailedModeCallback ? this.toggleDetailedMode : this.accessNotAllowedNotify}>Подробно</button>}
                    {!this.props.userMode && <form action="/api/getResultTable" style={{marginLeft: '1rem'}}>
                        <input type="hidden" name="faculty" value={staffContextStore.faculty} />
                        <input type="submit" id="download" className="btn btn-primary" value="Скачать"/>
                    </form>}
                </>}>

                        <table className="table table-bordered" id='users'>
                            <thead>
                            <tr>

                            </tr>
                            </thead>
                            <tbody id="usersTable">

                            </tbody>
                        </table>

                        {this.state.columns &&
                            <div style={{overflowX: 'auto'}}>
                        <Table keyField='_id' data={sorted} columns={this.state.columns}/>
                            </div>}
            </MainPanel>
        )
    }
}

export default withRouter(StaffStudentsRating)