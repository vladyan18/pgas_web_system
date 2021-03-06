import React, {Component} from 'react';
import '../../../style/user_main.css';
import AchievementDateInput from '../../common/AchievementDateInput';
import {fetchGet, fetchSendWithoutRes} from '../../../stores/criteriasStore';
import CriteriasForm from '../../user/addAchievement/criteriasForm';
import staffContextStore from '../../../stores/staff/staffContextStore';
import Table from '../../common/table';
import {ConfirmationColumns} from '../../user/confirmation/ConfirmationColumns';
import {getDate} from '../../../helpers';
import HideIfForMyself from "./HideIfForMyself";
import HideForObserver from "./HideIfForObserver";
import userPersonalStore from "../../../stores/userPersonalStore";

function HistoryNote({history}) {
  if (!history || history.length === 0) return null;
  const lastNote = history[history.length - 1];
  const author = lastNote.authorId;
  const authorName = author.LastName + ' ' + author.FirstName[0] + '. ' + (author.Patronymic ? author.Patronymic[0] + '.' : '');
  let actionTitle = ''
  if (lastNote.action === 'Accept') {
    actionTitle = 'Принял';
  } else if (lastNote.action === 'Decline') {
    actionTitle = 'Отклонил';
  } else {
    return null;
  }

  return <p style={{textAlign: 'right', marginBottom: 0, color: 'grey'}}>{actionTitle}: {authorName}</p>;
}

class StaffChangeAchievement extends Component {
  constructor(props) {
    super(props);
    const user = this.props.users.find((x) => x.Achievements.find((ach) => ach._id.toString() == this.props.achId));
    const achieve = user.Achievements.find((ach) => ach._id.toString() == this.props.achId);
    this.state = {
      user: user.user,
      userId: user.userId,
      achId: achieve._id,
      dateValidationResult: true,
      changeChars: false,
      chars: achieve.chars,
      ach: achieve.achievement,
      comment: achieve.comment,
      achDate: achieve.achDate,
      confirmations: achieve.confirmations,
      isDateValid: true,
      hasChanges: false,
    };
    this.updateDescr = this.updateDescr.bind(this);
    this.handleDateChange = this.handleDateChange.bind(this);
    this.updateNewChars = this.updateNewChars.bind(this);
    this.updateChars = this.updateChars.bind(this);
    this.updateComment = this.updateComment.bind(this);
    this.saveChanges = this.saveChanges.bind(this);
  }

  componentDidMount() {
    fetchGet('/achHistory', {achId: this.state.achId}).then((x) => this.setState({history: x}));
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (!prevState.hasChanges) {
      this.setState({hasChanges: true});
    }
  }

  updateDescr(e) {
    this.setState({ach: e.target.value});
  }

  updateComment(e) {
    this.setState({comment: e.target.value});
  }

  handleDateChange(isValid, val) {
    this.setState({dateValidationResult: isValid, achDate: val, isDateValid: isValid});
  }

  updateNewChars(value) {
    this.setState({newChars: value});
  }

  updateChars() {
    if (this.state.newChars) {
      this.setState({chars: this.state.newChars, changeChars: false});
    }
  }

  saveChanges() {
    if (!this.state.isDateValid && this.state.chars[0] != '1 (7а)') {
      const st = this.state;
      st.dateValidationResult = false;
      this.setState(st);
      return;
    }
    if (!this.state.ach && this.state.chars[0] != '1 (7а)') return;
    const res = {};
    res.crit = this.state.chars[0];

    res.chars = this.state.chars;
    if (this.state.achDate && this.state.achDate != '') {
      if (this.state.achDate.indexOf('-') > 0 ) res.achDate = this.state.achDate;
      else res.achDate = makeDate(this.state.achDate);
    }

    res.achievement = this.state.ach;
    res.comment = this.state.comment;

    res.confirmations = [];
    if (this.state.confirmations) {
      for (let i = 0; i < this.state.confirmations.length; i++) {
        res.confirmations.push({id: this.state.confirmations[i]._id, additionalInfo: this.state.confirmations[i].additionalInfo});
      }
    }
    res._id = this.props.achId;
    fetchSendWithoutRes('/api/adm_update_achieve', {achievement: res, userId: this.state.userId}).then((result) => {
      if (result) this.props.closeModal();
    });
  }

