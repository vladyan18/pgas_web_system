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
/** @jsx jsx */

const Panel = styled.div`
    background-color: white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, .2);
    padding: 0 2rem;
    @media only screen and (max-device-width: 480px) {
        padding: 0 1rem;
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
        this.handleStartDateChange = this.handleStartDateChange.bind(this);
        this.handleEndDateChange = this.handleEndDateChange.bind(this);
        this.updateConfirmations = this.updateConfirmations.bind(this);
        this.copyAch = this.copyAch.bind(this);
        this.crits = Object.keys(CriteriasStore.criterias);
        if (this.props.achieves) {
            let ach = this.props.achieves.filter((x) => x._id == this.props.achId)[0];
            this.state = {
                crits: CriteriasStore.criterias,
                ach: this.props.isCopying ? undefined : ach.achievement,
                isDateValid: true,
                isEndDateValid: !!ach.endingDate,
                dateValidationResult: true,
                endDateValidationResult: true,
                dateValue: getDate(ach.achDate),
                endDateValue: ach.endingDate ? getDate(ach.endingDate) : undefined,
                hasDateDiapasone: !!ach.endingDate,
                confirmations: ach.confirmations,
                charsInvalid: false,
                status: this.props.isCopying ? 'Ожидает проверки' : ach.status,
                ball: this.props.isCopying ? undefined : ach.ball,
                comment: this.props.isCopying ? undefined : ach.comment
            }
        }
    }

    updateConfirmations(confirms) {
        console.log(confirms)
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

    updateDescr(e) {
        let st = this.state;
        st.ach = e.target.value;
        this.setState(st);
    }

    isValid() {
        if (this.state)
            return this.state.chars;
        else return false
    }

    handleDateChange(isValid, value) {
        let st = this.state;
        st.isDateValid = isValid;
        st.dateValidationResult = isValid;
        st.dateValue = value;
        this.setState(st);
    }

    handleStartDateChange(isValid, value) {
        let st = this.state;
        st.isDateValid = isValid;
        st.dateValidationResult = isValid;
        st.dateValue = value;
        if (isValid && st.isEndDateValid) {
            if (makeDate(value) > makeDate(st.endDateValue)) {
                st.dateValidationResult = false;
                st.dateDiapErrorMess = "Начальная дата не может быть после конечной"
            } else {
                st.dateDiapErrorMess = undefined;
                st.endDateValidationResult = true
            }
        }
        this.setState(st);
    }

    handleEndDateChange(isValid, value) {
        let st = this.state;
        st.isEndDateValid = isValid;
        st.endDateValidationResult = isValid;
        st.endDateValue = value;
        if (isValid && st.isDateValid) {
            if (makeDate(value) < makeDate(st.dateValue)) {
                st.endDateValidationResult = false;
                st.dateDiapErrorMess = "Начальная дата не может быть после конечной"
            } else {
                st.dateDiapErrorMess = undefined;
                st.dateValidationResult = true
            }
        }
        this.setState(st);
    }

    checkValidityBeforeSend() {

        if (this.state.chars[0] != '1 (7а)') {
            if (this.state.charsInvalid === undefined) {
                console.log('1');
                this.setState({charsInvalid: true});
                return false;
            } else if (this.state.charsInvalid) return false;
            if (!this.state.isDateValid) {
                console.log('2');
                let st = this.state;
                st.dateValidationResult = false;
                this.setState(st);
                return false
            }
            if (this.state.hasDateDiapasone && !this.state.isEndDateValid) {
                console.log('3');
                this.setState({endDateValidationResult: false});
                return false
            }
            if (this.state.hasDateDiapasone && (!this.state.endDateValidationResult || !this.state.dateValidationResult)) {
                console.log('4');
                return false
            }
            if (!this.state.ach) return false;
            console.log('5')
        } else if (this.state.critError) return false;

        return true
    }

    editKrit(e) {
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

        if (this.state.hasDateDiapasone)
            res.endingDate = makeDate(this.state.endDateValue);
        else res.endingDate = undefined;

        let obj = {data: res, achId: this.props.achId};

        let endpoint;
        if (this.props.isCopying) {
            endpoint = '/api/add_achieve';
        } else {
            endpoint = '/api/update_achieve';
        }

        fetchSendWithoutRes(endpoint, obj).then((response) => {
            if (response) this.props.history.push('/home')
        })
    }

    deleteAch() {
        if (!window.confirm('Вы уверены? Удаление достижения необратимо.')) return false;

        fetchSendWithoutRes('/api/delete_achieve', {achId: this.props.achId}).then((response) => {
            if (response) this.props.history.push('/home');
        })
    }

    copyAch() {
        if (this.props.achieves) {
            let ach = this.props.achieves.filter((x) => x._id == this.props.achId)[0];
            let state = {
                crits: CriteriasStore.criterias,
                ach: '',
                isDateValid: true,
                isEndDateValid: !!ach.endingDate,
                dateValidationResult: true,
                endDateValidationResult: true,
                dateValue: getDate(ach.achDate),
                endDateValue: ach.endingDate ? getDate(ach.endingDate) : undefined,
                hasDateDiapasone: !!ach.endingDate,
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
        const achievementPopover = (
            <Popover id="popover-basic">
                <Popover.Content style={{backgroundColor: "rgb(243, 243, 255)"}}>
                    Название достижения должно позволить однозначно понять, что это за достижение. <br/>
                    <span style={{color: "#4d4d4d"}}>
                    Примеры:<br/>
                    <i>- Статья *название* с докладом на конференции *название*</i> <br/>
                    <i>- Победа в олимпиаде *название*</i>
                    </span>
                </Popover.Content>
            </Popover>
        );

        if (!CriteriasStore.criterias) return null;

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
                        <button id="DeleteButton" className="btn btn-danger"
                                value="Удалить" onClick={this.deleteAch} disabled={this.state.status != 'Ожидает проверки'&&
                        this.state.status !== 'Данные некорректны' }>Удалить
                        </button>
                        </>}
                    </div>
                </ButtonPanel>

                <hr className="hr_blue"/>
                <p className="desc_headline">
                    {this.props.isCopying && 'Добавление нового достижения на основании существующего'}

                </p>

                <div className="form_elem_with_left_border">
                    <label htmlFor="check2" className="label">Характеристики: </label>
                    <CriteriasForm crits={this.state.crits} valuesCallback={this.updateChars} disabled={this.state.status !== 'Ожидает проверки' &&
                    this.state.status !== 'Данные некорректны'}
                                   isInvalid={this.state.charsInvalid}
                               critError={this.state.critError}
                               critErrorMessage={this.state.critErrorMessage}
                               values={this.props.achieves.filter((x) => x._id == this.props.achId)[0].chars}/>
                </div>

                <form id="form">
                </form>
                <div className="show_hide_c11">
                </div>
                {(this.state.chars && this.state.chars[0] !== '1 (7а)' && this.state.chars[0] !== '7а') && <form id="textForm">
                    <div className="form_elem_with_left_border" style={{marginTop: "20px"}}>
                        <label className="control-label" htmlFor="comment">Название достижения:
                            <HelpButton  overlay={achievementPopover} placement={"top"} />
                        </label>
                        <textarea className="form-control area_text" name="comment" disabled={this.state.status !== 'Ожидает проверки' &&
                        this.state.status !== 'Данные некорректны'}
                                  placeholder="Введите достижение (четкое, однозначное и полное описание)" id="comment"
                                  required onChange={this.updateDescr} value={this.state.ach} style={{marginTop: "0"}}/>
                    </div>


                    <div className="form-group form_elem_with_left_border" style={{"marginTop": "1rem"}}>
                        <div style={{display: "flex"}}>
                            <div>
                                <label
                                    style={{"marginTop": "auto"}}
                                    className="form-check-label">Дата достижения: </label>
                            </div>
                            <div style={{marginLeft: "3rem"}}>
                                <input className="form-check-input" type="checkbox" id="defaultCheck1" onChange={(e) =>
                                    this.setState({hasDateDiapasone: !this.state.hasDateDiapasone})}
                                       checked={this.state.hasDateDiapasone}
                                       style={{cursor: "pointer"}} disabled={this.state.status !== 'Ожидает проверки' &&
                                this.state.status !== 'Данные некорректны'}/>
                                <label className="form-check-label" htmlFor="defaultCheck1"
                                       style={{cursor: "pointer", color: "#595959"}}>
                                    диапазон дат
                                </label>
                            </div>
                        </div>

                        {(this.state.hasDateDiapasone && this.state.dateDiapErrorMess) &&
                        <span className="redText">{this.state.dateDiapErrorMess}</span>}
                        <div id="Date" style={{
                            "display": "flex",
                            "align-items": "center",
                            "marginTop": "auto",
                            "margin-bottom": "auto"
                        }}>


                            {!this.state.hasDateDiapasone &&
                            <AchievementDateInput className="form-control" isValid={this.state.dateValidationResult} disabled={this.state.status != 'Ожидает проверки' &&
                            this.state.status !== 'Данные некорректны'}
                                                  updater={this.handleDateChange} defaultValue={this.state.dateValue}/>}
                            {this.state.hasDateDiapasone && <table>
                                <tbody>
                                <tr>
                                    <td>С:</td>
                                    <td><AchievementDateInput className="form-control" disabled={this.state.status != 'Ожидает проверки' &&
                                    this.state.status !== 'Данные некорректны'}
                                                              isValid={this.state.dateValidationResult}
                                                              updater={this.handleStartDateChange}
                                                              defaultValue={this.state.dateValue}/></td>
                                </tr>
                                <tr>
                                    <td>По:</td>
                                    <td><AchievementDateInput className="form-control" disabled={this.state.status != 'Ожидает проверки' &&
                                    this.state.status !== 'Данные некорректны'}
                                                              isValid={this.state.endDateValidationResult}
                                                              updater={this.handleEndDateChange}
                                                              defaultValue={this.state.endDateValue}/></td>
                                </tr>
                                </tbody>
                            </table>}
                        </div>
                    </div>
                    <ConfirmationForm value={this.state.confirmations} updateForm={this.updateConfirmations} disabled={this.state.status !== 'Ожидает проверки' &&
                    this.state.status !== 'Данные некорректны'}/>
                </form>}


                <br/>

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
                <button type="button" id="SubmitButton" disabled={!this.isValid()}
                        className={"btn " + (this.props.isCopying ? 'btn-primary' : 'btn-success') + " btn-md button_send"}
                        data-target="#exampleModal" value="сохранить" onClick={this.editKrit}>
                    {this.props.isCopying ? 'Добавить достижение' : 'Сохранить'}
                </button>
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
