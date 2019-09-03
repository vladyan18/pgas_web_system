import React, {Component} from 'react';
import '../../../../style/add_portfolio.css';
import CriteriasStore from '../../../../stores/criteriasStore'
import CriteriasForm from "../userAddAchievement/criteriasForm";
import {withRouter} from "react-router";


class EditAchievement extends Component {
    crits;

    constructor(props) {
        super(props);
        this.updateDescr = this.updateDescr.bind(this);
        this.editKrit = this.editKrit.bind(this);
        this.deleteAch = this.deleteAch.bind(this);
        this.crits = CriteriasStore.criterias;
        if (this.props.achieves)
            this.state = {ach: this.props.achieves.filter((x) => x._id == this.props.achId)[0].achievement}
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

    editKrit() {
        let res = {};
        res.crit = this.state.chars[0];

        res.chars = this.state.chars;

        res.achievement = this.state.ach;

        let form = document.forms.namedItem('fileinfo');
        let oData = new FormData(form);
        oData.append('data', JSON.stringify(res));
        oData.append('achId', this.props.achId);
        fetch('/api/update_achieve', {
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

    deleteAch() {
        if (!window.confirm('Вы уверены? Удаление достижения необратимо.')) return false;

        var form = document.forms.namedItem('fileinfo');
        var oData = new FormData(form);
        oData.append('data', JSON.stringify(''));
        oData.append('achId', this.props.achId);

        fetch('/api/delete_achieve', {
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
        if (!this.props.achieves) return null;
        return (<div className="col-md-9 rightBlock" id="panel">
            <div className="block_main_right">
                <div className="profile" style={{"display: flex; justify-content": "space-between"}}>
                    <p className="headline" style={{"margin-bottom": "auto"}}>
                        Достижение
                    </p>
                    <div style={{'margin-top': 'auto'}}>
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
                <form id="textForm">
                    <textarea className="form-control area_text" name="comment"
                              placeholder="Введите достижение (четкое, однозначное и полное описание)" id="comment"
                              required onChange={this.updateDescr} value={this.state.ach}></textarea>
                </form>
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

export default withRouter(EditAchievement)