  render() {
    return (<div style={{display: 'flex', maxHeight: '42rem', maxWidth: '99vw'}}>
      { !this.state.confirmsOpened &&
            <div className="block" style={{overflow: 'auto', width: '50rem', maxHeight: '100%', maxWidth: '30vw'}}>
              <div className="profile" style={{'display: flex; justify-content': 'space-between', 'margin': '0'}}>
                <p className="headline" style={{'margin-bottom': 'auto', 'margin-right': '1rem'}}>
                        Подтверждения
                </p>
              </div>
              <div>
                <Table keyField='_id' data={this.state.confirmations}
                  columns={ConfirmationColumns}
                  headerClasses={['hidden']} classes={['existingConfirmationsRow']}
                  bordered={false}/>
              </div>
            </div>}

      <div className="block" style={{maxWidth: '30rem', overflow: 'auto'}}>
        <div className="profile" style={{'display: flex; justify-content': 'space-between', 'margin': '0'}}>
          <p className="headline" style={{'margin-bottom': 'auto', 'margin-right': '1rem'}}>
                        Изменение достижения
          </p>
          <div style={{'margin-top': 'auto'}}>
            <button id="DeleteButton" className="btn btn-secondary"
              value="Назад" onClick={this.props.closeModal}>Закрыть
            </button>
          </div>
        </div>

        <hr className="hr_blue"/>
        <p className="desc_headline">
          {this.state.user}
        </p>
        <label
          htmlFor="comment" style={{'marginTop': 'auto', 'marginRight': '0.5rem'}}
          className="control-label col-xs-2">Достижение: </label>
        <textarea className="form-control area_text" name="comment"
          placeholder="Введите достижение (четкое, однозначное и полное описание)" id="comment"
          disabled={userPersonalStore.Role === 'Observer'}
          required onChange={this.updateDescr} value={this.state.ach}
          style={{width: '100%', margin: '0'}}/>

        <div className="form-group" style={{'display': 'flex', 'marginTop': '1rem'}}>
          <label
            htmlFor="Date" style={{'marginTop': 'auto', 'marginRight': '0.5rem'}}
            className="control-label col-xs-2">Дата достижения: </label>
          <div id="Date" style={{
            'display': 'flex',
            'align-items': 'center',
            'marginTop': 'auto',
            'margin-bottom': 'auto',
          }}>
            <AchievementDateInput className="form-control" isValid={this.state.dateValidationResult}
              updater={this.handleDateChange}
              disabled={userPersonalStore.Role === 'Observer'}
              defaultValue={getDate(this.state.achDate)}/>
          </div>
        </div>

        <div>
          <div style={{'display: flex; justify-content': 'space-between'}}>
            <label
              style={{'marginTop': 'auto', 'marginRight': '0.5rem'}}
              className="control-label col-xs-2">Характеристики: </label>
            <HideForObserver>
              <HideIfForMyself userId={this.state.userId}>
                <button id="DeleteButton" className="btn btn-sm btn-outline-primary"
                  value="Назад"
                  onClick={() => this.setState({changeChars: !this.state.changeChars})}>Изменить
                </button>
              </HideIfForMyself>
            </HideForObserver>
          </div>
          <div style={{'display': 'flex', 'flex-wrap': 'wrap', 'max-width': '40rem'}}>
            {this.state.chars.map((x) => {
              let str = x;
              if (str.length > 35) {
                str = x.substr(0, 15) + '...' + x.substr(x.length - 15, 15);
              }
              return (<div className="charsItem" style={{
                color: 'white',
                backgroundColor: '#151540',
                paddingLeft: '6px',
                paddingRight: '6px',
              }}>{str}</div>);
            })}
          </div>

        </div>

        <HistoryNote history={this.state.history}/>
        <HideForObserver>
          <HideIfForMyself userId={this.state.userId}>
            <button id="DeleteButton" className="btn btn-warning" style={{marginTop: '3rem'}}
              value="Назад" disabled={!this.state.hasChanges} onClick={this.saveChanges}>Сохранить
            </button>
          </HideIfForMyself>
        </HideForObserver>

      </div>
      {this.state.changeChars &&
                <div className="block" style={{overflow: 'scroll', width: '50rem', maxHeight: '100%', maxWidth: '30rem'}}>
                  <div className="profile" style={{'display: flex; justify-content': 'space-between', 'margin': '0'}}>
                    <p className="headline" style={{'margin-bottom': 'auto', 'margin-right': '1rem'}}>
                            Изменение характеристик
                    </p>
                  </div>
                  <div>
                    <CriteriasForm crits={staffContextStore.criterias} values={this.state.chars}
                      valuesCallback={this.updateNewChars} supressDescription={true} forceEnabled={true}/>
                  </div>
                  <button className="btn btn-success" onClick={this.updateChars}>Сохранить характеристики</button>
                </div>}
    </div>
    );
  }
}

function makeDate(d) {
  if (!d) return undefined;
  const date = d.split('.');
  return new Date(date[2] + '-' + date[1] + '-' + date[0]);
}


export default StaffChangeAchievement;
