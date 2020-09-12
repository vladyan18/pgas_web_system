import React, {Component} from 'react';
import '../../../../style/add_portfolio.css';
import CriteriasForm from './criteriasForm';
import CriteriasStore, {fetchSendWithoutRes} from '../../../../stores/criteriasStore';
import {withRouter} from 'react-router-dom';
import AchievementDateInput from '../../../AchievementDateInput';
import ConfirmationForm from '../userConfirmation/ConfirmationForm';
import userAchievesStore from '../../../../stores/userAchievesStore';
import userPersonalStore from '../../../../stores/userPersonalStore';
import {FormGroup, OverlayTrigger, Popover} from 'react-bootstrap';
import HelpButton from '../helpButton';
import styled from '@emotion/styled';
import {css, jsx} from '@emotion/core';
/** @jsx jsx */

const Panel = styled.div`
    background-color: white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, .2);
    padding: 0 2rem;
    @media only screen and (max-device-width: 480px) {
        padding: 0 1rem;
    }
`;

const horizontalLine = css`
    border-top: 1px solid #9F2D20;
`;

class UserAddAchievement extends Component {
  constructor(props) {
    super(props);
    this.state = {isDateInvalid: undefined, dateValidationResult: undefined, endDateValidationResult: undefined};
    this.updateDescr = this.updateDescr.bind(this);
    this.handleDateChange = this.handleDateChange.bind(this);
    this.handleStartDateChange = this.handleStartDateChange.bind(this);
    this.handleEndDateChange = this.handleEndDateChange.bind(this);
    this.sendKrit = this.sendKrit.bind(this);
    this.updateChars = this.updateChars.bind(this);
    this.updateConfirmations = this.updateConfirmations.bind(this);
    this.crits = Object.keys(CriteriasStore.criterias);
  }

  updateChars(value, isValid) {
    const st = this.state;
    if (value[0] === this.crits[0]) {
      if (userAchievesStore.achieves.some((x) => x.chars[0] === this.crits[0])) {
        st.critError = true;
        st.critErrorMessage = 'Достижение за критерий 7а уже добавлено';
      } else if (userPersonalStore.Course === 1) {
        st.critError = true;
        st.critErrorMessage = 'Первый курс не может получать баллы за 7а';
      } else st.critError = false;
    } else st.critError = false;

    st.chars = value;
    if (isValid) {
      st.charsInvalid = !isValid;
    } else st.charsInvalid = undefined;
    this.setState(st);
  };

  updateConfirmations(confirms) {
    const st = this.state;
    st.confirmations = [...confirms];
    this.setState(st);
  }

  updateDescr(e) {
    const st = this.state;
    st.ach = e.target.value;
    if (e.target.value && e.target.value !== '') {
      st.descrInvalid = false;
    } else st.descrInvalid = undefined;
    this.setState(st);
  }

  handleDateChange(isValid, value) {
    const st = this.state;
    st.isDateInvalid = !isValid;
    st.dateValidationResult = isValid;
    st.dateValue = value;
    this.setState(st);
  }

  handleStartDateChange(isValid, value) {
    const st = this.state;
    st.isDateInvalid = !isValid;
    st.dateValidationResult = isValid;
    st.dateValue = value;
    if (isValid && st.isEndDateValid) {
      if (makeDate(value) > makeDate(st.endDateValue)) {
        st.dateValidationResult = false;
        st.dateDiapErrorMess = 'Начальная дата не может быть после конечной';
      } else {
        st.dateDiapErrorMess = undefined;
        st.endDateValidationResult = true;
      }
    }
    this.setState(st);
  }

  handleEndDateChange(isValid, value) {
    const st = this.state;
    st.isEndDateValid = isValid;
    st.endDateValidationResult = isValid;
    st.endDateValue = value;
    if (isValid && !st.isDateInvalid) {
      if (makeDate(value) < makeDate(st.dateValue)) {
        st.endDateValidationResult = false;
        st.dateDiapErrorMess = 'Начальная дата не может быть после конечной';
      } else {
        st.dateDiapErrorMess = undefined;
        st.dateValidationResult = true;
      }
    }
    this.setState(st);
  }

