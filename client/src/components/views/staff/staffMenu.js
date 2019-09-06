import React, {Component} from 'react';
import '../../../style/rating.css';
import {observer} from "mobx-react";
import {withRouter} from "react-router";

class StaffMenu extends Component {
    constructor(props) {
        super(props);
        this.openNewAchieves = this.openNewAchieves.bind(this);
        this.openCurrentContest = this.openCurrentContest.bind(this);
        this.openCurrentContestRating = this.openCurrentContestRating.bind(this);
        this.openCriteriasMenu = this.openCriteriasMenu.bind(this);
    };

    openNewAchieves() {
        this.props.history.push('/staff/newAchieves');
    }

    openCurrentContest() {
        this.props.history.push('/staff/current');
    }

    openCurrentContestRating() {
        this.props.history.push('/staff/rating');
    }

    openCriteriasMenu() {
        this.props.history.push('/staff/criteriasMenu');
    }

    render() {
        return (
            <main>
                <div id="panel" className="row" style={{"justifyContent": "center", "display": "flex"}}>

                    <div className="menu">
                        <p className="headline">
                            Меню сотрудника
                        </p>
                        <hr className="hr_blue"/>
                        <div className="container buttonsPanel">
                            <div className="row buttonsRow row-eq-height">
                                <div className="col">
                                    <div className="centered menuButtonContainer">
                                        <button type="button" id="SubmitButton"
                                                className="btn btn-success menuButton"
                                                value="Панель сотрудника" onClick={this.openNewAchieves}>
                                            Новые <br/>достижения
                                        </button>
                                    </div>
                                </div>
                                <div className="col">
                                    <div className="centered menuButtonContainer">
                                        <button type="button" id="SubmitButton"
                                                className="btn btn-success menuButton "
                                                value="Панель сотрудника" onClick={this.openCurrentContest}>
                                            Текущая <br/> ПГАС
                                        </button>
                                    </div>
                                </div>
                                <div className="col">
                                    <div className="centered menuButtonContainer">
                                        <button type="button" id="SubmitButton"
                                                className="btn btn-success menuButton"
                                                value="Панель сотрудника" onClick={this.openCurrentContestRating}>
                                            Рейтинг
                                        </button>
                                    </div>
                                </div>


                                <div className="w-100"></div>
                                <div className="col ">
                                    <div className="centered menuButtonContainer">
                                        <button type="button" id="SubmitButton"
                                                className="btn btn-success menuButton"
                                                value="Панель сотрудника" onClick={this.openCriteriasMenu}>
                                            Критерии
                                        </button>
                                    </div>
                                </div>
                                <div className="col">
                                    <div className="centered menuButtonContainer">
                                        <button type="button" id="SubmitButton"
                                                className="btn btn-success menuButton "
                                                value="Панель сотрудника">
                                            История
                                        </button>
                                    </div>
                                </div>
                                <div className="col">
                                    <div className="centered menuButtonContainer">
                                        <button type="button" id="SubmitButton"
                                                className="btn btn-success menuButton"
                                                value="Панель сотрудника">
                                            Студенты
                                        </button>
                                    </div>
                                </div>

                                <div className="w-100"></div>
                            </div>
                        </div>
                    </div>

                </div>
            </main>
        )
    }
}

export default withRouter(observer(StaffMenu))