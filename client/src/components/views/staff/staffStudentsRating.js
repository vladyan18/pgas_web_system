import React, {Component} from 'react';
import '../../../style/user_main.css';
import BootstrapTable from "react-bootstrap-table-next";
import staffContextStore from "../../../stores/staff/staffContextStore";
import {withRouter} from "react-router";

class StaffStudentsRating extends Component {
    constructor(props) {
        super(props);

        this.state = {}

        let critsNames = ['7а', '7б', '7в', '8а', '8б', '9а', '9б', '10а', '10б', '10в', '11а', '11б', '11в'];
        let crits = Object.keys(staffContextStore.criterias);
        for (let i = 0; i < crits.length; i++) {
            this.columns.push({
                dataField: "Crits." + crits[i] + "",
                text: critsNames[i],
                headerClasses: 'text-center',
                style: {'vertical-align': 'middle'},
                classes: 'text-center'
            })
        }
        this.columns.push({
            dataField: 'Ball',
            text: 'Итого',
            headerClasses: 'text-center',
            style: {'vertical-align': 'middle'},
            classes: 'text-center'
        })

        this.handleDirectionSelect = this.handleDirectionSelect.bind(this)
    };

    numFormatter = (cell, row, rowIndex) => (rowIndex + 1);

    columns = [
        {
            dataField: 'Num',
            text: '№',
            isDummyField: true,
            csvExport: false,
            formatter: this.numFormatter,
            headerClasses: 'text-center',
            style: {'vertical-align': 'middle'},
            classes: 'text-center'

        },
        {
            dataField: 'Name',
            text: 'Ф.И.О.',
            headerClasses: ''
        },
        {
            dataField: 'Type',
            text: 'Ступ. обуч.',
            headerClasses: 'text-center',
            style: {'vertical-align': 'middle'},
            classes: 'text-center'
        },
        {
            dataField: 'Course',
            text: 'Курс',
            headerClasses: 'text-center',
            style: {'vertical-align': 'middle'},
            classes: 'text-center'
        }];

    handleDirectionSelect(e) {
        this.setState({currentDirection: e.target.value})
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (staffContextStore.faculty == 'ВШЖиМК' && staffContextStore.directions && staffContextStore.directions.length > 0)
            if (!this.state.currentDirection)
                this.setState({currentDirection: staffContextStore.directions[0]})
    }

    render() {
        let filtered = this.props.data
        if (staffContextStore.faculty == 'ВШЖиМК' && this.state.currentDirection) {
            filtered = filtered.filter(x => x.Direction == this.state.currentDirection)
        }

        let sorted = filtered.sort(function(obj1, obj2) {
            let diff = obj2.Ball-obj1.Ball;
            if (diff != 0)
                return obj2.Ball-obj1.Ball;
            else {
                for (let crit of Object.keys(obj1.Crits)) {
                    diff = obj2.Crits[crit] - obj1.Crits[crit];
                    if (diff != 0) return diff
                }
                return 0
            }
        });

        return (
            <main>
                <div id="panel" className="row justify_center">

                    <div className="col-9 general">
                        <div className="profile" style={{"display": "flex", "justify-content": "space-between"}}>
                            <div className="centered_ver">
                                <p className="headline">
                                    Рейтинг студентов
                                </p>
                            </div>
                            <div className="centered_ver" style={{"display": "flex"}}>
                                <button id="DeleteButton" className="btn btn-secondary"
                                        value="Назад" onClick={() => {
                                    this.props.history.goBack()
                                }}>Назад
                                </button>
                                <form action="/api/getResultTable">
                                    <input type="hidden" name="faculty" value={staffContextStore.faculty} />
                                    <input type="submit" id="download" className="btn btn-primary" value="Скачать"/>
                                </form>
                            </div>

                        </div>
                        {staffContextStore.faculty == 'ВШЖиМК' && staffContextStore.directions && staffContextStore.directions.length > 0
                        && <select id='1' className="form-control selectors" onChange={this.handleDirectionSelect}>
                            {staffContextStore.directions.map(dir =>
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

                        <BootstrapTable keyField='_id' data={sorted} columns={this.columns}/>

                    </div>
                </div>
            </main>
        )
    }
}

export default withRouter(StaffStudentsRating)