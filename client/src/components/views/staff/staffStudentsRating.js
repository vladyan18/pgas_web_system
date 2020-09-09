import React, {Component} from 'react';
import '../../../style/user_main.css';
import BootstrapTable from "react-bootstrap-table-next";
import staffContextStore from "../../../stores/staff/staffContextStore";
import {withRouter} from "react-router-dom";
/** @jsx jsx */
import {css, jsx} from '@emotion/core';
import styled from '@emotion/styled';

class StaffStudentsRating extends Component {
    constructor(props) {
        super(props);

        this.state = {};

        this.handleDirectionSelect = this.handleDirectionSelect.bind(this);
        this.toggleDetailedMode = this.toggleDetailedMode.bind(this);
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
                formatter: (cell, row) => row.Type[0]
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
            console.log(crits[i])
            this.columns.push({
                dataField: "Crits." + crits[i] + "",
                text: critsNames[i],
                headerClasses: 'text-center',
                headerStyle: {'vertical-align': 'middle', fontSize:'x-small', padding: '3px'},
                style: {'vertical-align': 'middle', fontSize:'x-small', padding: '3px'},
                classes: 'text-center'
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

    componentDidUpdate(prevProps, prevState, snapshot) {

        if (this.props.faculty == 'ВШЖиМК' && this.props.directions && this.props.directions.length > 0)
            if (!this.state.currentDirection)
                this.setState({currentDirection: this.props.directions[0]})


    }

    render() {
        let filtered = this.props.data;
        if (this.props.faculty == 'ВШЖиМК' && this.state.currentDirection) {
            filtered = filtered.filter(x => x.Direction == this.state.currentDirection)
        }
        let sorted = [];

        if (filtered) {
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

                    <div className="col-9 general" css={css`box-shadow: 0 2px 4px rgba(0, 0, 0, .2);`}>
                        <div className="profile" style={{"display": "flex", "justify-content": "space-between"}} >
                            <div className="centered_ver">
                                <p className="headline">
                                    Рейтинг студентов
                                </p>
                            </div>
                            <div className="centered_ver" style={{"display": "flex"}}>
                                {
                                    this.props.toggleDetailedModeCallback &&
                                    <button id="DeleteButton" style={{marginRight: '1rem'}} className="btn btn-outline-info"
                                        value="Подробно" onClick={this.toggleDetailedMode}>Подробно</button>
                                }
                                <button id="DeleteButton" className="btn btn-secondary"
                                        value="Назад" onClick={() => {
                                    this.props.history.goBack()
                                }}>Назад
                                </button>
                                {!this.props.userMode && <form action="/api/getResultTable">
                                    <input type="hidden" name="faculty" value={staffContextStore.faculty} />
                                    <input type="submit" id="download" className="btn btn-primary" value="Скачать"/>
                                </form>}
                            </div>

                        </div>
                        {this.props.faculty == 'ВШЖиМК' && this.props.directions && this.props.directions.length > 0
                        && <select id='1' className="form-control selectors" onChange={this.handleDirectionSelect}>
                            {this.props.directions.map(dir =>
                                <option value={dir}>{dir}</option> )}
                        </select>}
                        <hr className="hr_blue"/>
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
                        <BootstrapTable   keyField='_id' data={sorted} columns={this.state.columns}/>
                            </div>}

                    </div>
        )
    }
}

export default withRouter(StaffStudentsRating)