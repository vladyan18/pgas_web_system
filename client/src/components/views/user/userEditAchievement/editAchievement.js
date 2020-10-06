import React, {Component} from 'react';
import '../../../../style/add_portfolio.css';
import CriteriasStore, {fetchSendWithoutRes} from '../../../../stores/criteriasStore'
import CriteriasForm from "../userAddAchievement/criteriasForm";
import {withRouter} from "react-router-dom";
import AchievementDateInput from "../../../AchievementDateInput";
import ConfirmationForm from "../userConfirmation/ConfirmationForm";
import userAchievesStore from "../../../../stores/userAchievesStore";
import userPersonalStore from "../../../../stores/userPersonalStore";
import {OverlayTrigger, Popover} from "react-bootstrap";
import HelpButton from "../helpButton";
import styled from '@emotion/styled';
import {css, jsx} from '@emotion/core';
import DescriptionField from "../userAddAchievement/descriptionField";
import DateField from "../userAddAchievement/dateField";
import CriterionSelector from "../userAddAchievement/criterionSelector";
import DescriptionToCriterion from "../userAddAchievement/DescriptionToCriterion";
import SaveButton from "../userAddAchievement/saveButton";
import DeleteButton from "./deleteButton";
/** @jsx jsx */

const Panel = styled.div`
    background-color: white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, .2);
    padding: 0 2rem;
    border-radius: 2px;
    @media only screen and (max-device-width: 480px) {
        padding: 0rem 1rem;
    }
            @media only screen and (max-device-width: 812px) {
        margin: 0 auto 2rem auto;
    }
`;

const ButtonPanel = styled.div`
   display: flex; 
   justify-content: space-between;
   margin: 0;
    @media only screen and (max-device-width: 480px) {
        display: block; 
    }   
`;


class EditAchievement extends Component {
    crits;

    constructor(props) {
        super(props);
        this.updateDescr = this.updateDescr.bind(this);
        this.editKrit = this.editKrit.bind(this);
        this.deleteAch = this.deleteAch.bind(this);
        this.handleDateChange = this.handleDateChange.bind(this);
        this.onDateValidityChange = this.onDateValidityChange.bind(this);
        this.updateConfirmations = this.updateConfirmations.bind(this);
        this.copyAch = this.copyAch.bind(this);
        this.crits = Object.keys(CriteriasStore.criterias);
        if (this.props.achieves) {
            let ach = this.props.achieves.filter((x) => x._id === this.props.achId)[0];
            this.state = {
                crits: CriteriasStore.criterias,
                ach: this.props.isCopying ? undefined : ach.achievement,
                chars: ach.chars,
                isDateValid: true,
                descrInvalid: !ach.achievement,
                charsInvalid: ach.status === 'Данные некорректны' ? true : false,
                dateValue: getDate(ach.achDate),
                endDateValue: ach.endingDate ? getDate(ach.endingDate) : undefined,
                confirmations: ach.confirmations,
                status: this.props.isCopying ? 'Ожидает проверки' : ach.status,
                ball: this.props.isCopying ? undefined : ach.ball,
                comment: this.props.isCopying ? undefined : ach.comment
            }
        }
    }

    updateConfirmations(confirms) {
        this.setState({confirmations: [...confirms]});
    }

