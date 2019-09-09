import React, {Component} from 'react';
import '../../../../style/add_portfolio.css';
import CriteriasStore, {fetchSendWithoutRes} from '../../../../stores/criteriasStore'
import CriteriasForm from "../userAddAchievement/criteriasForm";
import {withRouter} from "react-router";
import AchievementDateInput from "../../../AchievementDateInput";


class EditAchievement extends Component {
    crits;

    constructor(props) {
        super(props);
        this.updateDescr = this.updateDescr.bind(this);
        this.editKrit = this.editKrit.bind(this);
        this.deleteAch = this.deleteAch.bind(this);
        this.handleDateChange = this.handleDateChange.bind(this);
        this.crits = CriteriasStore.criterias;
        if (this.props.achieves)
            this.state = {
                ach: this.props.achieves.filter((x) => x._id == this.props.achId)[0].achievement,
                isDateValid: false,
                dateValidationResult: true,
                achDate: getDate(this.props.achieves.filter((x) => x._id == this.props.achId)[0].achDate)
            }
    }

    updateChars = (value) => {
        let st = this.state;
        st.chars = value;
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
        st.achDate = value;
        this.setState(st);
    }

    editKrit() {
        let res = {};
        res.crit = this.state.chars[0];

        res.chars = this.state.chars;

        res.achievement = this.state.ach;

        if (this.state.achDate) res.achDate = makeDate(this.state.achDate);

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
        if (!this.props.achieves) return null;
        return (<div className="col-md-9 rightBlock" id="panel">
            <div className="block_main_right">
                <div className="profile" style={{"display: flex; justify-content": "space-between"}}>
                    <p className="headline" style={{"margin-bottom": "auto"}}>
                        Достижение
                    </p>
                    <div style={{'margin-top': 'auto'}}>
                        <button id="DeleteButton" className="btn btn-secondary"
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

                <CriteriasForm crits={this.crits} valuesCallback={this.updateChars}
                               values={this.props.achieves.filter((x) => x._id == this.props.achId)[0].chars}/>

                <form id="form">
                </form>
                <div className="show_hide_c11">
                </div>
                {(this.state.chars && this.state.chars[0] != '1 (7а)') && <form id="textForm">
                    <textarea className="form-control area_text" name="comment"
                              placeholder="Введите достижение (четкое, однозначное и полное описание)" id="comment"
                              required onChange={this.updateDescr} value={this.state.ach}/>


                    <div className="form-group" style={{"display": "flex", "marginTop": "1rem"}}>
                        <label
                            htmlFor="Date" style={{"marginTop": "auto", "marginRight": "0.5rem"}}
                            className="control-label col-xs-2">Дата достижения: </label>
                        <div id="Date" style={{
                            "display": "flex",
                            "align-items": "center",
                            "marginTop": "auto",
                            "margin-bottom": "auto"
                        }}>
                            <AchievementDateInput className="form-control" isValid={this.state.dateValidationResult}
                                                  updater={this.handleDateChange} defaultValue={this.state.achDate}/>
                        </div>
                    </div>

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