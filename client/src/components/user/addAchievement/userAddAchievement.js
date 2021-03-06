import React, {Component} from 'react';
import '../../../style/add_portfolio.css';
import CriteriasForm from './criteriasForm';
import CriteriasStore, {fetchSendWithoutRes} from '../../../stores/criteriasStore';
import {withRouter} from 'react-router-dom';
import ConfirmationForm from '../confirmation/ConfirmationForm';
import userAchievesStore from '../../../stores/userAchievesStore';
import userPersonalStore from '../../../stores/userPersonalStore';
import {css, jsx} from '@emotion/core';
import CriterionSelector from './criterionSelector';
import DescriptionToCriterion from './DescriptionToCriterion';
import DescriptionField from './descriptionField';
import DateField from './dateField';
import SaveButton from './saveButton';
import UserMainPanel from '../../common/userMainPanel';
/** @jsx jsx */


class UserAddAchievement extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {isDateValid: false, chars: undefined};
    this.updateDescr = this.updateDescr.bind(this);
    this.handleDateChange = this.handleDateChange.bind(this);
    this.sendKrit = this.sendKrit.bind(this);
    this.updateChars = this.updateChars.bind(this);
    this.updateConfirmations = this.updateConfirmations.bind(this);
    this.onDateValidityChange = this.onDateValidityChange.bind(this);
    this.updateState = (state) => this.setState(state);
    this.state.crits = Object.keys(CriteriasStore.criterias);
  }

  updateChars(value, isValid) {
    const st = this.state;
    if (value[0] === this.state.crits[0]) {
      if (userAchievesStore.achieves.some((x) => x.chars[0] === this.state.crits[0])) {
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
  }

  updateConfirmations(confirms) {
    const st = this.state;
    st.confirmations = [...confirms];
    this.setState(st);
  }

  updateDescr(newValue) {
    const st = {};
    st.ach = newValue;
    if (newValue && newValue !== '') {
      st.descrInvalid = false;
    } else st.descrInvalid = undefined;
    this.setState(st);
  }

  handleDateChange(hasDiapasone, {startDate, endDate}) {
    const st = {...this.state};
    st.dateValue = startDate;
    st.endDateValue = hasDiapasone ? endDate : undefined;
    this.setState(st);
  }

  onDateValidityChange(isValid) {
    this.setState({isDateValid: isValid});
  }

  checkValidityBeforeSend() {
    const newState = {};
    let isValid = true;
    if (!this.state.chars) {
        this.setState({charsInvalid: true});
        return false;
    }
    if (this.state.crits[0] === '7а' && this.state.chars[0] === this.state.crits[0]) {
      if (this.state.charsInvalid === undefined) {
        newState.charsInvalid = true;
        isValid = false;
      } else if (this.state.charsInvalid) isValid = false;
    }

    if (this.state.chars[0] !== this.state.crits[0]) {
      if (this.state.charsInvalid === undefined) {
        newState.charsInvalid = true;
        isValid = false;
      } else if (this.state.charsInvalid) isValid = false;
      if (!this.state.isDateValid) {
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

  async sendKrit() {
    if (!this.checkValidityBeforeSend()) return;

    const res = {};
    res.crit = this.state.chars[0];

    res.chars = this.state.chars;

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

    const response = await fetchSendWithoutRes('/api/add_achieve', {data: res});
    if (response) {
          this.props.history.push('/home');
          return true;
    }
  }

  componentDidMount() {
      const crits = Object.keys(CriteriasStore.criterias);
      this.setState({crits: crits});
  }

    render() {
    if (!CriteriasStore.criterias) return null;

    const getLineColor = function(isInvalid) {
      if (isInvalid === false) return '#19b319';
      if (isInvalid === true) return '#dc3545';
      return undefined;
    };


    return (
        <UserMainPanel title={'Добавление достижения'}>
          {!this.state.chars && <p className="" style={{fontWeight: '350'}}>
            <b>Выберите критерий:</b>
          </p>}

            {this.state.crits && <CriterionSelector
                crits={this.state.crits}
               // descriptionRef={() => this.descriptionInputRef}
                chars={this.state.chars}
                updateCharsCb={this.updateState}/>}
            <DescriptionToCriterion crit={this.state.chars ? this.state.chars[0] : undefined}/>

            {this.state.chars && <div className="form_elem_with_left_border" style={{borderColor: getLineColor(this.state.charsInvalid)}}>
              <label htmlFor="critForm" className="label" onClick={() => this.setState({experimental: !this.state.experimental})}><b>Характеристики: </b></label>
                {CriteriasStore.criterias &&
                <CriteriasForm crits={CriteriasStore.criterias} critError={this.state.critError}
                               supressDescription={true}
                               critErrorMessage={this.state.critErrorMessage}
                               isInvalid={this.state.charsInvalid} valuesCallback={this.updateChars}
                               values={this.state.chars} experimental={true}
                />}

            </div>}

            {(!this.state.chars || this.state.chars[0] !== this.state.crits[0]) &&<><DescriptionField
                value={this.state.ach}
                descrInvalid={this.state.descrInvalid}
                descriptionRef={(input) => {
                  this.descriptionInputRef = input;
                }}
                dateRef={() => this.dateRef}
                updateDescr={this.updateDescr}
                updateChars={(newValue) => this.setState(newValue)}
                disableRecommend={this.state.charsInvalid === false && this.state.chars}
            />

            <DateField
                onValidityChange={this.onDateValidityChange}
                onDateChange={this.handleDateChange}
                dateRef={(input) => {
 this.dateRef = input;
}}
            /></>}

          <div className="show_hide_c11">
          </div>
          {(!this.state.chars || this.state.chars[0] !== this.state.crits[0]) &&

          <div style={{marginTop: '2rem'}}><ConfirmationForm updateForm={this.updateConfirmations}/></div>}

          <SaveButton
              sendKrit={this.sendKrit}
            chars={this.state.chars}
            charsInvalid={this.state.charsInvalid}
            descrInvalid={this.state.descrInvalid}
            isDateValid={this.state.isDateValid}
            crits={this.state.crits}
          />
        </UserMainPanel>);
  }
}

function makeDate(d) {
  if (!d) return undefined;
  const date = d.split('.');
  return new Date(date[2] + '-' + date[1] + '-' + date[0]);
}

export default withRouter(UserAddAchievement);
