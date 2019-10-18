import React, {Component} from 'react';
import '../../../style/user_main.css';
import {observer} from "mobx-react";
import staffContextStore from "../../../stores/staff/staffContextStore";
import {fetchGet} from "../../../services/fetchService";
import {Doughnut, Bar} from 'react-chartjs-2';

class StaffStatistics extends Component {
    constructor(props) {
        super(props);
        this.state = {}
    };

    async componentDidMount() {
        let statistics = await fetchGet('/api/getStatistics', {faculty: staffContextStore.faculty})
        console.log('stat', statistics)
        this.setState({statistics: statistics})
    }




    render() {
        let data, critsData, critsBallsData
        if (this.state.statistics) {
            data = {
                labels: [
                    'РИНЦ',
                    'SCOPUS',
                    'ВАК',
                    'Неиндекс.'
                ],
                datasets: [{
                    data: [this.state.statistics.RINC, this.state.statistics.SCOPUS, this.state.statistics.VAK, this.state.statistics.Unindexed],
                    backgroundColor: [
                        '#FF6384',
                        '#36A2EB',
                        '#FFCE56'
                    ],
                    hoverBackgroundColor: [
                        '#FF6384',
                        '#36A2EB',
                        '#FFCE56'
                    ]
                }]
            };
            console.log('KEYS', Object.keys(this.state.statistics.CritsCounts))
            critsData = {
                labels: Object.keys(this.state.statistics.CritsCounts),
                datasets: [{
                    data: Object.values(this.state.statistics.CritsCounts),
                }]
            };
            critsBallsData = {
                labels: Object.keys(this.state.statistics.CritsBalls),
                datasets: [{
                    data: Object.values(this.state.statistics.CritsBalls),
                }]
            };
        }

        return (
            <main>
                <div id="panel" className="row justify_center">
                    <div className="col-9 general">
                        <div className="profile" style={{"display": "flex", "justify-content": "space-between"}}>
                            <div className="centered_ver">
                                <p className="headline">
                                    Статистика {staffContextStore.faculty}
                                </p>
                            </div>
                        </div>
                        <div style={{width: "300px", height: "400px"}}>
                            <h3>Публикации (в т.ч. тезисы)</h3>
                            {this.state.statistics &&  <Doughnut data={data} width={50} height={50} options={{ maintainAspectRatio: false }}/>}
                        </div>
                        <div style={{width: "300px", height: "400px"}}>
                            <h3>Достижений по критериям: </h3>
                            {this.state.statistics &&  <Bar data={critsData} width={50} height={50} options={{ maintainAspectRatio: false }}/>}
                        </div>
                        <div style={{width: "300px", height: "400px"}}>
                            <h3>Баллов по критериям: </h3>
                            {this.state.statistics &&  <Bar data={critsBallsData} width={50} height={50} options={{ maintainAspectRatio: false }}/>}
                        </div>
                    </div>
                </div>
            </main>)
    }
}

export default observer(StaffStatistics)