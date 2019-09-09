import React, {Component} from 'react';
import '../../../../style/add_portfolio.css';
import CriteriasForm from './criteriasForm';
import CriteriasStore from '../../../../stores/criteriasStore'
import {withRouter} from "react-router";
import AchievementDateInput from "../../../AchievementDateInput";


class UserAddAchievement extends Component {

    constructor(props) {
        super(props);
        this.state = {isDateValid: false, dateValidationResult: true};
        this.updateDescr = this.updateDescr.bind(this);
        this.handleDateChange = this.handleDateChange.bind(this);
        this.sendKrit = this.sendKrit.bind(this);
        this.updateChars = this.updateChars.bind(this)
    }

    updateChars(value) {
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
        return (this.state && this.state.chars)
    }

    handleDateChange(isValid, value) {
        let st = this.state;
        st.isDateValid = isValid;
        st.dateValidationResult = isValid;
        st.dateValue = value;
        this.setState(st);
    }

    sendKrit() {
        if (!this.state.isDateValid && this.state.chars[0] != '1 (7а)') {
            let st = this.state;
            st.dateValidationResult = false;
            this.setState(st);
            return
        }
        if (!this.state.ach && this.state.chars[0] != '1 (7а)') return;
        let res = {};
        res.crit = this.state.chars[0];

        res.chars = this.state.chars;

        res.achievement = this.state.ach;

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

                    <CriteriasForm crits={CriteriasStore.criterias} valuesCallback={this.updateChars}/>

                    <form id="form">
                    </form>
                    <div className="show_hide_c11">
                    </div>
                    {(this.state.chars && this.state.chars[0] != '1 (7а)') && <form id="textForm">
                    <textarea className="form-control area_text" name="comment"
                              placeholder="Введите достижение (четкое, однозначное и полное описание)" id="comment"
                              required onChange={this.updateDescr}/>


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
                                                      updater={this.handleDateChange}/>
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
                            data-target="#exampleModal" value="отправить" onClick={this.sendKrit}>
                        отправить
                    </button>
                </div>
            </div>)
    }
}

export default withRouter(UserAddAchievement)
