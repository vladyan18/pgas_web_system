import React, {Component} from 'react';
import '../../../../style/add_portfolio.css';
import CriteriasStore, {fetchSendWithoutRes} from '../../../../stores/criteriasStore'
import CriteriasForm from "../userAddAchievement/criteriasForm";
import {withRouter} from "react-router";
import AchievementDateInput from "../../../AchievementDateInput";
import ConfirmationForm from "../userConfirmation/ConfirmationForm";
import userAchievesStore from "../../../../stores/userAchievesStore";
import userPersonalStore from "../../../../stores/userPersonalStore";
import {OverlayTrigger, Popover} from "react-bootstrap";


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
        this.crits = CriteriasStore.criterias;
        if (this.props.achieves) {
            let ach = this.props.achieves.filter((x) => x._id == this.props.achId)[0];
            this.state = {
                crits: CriteriasStore.criterias,
                ach: ach.achievement,
                isDateValid: true,
                isEndDateValid: !!ach.endingDate,
                dateValidationResult: true,
                endDateValidationResult: true,
                dateValue: getDate(ach.achDate),
                endDateValue: ach.endingDate ? getDate(ach.endingDate) : undefined,
                hasDateDiapasone: !!ach.endingDate,
                confirmations: ach.confirmations,
                charsInvalid: false
            }
        }
    }

    updateConfirmations(confirms) {
        this.setState({confirmations: confirms});
    }

    updateChars = (value, isValid) => {
        let st = this.state;
        if (value[0] == '1 (7а)') {
            if (userAchievesStore.achieves.some((x) => (x.chars[0] == '1 (7а)' && x._id != this.props.achId))) {
                st.critError = true;
                st.critErrorMessage = "Достижение за критерий 7а уже добавлено"
            } else if (userPersonalStore.Course == 1) {
                st.critError = true;
                st.critErrorMessage = "Первый курс не может получать баллы за 7а"
            } else st.critError = false
        } else st.critError = false;

        st.chars = value;
        console.log('CHARS', isValid);
        if (isValid)
            st.charsInvalid = !isValid;
        else st.charsInvalid = undefined;
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

        res.achievement = this.state.ach;
        res.confirmations = [];
        if (this.state.confirmations)
            for (let i = 0; i < this.state.confirmations.length; i++) {
                res.confirmations.push({
                    id: this.state.confirmations[i]._id,
                    additionalInfo: this.state.confirmations[i].additionalInfo
                })
            }

        if (this.state.dateValue) res.achDate = makeDate(this.state.dateValue);

        if (this.state.hasDateDiapasone)
            res.endingDate = makeDate(this.state.endDateValue);
        else res.endingDate = undefined;

        let obj = {data: res, achId: this.props.achId};

        fetchSendWithoutRes('/api/update_achieve', obj).then((response) => {
            if (response) this.props.history.push('/home')
        })
    }

    deleteAch() {
        if (!window.confirm('Вы уверены? Удаление достижения необратимо.')) return false;

        fetchSendWithoutRes('/api/delete_achieve', {achId: this.props.achId}).then((response) => {
            if (response) this.props.history.push('/home');
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
        return (<div className="col-md-9 rightBlock" id="panel">
            <div className="block_main_right">
                <div className="profile" style={{"display: flex; justify-content": "space-between"}}>
                    <p className="headline" style={{"margin-bottom": "auto"}}>
                        Достижение
                    </p>
                    <div style={{'margin-top': 'auto'}}>
                        <button id="DeleteButton" className="btn btn-secondary" style={{marginRight: "1rem"}}
                                value="Назад" onClick={() => {
                            this.props.history.goBack()
                        }}>Назад
                        </button>
                        <button id="DeleteButton" className="btn btn-danger"
                                value="Удалить" onClick={this.deleteAch}>Удалить
                        </button>
                    </div>
                </div>

                <hr className="hr_blue"/>
                <p className="desc_headline">
                    Изменение достижения
                </p>

                <div className="form_elem_with_left_border">
                    <label htmlFor="check2" className="label">Характеристики: </label>
                    <CriteriasForm crits={this.state.crits} valuesCallback={this.updateChars}
                                   isInvalid={this.state.charsInvalid}
                               critError={this.state.critError}
                               critErrorMessage={this.state.critErrorMessage}
                               values={this.props.achieves.filter((x) => x._id == this.props.achId)[0].chars}/>
                </div>

                <form id="form">
                </form>
                <div className="show_hide_c11">
                </div>
                {(this.state.chars && this.state.chars[0] != '1 (7а)') && <form id="textForm">
                    <div className="form_elem_with_left_border" style={{marginTop: "20px"}}>
                        <label className="control-label" htmlFor="comment">Название достижения:
                            <OverlayTrigger trigger={['click', 'focus']} placement="bottom"
                                            overlay={achievementPopover}>
                                <i className={"fas fa-question-circle"}
                                   style={{cursor: "pointer", marginLeft: "0.3rem", marginTop: "0px"}} onClick={(e) => {
                                    e.preventDefault()
                                }}/>
                            </OverlayTrigger>
                        </label>
                        <textarea className="form-control area_text" name="comment"
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
                                       style={{cursor: "pointer"}}/>
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
                            <AchievementDateInput className="form-control" isValid={this.state.dateValidationResult}
                                                  updater={this.handleDateChange} defaultValue={this.state.dateValue}/>}
                            {this.state.hasDateDiapasone && <table>
                                <tbody>
                                <tr>
                                    <td>С:</td>
                                    <td><AchievementDateInput className="form-control"
                                                              isValid={this.state.dateValidationResult}
                                                              updater={this.handleStartDateChange}
                                                              defaultValue={this.state.dateValue}/></td>
                                </tr>
                                <tr>
                                    <td>По:</td>
                                    <td><AchievementDateInput className="form-control"
                                                              isValid={this.state.endDateValidationResult}
                                                              updater={this.handleEndDateChange}
                                                              defaultValue={this.state.endDateValue}/></td>
                                </tr>
                                </tbody>
                            </table>}
                        </div>
                    </div>
                    <ConfirmationForm value={this.state.confirmations} updateForm={this.updateConfirmations}/>
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
                        className="btn btn-primary btn-md button_send"
                        data-target="#exampleModal" value="отправить" onClick={this.editKrit}>
                    отправить
                </button>
            </div>
        </div>)
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