  checkValidityBeforeSend() {
    const newState = {};
    let isValid = true;

    if (this.crits[0] === '7а' && this.state.chars[0] === this.crits[0]) {
      if (this.state.charsInvalid === undefined) {
        newState.charsInvalid = true;
        isValid = false;
      } else if (this.state.charsInvalid) isValid = false;
    }

    if (this.state.chars[0] !== this.crits[0]) {
      if (this.state.charsInvalid === undefined) {
        newState.charsInvalid = true;
        isValid = false;
      } else if (this.state.charsInvalid) isValid = false;
      if (this.state.isDateInvalid === undefined) {
        newState.isDateInvalid = true;
        newState.dateValidationResult = false;
        isValid = false;
      }
      if (this.state.hasDateDiapasone && !this.state.isEndDateValid) {
        newState.endDateValidationResult = false;
        isValid = false;
      }
      if (this.state.hasDateDiapasone && (!this.state.endDateValidationResult || !this.state.dateValidationResult)) {
        isValid = false;
      }
      if (!this.state.ach) {
        newState.descrInvalid = true;
        isValid = false;
      } else newState.descrInvalid = false;
    } else if (this.state.critError) isValid = false;


    this.setState(newState);
    return isValid;
  }

  sendKrit() {
    if (!this.checkValidityBeforeSend()) return;

    const res = {};
    res.crit = this.state.chars[0];

    res.chars = this.state.chars;
    console.log(this.state.dateValue);

    if (this.state.dateValue && this.state.dateValue != '') {
      res.achDate = makeDate(this.state.dateValue);
    }
    if (this.state.endDateValue && this.state.endDateValue != '') {
      res.endingDate = makeDate(this.state.endDateValue);
    }

    res.achievement = this.state.ach;


    res.confirmations = [];
    if (this.state.confirmations) {
      for (let i = 0; i < this.state.confirmations.length; i++) {
        res.confirmations.push({
          id: this.state.confirmations[i]._id,
          additionalInfo: this.state.confirmations[i].additionalInfo,
        });
      }
    }

   // const form = document.forms.namedItem('fileinfo');
   // const oData = new FormData(form);
   //  oData.append('data', JSON.stringify(res));

    fetchSendWithoutRes('/api/add_achieve', {data: res}).then((response) => {
      if (response) this.props.history.push('/home')
    });
  }