    updateChars = (value, isValid) => {
        const st = this.state;
        if ((this.state.status === 'Ожидает проверки' ||
            this.state.status === 'Данные некорректны') && value[0] === this.crits[0]) {
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

    updateDescr(newValue) {
        const st = {}
        st.ach = newValue;
        if (newValue && newValue !== '') {
            st.descrInvalid = false;
        } else st.descrInvalid = undefined;
        this.setState(st);
    }

    isValid() {
        if (this.state)
            return this.state.chars;
        else return false
    }

    handleDateChange(hasDiapasone, {startDate, endDate}) {
        const st = {...this.state};
        st.dateValue = startDate;
        st.endDateValue = hasDiapasone ? endDate : undefined;
        this.setState(st);
    }

    onDateValidityChange(isValid) {
        console.log('ON D CHANGE', isValid)
        this.setState({isDateValid: isValid});
    }

    checkValidityBeforeSend() {

        if (this.state.chars[0] != '1 (7а)') {
            if (this.state.charsInvalid === undefined) {
                this.setState({charsInvalid: true});
                return false;
            } else if (this.state.charsInvalid) return false;
            if (!this.state.isDateValid) {
                return false
            }
            if (!this.state.ach) return false;
        } else if (this.state.critError) return false;

        return true
    }

    async editKrit(e) {
        e.preventDefault();
        if (!this.checkValidityBeforeSend()) return;

        let res = {};
        res.crit = this.state.chars[0];

        res.chars = this.state.chars;
        res.status = this.state.status
        res.ball = this.state.ball

        res.achievement = this.state.ach;
        res.confirmations = [];
        res.comment = this.state.comment
        if (this.state.confirmations)
            for (let i = 0; i < this.state.confirmations.length; i++) {
                const confirm = Object.assign({}, this.state.confirmations[i]);
                confirm.id = this.state.confirmations[i]._id;
                res.confirmations.push(confirm);
            }

        if (this.state.dateValue) res.achDate = makeDate(this.state.dateValue);
        if (this.state.endDateValue) res.endingDate = makeDate(this.state.endDateValue);
        else res.endingDate = undefined;

        let obj = {data: res, achId: this.props.achId};

        let endpoint;
        if (this.props.isCopying) {
            endpoint = '/api/add_achieve';
        } else {
            endpoint = '/api/update_achieve';
        }

        const response = await fetchSendWithoutRes(endpoint, obj);
        if (response) {
            this.props.history.push('/home');
            return true;
        }
    }

    async deleteAch() {
        if (!window.confirm('Вы уверены? Удаление достижения необратимо.')) return false;
        const response = await fetchSendWithoutRes('/api/delete_achieve', {achId: this.props.achId});
        if (response) {
            this.props.history.push('/home');
            return true;
        }
    }

    copyAch() {
        if (this.props.achieves) {
            let ach = this.props.achieves.filter((x) => x._id == this.props.achId)[0];
            let state = {
                crits: CriteriasStore.criterias,
                ach: '',
                isDateValid: true,
                descrInvalid: undefined,
                dateValue: getDate(ach.achDate),
                endDateValue: ach.endingDate ? getDate(ach.endingDate) : undefined,
                confirmations: [],
                charsInvalid: false,
                status: 'Ожидает проверки',
                ball: undefined,
                comment: '',
            };
            this.setState(state, () => {
                this.updateChars(ach.chars, true);
            });
        }

        this.props.copyAch();
    }

    render() {

        const getLineColor = function(isInvalid) {
            if (isInvalid === false) return '#19b319';
            if (isInvalid === true) return '#dc3545';
            return undefined;
        };

        if (!CriteriasStore.criterias) return null;
        const isDisabled = ['Принято', 'Принято с изменениями', 'Отказано'].includes(this.state.status);
        return (<Panel className="col-md-9" id="panel">
            <div>
                <ButtonPanel className="profile">
                    <p className="headline" style={{"margin-bottom": "auto"}}>
                        {this.props.isCopying ? 'Копирование достижения' : 'Изменение достижения'}
                    </p>
                    <div style={{'margin-top': 'auto'}}>
                        <button id="DeleteButton" className="btn btn-secondary" style={{marginRight: "1rem"}}
                                value="Назад" onClick={() => {
                            this.props.history.goBack()
                        }}>Назад
                        </button>
                        {!this.props.isCopying && <>
                        <button id="DeleteButton" className="btn btn-warning" style={{marginRight: "1rem"}}
                                value="Копировать" onClick={this.copyAch}>Копировать</button>
                            <DeleteButton onClick={this.deleteAch} disabled={userPersonalStore.IsInRating} />
                        </>}
                    </div>
                </ButtonPanel>

                <hr className="hr_blue"/>
                <p className="desc_headline">
                    {this.props.isCopying && 'Добавление нового достижения на основании существующего'}

                </p>

                <form id="form">
                </form>
                <div className="show_hide_c11">
                </div>

                {this.crits && <CriterionSelector
                    crits={this.crits}
                    descriptionRef={() => this.descriptionInputRef}
                    chars={this.state.chars}
                    updateCharsCb={(state) => this.setState(state)}
                    disabled={isDisabled}
                />}
                <DescriptionToCriterion crit={this.state.chars ? this.state.chars[0] : undefined}/>

                {(!this.state.chars || this.state.chars[0] !== this.crits[0]) &&<><DescriptionField
                    value={this.state.ach}
                    descrInvalid={this.state.descrInvalid}
                    descriptionRef={(input) => { this.descriptionInputRef = input; }}
                    dateRef={() => this.dateRef}
                    updateDescr={this.updateDescr}
                    updateChars={(newValue) => this.setState(newValue)}
                    disabled={isDisabled}
                />

                    <DateField
                        defaultValue={{startDate: this.state.dateValue, endDate: this.state.endDateValue}}
                        onValidityChange={this.onDateValidityChange}
                        onDateChange={this.handleDateChange}
                        dateRef={(input) => { this.dateRef = input; }}
                        disabled={isDisabled}
                    /></>}

                <div className="form_elem_with_left_border" style={{borderColor: getLineColor(this.state.charsInvalid)}}>
                    <label htmlFor="check2" className="label">Характеристики: </label>
                    <CriteriasForm crits={this.state.crits} valuesCallback={this.updateChars}
                                   disabled={isDisabled}
                                   isInvalid={this.state.charsInvalid}
                                   critError={this.state.critError}
                                   supressDescription={true}
                                   critErrorMessage={this.state.critErrorMessage}
                                   experimental={true}
                                   values={this.state.chars}/>
                </div>

                {(this.state.chars && this.state.chars[0] !== '1 (7а)' && this.state.chars[0] !== '7а') &&
                <div style={{marginTop: '2rem'}}>
                    <ConfirmationForm value={this.state.confirmations}
                                      updateForm={this.updateConfirmations} disabled={this.state.status !== 'Ожидает проверки' &&
                    this.state.status !== 'Данные некорректны'}/>
                </div>}

                <br/>
                <SaveButton
                    sendKrit={this.editKrit}
                    chars={this.state.chars}
                    charsInvalid={this.state.charsInvalid}
                    descrInvalid={this.state.descrInvalid}
                    isDateValid={this.state.isDateValid}
                    crits={this.state.crits}
                    type={this.props.isCopying ? 'add' : 'save'}
                />
            </div>
        </Panel>)
    }
}

function getDate(d) {
    if (!d) return undefined;
    d = new Date(d);
    return (d.getDate() > 9 ? d.getDate() : '0' + d.getDate()) + "." + ((d.getMonth() + 1) > 9 ? (d.getMonth() + 1) : '0' + (d.getMonth() + 1)) + "." + d.getFullYear();
}

function makeDate(d) {
    if (!d) return undefined;
    let date = d.split('.');
    return new Date(date[2] + '-' + date[1] + '-' + date[0])
}

export default withRouter(EditAchievement)
