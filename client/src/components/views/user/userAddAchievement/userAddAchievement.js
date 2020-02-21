import React, {Component} from 'react';
import '../../../../style/add_portfolio.css';
import CriteriasForm from './criteriasForm';
import CriteriasStore from '../../../../stores/criteriasStore'
import {withRouter} from "react-router-dom";
import AchievementDateInput from "../../../AchievementDateInput";
import ConfirmationForm from "../userConfirmation/ConfirmationForm";
import userAchievesStore from "../../../../stores/userAchievesStore";
import userPersonalStore from "../../../../stores/userPersonalStore";
import {FormGroup, OverlayTrigger, Popover} from "react-bootstrap";
import HelpButton from "../helpButton";


class UserAddAchievement extends Component {

    constructor(props) {
        super(props);
        this.state = {isDateValid: false, dateValidationResult: true, endDateValidationResult: true};
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
        let st = this.state;
        if (value[0] == this.crits[0]) {
            if (userAchievesStore.achieves.some((x) => x.chars[0] == this.crits[0])) {
                st.critError = true;
                st.critErrorMessage = "Достижение за критерий 7а уже добавлено"
            } else if (userPersonalStore.Course == 1) {
                st.critError = true;
                st.critErrorMessage = "Первый курс не может получать баллы за 7а"
            } else st.critError = false
        } else st.critError = false;

        st.chars = value;
        if (isValid)
            st.charsInvalid = !isValid;
        else st.charsInvalid = undefined;
        this.setState(st);
    };

    updateConfirmations(confirms) {
        let st = this.state;
        st.confirmations = confirms;
        this.setState(st);
    }

    updateDescr(e) {
        let st = this.state;
        st.ach = e.target.value;
        this.setState(st);
    }

    isValid() {
        return (this.state && this.state.chars)
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

	if (this.crits[0] === '7а' && this.state.chars[0] === this.crits[0]) {
            if (this.state.charsInvalid === undefined) {
                this.setState({charsInvalid: true});
                return false;
            } else if (this.state.charsInvalid) return false;
        }

        if (this.state.chars[0] != this.crits[0]) {
            if (this.state.charsInvalid === undefined) {
                this.setState({charsInvalid: true});
                return false;
            } else if (this.state.charsInvalid) return false;
            if (!this.state.isDateValid) {
                let st = this.state;
                st.dateValidationResult = false;
                this.setState(st);
                return false
            }
            if (this.state.hasDateDiapasone && !this.state.isEndDateValid) {
                this.setState({endDateValidationResult: false});
                return false
            }
            if (this.state.hasDateDiapasone && (!this.state.endDateValidationResult || !this.state.dateValidationResult)) {
                return false
            }
            if (!this.state.ach) return false;
        } else if (this.state.critError) return false;

        return true
    }

    sendKrit() {
        if (!this.checkValidityBeforeSend()) return;

        let res = {};
        res.crit = this.state.chars[0];

        res.chars = this.state.chars;
        console.log(this.state.dateValue);

        if (this.state.dateValue && this.state.dateValue != '')
            res.achDate = makeDate(this.state.dateValue);
        if (this.state.endDateValue && this.state.endDateValue != '')
            res.endingDate = makeDate(this.state.endDateValue);

        res.achievement = this.state.ach;


        res.confirmations = [];
        if (this.state.confirmations)
            for (let i = 0; i < this.state.confirmations.length; i++) {
                res.confirmations.push({
                    id: this.state.confirmations[i]._id,
                    additionalInfo: this.state.confirmations[i].additionalInfo
                })
            }

        let form = document.forms.namedItem('fileinfo');
        let oData = new FormData(form);
        oData.append('data', JSON.stringify(res));

        fetch('/api/add_achieve', {
            method: 'post',
            body: oData
        }).then((oRes) => {
            if (oRes.status === 200) {
                this.props.history.push('/home');
            } else {
                console.log(
                    'Error ' + oRes.status + ' occurred when trying to upload your file.'
                )
            }
        })
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

        if (!CriteriasStore.criterias) return null

        return (
            <div className="col-md-9 rightBlock" id="panel">
                <div className="block_main_right">
                    <p className="headline">
                        Добавить достижение
                    </p>
                    <hr className="hr_blue"/>
                    <p className="desc_headline">
                        Добавление достижений для учета в конкурсе на академическую стипендию в повышенном размере
                    </p>

                    <div className="form_elem_with_left_border">
                        <label htmlFor="check2" className="label">Характеристики: </label>
                        <CriteriasForm crits={CriteriasStore.criterias} critError={this.state.critError}
                                   critErrorMessage={this.state.critErrorMessage}
                                   isInvalid={this.state.charsInvalid} valuesCallback={this.updateChars}/>
                    </div>

                    <div className="show_hide_c11">
                    </div>
                    {(this.state.chars && this.state.chars[0] != this.crits[0]) && <FormGroup id="textForm">
                        <div className="form_elem_with_left_border" style={{marginTop: "20px"}}>
                            <label className="control-label" htmlFor="comment">Название достижения:
                                <HelpButton  overlay={achievementPopover} placement={"top"} />
                            </label>
                    <textarea className="form-control area_text" name="comment"
                              placeholder={'Введите название достижения (однозначно определяющее его среди других)'}
                              id="comment"
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
                                    <label className="checkbox-inline" style={{cursor: "pointer", color: "#595959"}}>
                                        <input type="checkbox" id="defaultCheck1" onChange={(e) =>
                                            this.setState({hasDateDiapasone: !this.state.hasDateDiapasone})}
                                               style={{cursor: "pointer", color: "#595959"}}/>
                                        <span style={{marginLeft: "0.5rem", color: "#595959"}}>диапазон дат</span>
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
                                <AchievementDateInput className="form-control" isValid={this.state.dateValidationResult}
                                                      updater={this.handleDateChange}/>}
                                {this.state.hasDateDiapasone && <table>
                                    <tbody>
                                    <tr>
                                        <td>С:</td>
                                        <td><AchievementDateInput className="form-control"
                                                                  isValid={this.state.dateValidationResult}
                                                                  updater={this.handleStartDateChange}/></td>
                                    </tr>
                                    <tr>
                                        <td>По:</td>
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
                            className="btn btn-primary btn-md button_send"
                            data-target="#exampleModal" value="отправить" onClick={this.sendKrit}>
                        отправить
                    </button>
                </div>
            </div>)
    }
}

function makeDate(d) {
    if (!d) return undefined;
    let date = d.split('.');
    return new Date(date[2] + '-' + date[1] + '-' + date[0])
}

export default withRouter(UserAddAchievement)
