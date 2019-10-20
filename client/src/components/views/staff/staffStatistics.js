import React, {Component} from 'react';
import '../../../style/user_main.css';
import {observer} from "mobx-react";
import staffContextStore from "../../../stores/staff/staffContextStore";
import {fetchGet} from "../../../services/fetchService";
import {Doughnut, Bar, Chart, Scatter} from 'react-chartjs-2';
import 'chartjs-plugin-labels';
import PCA from "pca-js"

let originalDoughnutDraw = Chart.controllers.doughnut.prototype.draw;
Chart.helpers.extend(Chart.controllers.doughnut.prototype, {
    draw: function() {
        originalDoughnutDraw.apply(this, arguments);

        let chart = this.chart;
        let legendHeight = chart.legend.height
        let width = chart.chart.width,
            height = chart.chart.height,
            ctx = chart.chart.ctx;


        let fontSize = (height / 250).toFixed(2);
        ctx.font = fontSize + "em sans-serif";
        ctx.textBaseline = "middle";

        let sum = 0;
        for (let i = 0; i < chart.config.data.datasets[0].data.length; i++) {
            sum += chart.config.data.datasets[0].data[i];

        }

        let text = 'Всего: ' + sum,
            textX = Math.round((width - ctx.measureText(text).width) / 2),
            textY = (legendHeight + height) / 2;

        ctx.fillText(text, textX, textY);
    }
});

class StaffStatistics extends Component {
    constructor(props) {
        super(props);
        this.state = {}
    };

    async componentDidMount() {
        let statisticsProm = fetchGet('/api/getStatistics', {faculty: staffContextStore.faculty})

        let usersProm = fetchGet('/api/checked', {faculty: staffContextStore.faculty})

        this.setState({statistics: await statisticsProm, users: (await usersProm).Info})
    }

    makeUsersMatrix(users) {
        let crits = staffContextStore.criterias
        let usersMatrix = []
        for (let user of users)
        {
            let userRow = []
            for (let i = 0; i < Object.keys(crits).length; i++)
                userRow.push(0)

            for (let ach of user.Achievements)
            {
                if (!ach.status == 'Принято' && !ach.status == 'Принято с изменениями') continue
                let index = Object.keys(crits).indexOf(ach.chars[0])
                userRow[index] += ach.ball
            }

            usersMatrix.push(userRow)
        }
        return usersMatrix
    }

    makePCA(usersMatrix) {
        let vectors = PCA.getEigenVectors(usersMatrix)
        let first = PCA.computePercentageExplained(vectors,vectors[0])
        let second = PCA.computePercentageExplained(vectors,vectors[1])
        console.log('EXPL', first, second)
        let adData = PCA.computeAdjustedData(usersMatrix,vectors[0], vectors[1])
        console.log('DATA', adData)
        return adData
    }

