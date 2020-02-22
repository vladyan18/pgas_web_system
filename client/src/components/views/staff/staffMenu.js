import React, {Component} from 'react';
import '../../../style/rating.css';
import {observer} from 'mobx-react';
import {withRouter} from 'react-router-dom';
import userPersonalStore from '../../../stores/userPersonalStore';
import staffContextStore from '../../../stores/staff/staffContextStore';
import {fetchGet} from '../../../services/fetchService';
import {makeExportUsersTable} from '../../../services/exportXLSX';

class StaffMenu extends Component {
  constructor(props) {
    super(props);
    this.openNewAchieves = this.openNewAchieves.bind(this);
    this.openCurrentContest = this.openCurrentContest.bind(this);
    this.openCurrentContestRating = this.openCurrentContestRating.bind(this);
    this.openCriteriasMenu = this.openCriteriasMenu.bind(this);
    this.exportExcel = this.exportExcel.bind(this);
  };

  async exportExcel() {
    if (!staffContextStore.faculty) return null;

    const users = await fetchGet('/api/checked', {faculty: staffContextStore.faculty});

    await makeExportUsersTable(users.Info, staffContextStore.faculty);
  }

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
        <div id="panel" className="row" style={{'justifyContent': 'center', 'display': 'flex'}}>

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
                      className={'btn btn-success menuButton'}
                      value="Панель сотрудника" onClick={() => {
                        this.props.history.push('/staff/criteriasPage');
                      }}>
                                            Критерии
                    </button>
                  </div>
                </div>
                <div className="col">
                  <div className="centered menuButtonContainer">
                    <button type="button" id="SubmitButton"
                      className="btn btn-success menuButton "
                      value="Панель сотрудника"
                      onClick={() => this.props.history.push('/staff/statistics')}>
                                            Статистика
                    </button>
                  </div>
                </div>
                <div className="col">
                  <div className="centered menuButtonContainer">
                    <button type="button" id="SubmitButton"
                      className="btn btn-success menuButton"
                      value="Панель сотрудника"
                      onClick={this.exportExcel}>
                                            Экспорт в Excel
                    </button>
                  </div>
                </div>

                <div className="w-100"></div>
                {
                  userPersonalStore.Role == 'SuperAdmin' &&
                                    <>
                                      <div className="col">
                                        <div className="centered menuButtonContainer">
                                          <button type="button" id="SubmitButton"
                                            className="btn btn-warning menuButton"
                                            value="Панель сотрудника"
                                            onClick={() => this.props.history.push('/staff/facultyCreation')}>
                                                    Создать факультет
                                          </button>
                                        </div>
                                      </div>
                                      <div className="col">
                                        <div className="centered menuButtonContainer">
                                          <button type="button" id="SubmitButton"
                                            className="btn btn-warning menuButton"
                                            value="Панель сотрудника"
                                            onClick={() => this.props.history.push('/staff/adminCreation')}>
                                                    Создать администратора
                                          </button>
                                        </div>
                                      </div>
                                      <div className="col ">
                                        <div className="centered menuButtonContainer">
                                          <button type="button" id="SubmitButton"
                                            className={'btn btn-' + (staffContextStore.criterias ? 'warning' : 'danger') + ' menuButton'}
                                            value="Панель сотрудника" onClick={this.openCriteriasMenu}>
                                                    Загрузка критериев
                                          </button>
                                        </div>
                                      </div>
                                    </>
                }
              </div>
            </div>
          </div>

        </div>
      </main>
    );
  }
}

export default withRouter(observer(StaffMenu));
