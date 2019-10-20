import React, {Component} from 'react';
import '../../../style/user_main.css';
import {observer} from "mobx-react";
import staffContextStore from "../../../stores/staff/staffContextStore";
import {fetchGet} from "../../../services/fetchService";
import {Doughnut, Bar, Chart, Scatter, Radar} from 'react-chartjs-2';
import 'chartjs-plugin-labels';
import PCA from "pca-js"
import { agnes } from 'ml-hclust';

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

    makeUsersMatrix(users, summaryBalls, radarData) {
        let crits = staffContextStore.criterias
        let usersMatrix = []
        let radarCounts = {}
        for (let user of users)
        {
            summaryBalls[user.user] = 0
            let userRow = []

            if (!radarData[user.Type + user.Course]) {
                radarData[user.Type + user.Course] = []
                radarCounts[user.Type + user.Course] = []
            for (let i = 0; i < Object.keys(crits).length; i++)
                radarData[user.Type + user.Course].push(0)
                radarCounts[user.Type + user.Course].push(0)
            }

            for (let i = 0; i < Object.keys(crits).length; i++)
                userRow.push(0)

            for (let ach of user.Achievements)
            {
                if (!ach.status == 'Принято' && !ach.status == 'Принято с изменениями') continue
                let index = Object.keys(crits).indexOf(ach.chars[0])
                userRow[index] += ach.ball
                radarData[user.Type + user.Course][index] += ach.ball
                radarCounts[user.Type + user.Course][index] += 1
                summaryBalls[user.user] += ach.ball
            }

            usersMatrix.push(userRow)
        }

        for (let course of Object.keys(radarData))
        {
            for (let i = 0; i < radarData[course].length; i++)
            {
                if (radarCounts[course][i] > 0 )
                    radarData[course][i] = radarData[course][i] / radarCounts[course][i]
            }
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
        let data, critsData, critsBallsData, medBallsCritsData, reducedMatrix, PCAdata, radarDataForVisualize, radarData = {}
        let summaryBalls = {}
        if (this.state.users && staffContextStore.criterias)
        {
            let usersMatrix = this.makeUsersMatrix(this.state.users, summaryBalls, radarData)
            reducedMatrix = this.makePCA(usersMatrix)

            let PCAdataset = []
            let AGNESdataset = []
            let labels = []
            for (let i = 0; i < reducedMatrix.adjustedData[0].length; i++)
            {
                PCAdataset.push({x: reducedMatrix.adjustedData[0][i], y:reducedMatrix.adjustedData[1][i] })
                AGNESdataset.push([reducedMatrix.adjustedData[0][i], reducedMatrix.adjustedData[1][i]])
                labels.push(this.state.users[i].user)
            }

            PCAdata = {
                labels: labels,
                datasets: [{
                    label: 'Scatter Dataset',
                    backgroundColor: '#ff0000',
                    data: PCAdataset
                }]
            }

            radarDataForVisualize = {
                labels: Object.keys(staffContextStore.criterias),
                datasets: []
            }
            let colors = ['rgba(102,233,125,0.76)', 'rgba(0,0,255,0.75)', 'rgba(255,252,7,0.75)', 'rgba(255,167,0,0.75)',
                'rgba(147,0,165,0.75)', 'rgba(255,0,2,0.75)']
            for (let course of Object.keys(radarData))
            {
                console.log(course, radarData[course])
                radarDataForVisualize.datasets.push(
                    {
                        label: course,
                        data: radarData[course],
                        backgroundColor: colors[Object.keys(radarData).indexOf(course)]
                    }
                )
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
                        <div style={{display: "flex", justifyContent: "space-between"}}>
                        <div style={{width: "500px"}}>
                            <h3>Результат PCA: </h3>
                            {(this.state.statistics && staffContextStore.criterias) &&  <Scatter data={PCAdata} options = {{
                                legend: {
                                    display: false
                                },
                                tooltips: {
                                callbacks: {
                                label: function(tooltipItem, data) {
                                let label = data.labels[tooltipItem.index];
                                return label + ': ' + summaryBalls[label];
                            }
                            }}
                            }}/>}
                        </div>


                        </div>
                        <div style={{display: "flex", justifyContent: "center", marginTop: '30px'}}>
                        <div style={{width: "1000px"}}>
                            <h3>Средние баллы по курсам: </h3>
                            {(this.state.statistics && staffContextStore.criterias) &&  <Radar data={radarDataForVisualize} />}
                        </div>
                        </div>
                    </div>
                </div>
            </main>)
    }
}

export default observer(StaffStatistics)