    render() {
        let data, critsData, critsBallsData, medBallsCritsData, reducedMatrix, PCAdata
        if (this.state.users && staffContextStore.criterias)
        {
            let usersMatrix = this.makeUsersMatrix(this.state.users)
            reducedMatrix = this.makePCA(usersMatrix)

            let PCAdataset = []
            let labels = []
            for (let i = 0; i < reducedMatrix.adjustedData[0].length; i++)
            {
                PCAdataset.push({x: reducedMatrix.adjustedData[0][i], y:reducedMatrix.adjustedData[1][i] })
                labels.push(this.state.users[i].user)
            }

            console.log(labels)

            PCAdata = {
                labels: labels,
                datasets: [{
                    label: 'Scatter Dataset',
                    backgroundColor: '#ff0000',
                    data: PCAdataset
                }]
            }
        }
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
            let crits = staffContextStore.criterias
            let critsDataset = {}
            if (crits) {
                for (let i = 0; i < Object.keys(crits).length; i++)
                    critsDataset[Object.keys(crits)[i]] = this.state.statistics.CritsCounts[Object.keys(crits)[i]]
                for (let i = 0; i < Object.keys(crits).length; i++)
                    if (!critsDataset[Object.keys(crits)[i]]) critsDataset[Object.keys(crits)[i]] = 0
            }
            if (crits)
            critsData = {
                labels: Object.keys(crits),
                datasets: [{
                    data: Object.values(critsDataset),
                    label: '',
                    backgroundColor: [
                        '#6366ff',
                        '#6366ff',
                        '#6366ff',
                        '#4cab59',
                        '#4cab59',
                        '#ff464a',
                        '#ff464a',
                        '#9300a5',
                        '#9300a5',
                        '#9300a5',
                        '#FFCE56',
                        '#FFCE56',
                        '#FFCE56'
                    ]
                }]
            };

            let critBallssDataset = {}
            if (crits) {
                for (let i = 0; i < Object.keys(crits).length; i++)
                    critBallssDataset[Object.keys(crits)[i]] = this.state.statistics.CritsBalls[Object.keys(crits)[i]]
                for (let i = 0; i < Object.keys(crits).length; i++) {
                    if (!critBallssDataset[Object.keys(crits)[i]]) critBallssDataset[Object.keys(crits)[i]] = 0
                    //critBallssDataset[Object.keys(crits)[i]] = critBallssDataset[Object.keys(crits)[i]].toFixed(2)
                }
            }
            if (crits)
            critsBallsData = {
                labels: Object.keys(critBallssDataset),
                datasets: [{
                    data: Object.values(critBallssDataset),
                    backgroundColor: [
                        '#6366ff',
                        '#6366ff',
                        '#6366ff',
                        '#4cab59',
                        '#4cab59',
                        '#ff464a',
                        '#ff464a',
                        '#9300a5',
                        '#9300a5',
                        '#9300a5',
                        '#FFCE56',
                        '#FFCE56',
                        '#FFCE56'
                    ]
                }]
            };
            let medBallsCritsDataset = {}
            if (crits) {

                for (let i = 0; i < Object.keys(crits).length; i++)
                    if (critsDataset[Object.keys(crits)[i]] > 0)
                        medBallsCritsDataset[Object.keys(crits)[i]] = (critBallssDataset[Object.keys(crits)[i]] / critsDataset[Object.keys(crits)[i]]).toFixed(2)
                    else medBallsCritsDataset[Object.keys(crits)[i]] = 0

                medBallsCritsData = {
                    labels: Object.keys(medBallsCritsDataset),
                    datasets: [{
                        data: Object.values(medBallsCritsDataset),
                        backgroundColor: [
                            '#6366ff',
                            '#6366ff',
                            '#6366ff',
                            '#4cab59',
                            '#4cab59',
                            '#ff464a',
                            '#ff464a',
                            '#9300a5',
                            '#9300a5',
                            '#9300a5',
                            '#FFCE56',
                            '#FFCE56',
                            '#FFCE56'
                        ]
                    }]
                };
            }

        }



        let barChartOptions = {
            legend: {
                display: false
            },
            plugins: {
                labels: [
                    {
                        render: 'value',
                        fontColor: '#000000'
                    }
                ]
            }
        ,
            layout: {
                padding: {
                    left: 0,
                        right: 0,
                        top: 20,
                        bottom: 0
                }
            }}

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
                        <div style={{display: "flex", justifyContent: "space-between"}}>
                        <div style={{width: "500px", marginBottom: "30px"}}>
                            <h3 style={{marginBottom: '10px'}}>Публикации (в т.ч. тезисы)</h3>
                            {this.state.statistics &&  <Doughnut data={data} options={{
                                legend: {
                                  showLegend: false
                                },
                                plugins: {
                                    labels: [
                                        {
                                            render: 'label',
                                            position: 'outside',
                                            fontColor: '#000000',
                                            outsidePadding: 6,
                                            textMargin: 10
                                        },
                                        {
                                            render: 'value',
                                            fontColor: '#000000'
                                        }
                                    ]
                                }
                            }}/>}
                        </div>
                        <div style={{width: "500px"}}>
                            <h3>Достижений по критериям: </h3>
                            {(this.state.statistics && staffContextStore.criterias) &&  <Bar data={critsData}
                                                                                             height={170}
                                                                                             options={barChartOptions}/>}
                        </div>
                        </div>
                        <div style={{display: "flex", justifyContent: "space-between"}}>
                        <div style={{width: "500px"}}>
                            <h3>Баллов по критериям: </h3>
                            {(this.state.statistics && staffContextStore.criterias) &&  <Bar data={critsBallsData} options={barChartOptions}/>}
                        </div>
                            <div style={{width: "500px"}}>
                                <h3>Средний балл за достижение: </h3>
                                {(this.state.statistics && staffContextStore.criterias) &&  <Bar data={medBallsCritsData} options={barChartOptions}/>}
                            </div>
                        </div>
                        <div style={{width: "500px"}}>
                            <h3>Some experimental shit: </h3>
                            {(this.state.statistics && staffContextStore.criterias) &&  <Scatter data={PCAdata} options = {{
                                tooltips: {
                                callbacks: {
                                label: function(tooltipItem, data) {
                                var label = data.labels[tooltipItem.index];
                                return label + ': (' + tooltipItem.xLabel + ', ' + tooltipItem.yLabel + ')';
                            }
                            }}
                            }}/>}
                        </div>
                    </div>
                </div>
            </main>)
    }
}

export default observer(StaffStatistics)