  render() {
    const achievementPopover = (
      <Popover id="popover-basic">
        <Popover.Content style={{backgroundColor: 'rgb(243, 243, 255)'}}>
                    Название достижения должно позволить однозначно понять, что это за достижение. <br/>
          <span style={{color: '#4d4d4d'}}>
                    Примеры:<br/>
            <i>- Статья *название* с докладом на конференции *название*</i> <br/>
            <i>- Победа в олимпиаде *название*</i>
          </span>
        </Popover.Content>
      </Popover>
    );

    if (!CriteriasStore.criterias) return null;

    const getLineColor = function(isInvalid) {
      if (isInvalid === false) return '#19b319';
      if (isInvalid === true) return '#dc3545';
      return undefined;
    };

    return (
      <Panel className="col-md-9" id="panel">
        <div>
          <p className="headline">
                        Добавить достижение
          </p>
          <hr css={horizontalLine}/>
          <p className="desc_headline">
                        Добавление достижений для учета в конкурсе на академическую стипендию в повышенном размере
          </p>

          <div className="form_elem_with_left_border" style={{borderColor: getLineColor(this.state.charsInvalid)}}>
            <label htmlFor="check2" className="label">Характеристики: </label>
            <CriteriasForm crits={CriteriasStore.criterias} critError={this.state.critError}
              critErrorMessage={this.state.critErrorMessage}
              isInvalid={this.state.charsInvalid} valuesCallback={this.updateChars}/>
          </div>

          <div className="show_hide_c11">
          </div>
          {(this.state.chars && this.state.chars[0] != this.crits[0]) &&
          <FormGroup id="textForm" style={{marginBottom: '0px'}}>
            <div className="form_elem_with_left_border" style={{marginTop: '20px', borderColor: getLineColor(this.state.descrInvalid)}}>
              <label className="control-label" htmlFor="comment">Название достижения:
                <HelpButton overlay={achievementPopover} placement={"top"} />
              </label>
              <textarea className={'form-control area_text ' + (this.state.descrInvalid ? 'is-invalid' : '') +
              (this.state.descrInvalid === false ? ' is-valid' : '')} name="comment"
              placeholder={'Введите название достижения (однозначно определяющее его среди других)'}
              id="comment"
              required onChange={this.updateDescr} value={this.state.ach} style={{marginTop: '0', width: '100%'}}/>
            </div>


            <div className="form-group form_elem_with_left_border" style={{'marginTop': '1rem',
              'borderColor': getLineColor(this.state.hasDateDiapasone ?
                  !this.state.dateValidationResult || !this.state.endDateValidationResult :
                  this.state.isDateInvalid)}}>
              <div style={{display: 'flex'}}>
                <div>
                  <label
                    style={{'marginTop': 'auto'}}
                    className="form-check-label">Дата достижения: </label>
                </div>
                <div style={{marginLeft: '3rem'}}>
                  <label className="checkbox-inline" style={{cursor: 'pointer', color: '#595959'}}>
                    <input type="checkbox" id="defaultCheck1" onChange={(e) =>
                      this.setState({hasDateDiapasone: !this.state.hasDateDiapasone})}
                    style={{cursor: 'pointer', color: '#595959'}}/>
                    <span style={{marginLeft: '0.5rem', color: '#595959'}}>диапазон дат</span>
                  </label>
                </div>
              </div>

              {(this.state.hasDateDiapasone && this.state.dateDiapErrorMess) &&
                            <span className="redText">{this.state.dateDiapErrorMess}</span>}
              <div id="Date" style={{
                'display': 'flex',
                'alignItems': 'center',
                'marginTop': 'auto',
                'marginBottom': 'auto',
              }}>


                {!this.state.hasDateDiapasone &&
                                <AchievementDateInput className="form-control" isValid={this.state.dateValidationResult}
                                  updater={this.handleDateChange}/>}
                {this.state.hasDateDiapasone && <table>
                  <tbody>
                    <tr>
                      <td>С: </td>
                      <td><AchievementDateInput className="form-control"
                        isValid={this.state.dateValidationResult}
                        updater={this.handleStartDateChange}/></td>
                    </tr>
                    <tr>
                      <td>По: </td>
                      <td><AchievementDateInput className="form-control"
                        isValid={this.state.endDateValidationResult}
                        updater={this.handleEndDateChange}/></td>
                    </tr>
                  </tbody>
                </table>}
              </div>
            </div>
            <ConfirmationForm updateForm={this.updateConfirmations}/>
          </FormGroup>}

          <div className="input-group" style={{'display': 'none'}}>
            <span className="input-group-btn">
              <form encType="multipart/form-data" method="post" name="fileinfo">
                <label className="btn btn-info btn-file" htmlFor="multiple_input_group">
                  <div className="input required">

                    <input id="multiple_input_group" type="file" name="files" multiple/>

                  </div> подтверждающий документ
                </label>
              </form>
            </span>
            <span className="file-input-label"></span>
          </div>
          <div style={{width: '100%'}}>
            <button type="button" id="SubmitButton"
              className="btn btn-primary btn-md button_send"
              data-target="#exampleModal" value="отправить" onClick={this.sendKrit}

            >
                        Отправить
            </button>
          </div>
        </div>
      </Panel>);
  }
}

function makeDate(d) {
  if (!d) return undefined;
  const date = d.split('.');
  return new Date(date[2] + '-' + date[1] + '-' + date[0]);
}

export default withRouter(UserAddAchievement);
