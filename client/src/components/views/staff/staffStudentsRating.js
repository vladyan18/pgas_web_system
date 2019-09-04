import React, {Component} from 'react';
import '../../../style/user_main.css';
import BootstrapTable from "react-bootstrap-table-next";
import criteriasStore from "../../../stores/criteriasStore";

class StaffStudentsRating extends Component {
    constructor(props) {
        super(props);

        let critsNames = ['7а', '7б', '7в', '8а', '8б', '9а', '9б', '10а', '10б', '10в', '11а', '11б', '11в'];
        let crits = Object.keys(criteriasStore.criterias);
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
    };

    componentWillReceiveProps(nextProps, nextContext) {
        console.log(nextProps)
    }

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


    render() {
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
                            <div className="centered_ver">
                                <form action="/api/getResultTable">
                                    <input type="submit" id="download" className="btn btn-primary" value="Скачать"/>
                                </form>
                            </div>

                        </div>
                        <hr className="hr_blue"/>
                        <table className="table table-bordered" id='users'>
                            <thead>
                            <tr>

                            </tr>
                            </thead>
                            <tbody id="usersTable">

                            </tbody>
                        </table>

                        <BootstrapTable keyField='_id' data={this.props.data} columns={this.columns}></BootstrapTable>

                    </div>
                </div>
            </main>
        )
    }
}

export default StaffStudentsRating