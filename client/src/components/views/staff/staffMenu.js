import React, {Component} from 'react';
import '../../../style/rating.css';
import {observer} from 'mobx-react';
import {withRouter} from 'react-router-dom';
import userPersonalStore from '../../../stores/userPersonalStore';
import staffContextStore from '../../../stores/staff/staffContextStore';

/** @jsx jsx */
import {css, jsx} from '@emotion/core';
import styled from '@emotion/styled';

const rolesDictionary = {
  'SuperAdmin': 'Суперадмин',
  'Admin': 'Администратор',
  'Moderator': 'Проверяющий',
  'Observer': 'Наблюдатель'
};


class StaffMenu extends Component {
  constructor(props) {
    super(props);
    this.openNewAchieves = this.openNewAchieves.bind(this);
    this.openCurrentContest = this.openCurrentContest.bind(this);
    this.openCurrentContestRating = this.openCurrentContestRating.bind(this);
    this.openCriteriasMenu = this.openCriteriasMenu.bind(this);
    this.openAdminsList = this.openAdminsList.bind(this);
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

  openAdminsList() {
    this.props.history.push('/staff/adminsList');
  }

  render() {
    return (
      <main>
        <div id="panel" className="row" style={{'justifyContent': 'center', 'display': 'flex'}}>

          <div className="menu" css={css`box-shadow: 0 2px 4px rgba(0, 0, 0, .2);`}>
            <p className="headline">
                            Меню сотрудника
            </p>
            <p style={{color: 'grey'}}>Роль: {rolesDictionary[userPersonalStore.Role]}</p>
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
                      onClick={() => this.props.history.push('/staff/export')}>
                                            Экспорт
                    </button>
                  </div>
                </div>

                {['SuperAdmin', 'Admin'].includes(userPersonalStore.Role) &&
                  <><div className="w-100"/>
                <div className="col-4">
                  <div className="centered menuButtonContainer">
                    <button type="button" id="SubmitButton"
                            className="btn btn-success menuButton"
                            value="Панель сотрудника"
                            onClick={this.openAdminsList}>
                      Список администраторов
                    </button>
                  </div>
                </div></>}
                <div className="w-100"/>
                {
                  userPersonalStore.Role === 'SuperAdmin' &&
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
