import React, {Component} from 'react';
import '../../../style/user_main.css';
import AchievementDateInput from "../../AchievementDateInput";

class StaffChangeAchievement extends Component {
    constructor(props) {
        super(props);
        this.state = {dateValidationResult: true};
        this.updateDescr = this.updateDescr.bind(this);
        this.handleDateChange = this.handleDateChange.bind(this)
    };

    updateDescr(e) {
        let st = this.state;
        st.ach = e.target.value;
        this.setState(st)
    }

    handleDateChange(isValid, val) {

    }

    render() {
        let user = this.props.users.find((x) => x.Achievements.find((ach) => ach._id.toString() == this.props.achId));
        let achieve = user.Achievements.find((ach) => ach._id.toString() == this.props.achId);
        console.log('ACH', achieve);

        console.log(user);
        return (
            <div className="block">
                <div className="profile" style={{"display: flex; justify-content": "space-between", "margin": "0"}}>
                    <p className="headline" style={{"margin-bottom": "auto", "margin-right": "1rem"}}>
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
                    {user.user}
                </p>
                <label
                    htmlFor="comment" style={{"marginTop": "auto", "marginRight": "0.5rem"}}
                    className="control-label col-xs-2">Достижение: </label>
                <textarea className="form-control area_text" name="comment"
                          placeholder="Введите достижение (четкое, однозначное и полное описание)" id="comment"
                          required onChange={this.updateDescr} value={this.state.ach} defaultValue={achieve.achievement}
                          style={{width: "100%", margin: "0"}}/>

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
                                              updater={this.handleDateChange} defaultValue={getDate(achieve.achDate)}/>
                    </div>
                </div>

                <div>
                    <div style={{"display: flex; justify-content": "space-between"}}>
                        <label
                            style={{"marginTop": "auto", "marginRight": "0.5rem"}}
                            className="control-label col-xs-2">Характеристики: </label>
                        <button id="DeleteButton" className="btn btn-sm btn-outline-primary"
                                value="Назад" onClick={this.props.closeModal}>Изменить
                        </button>
                    </div>
                    <div style={{"display": "flex", 'flex-wrap': "wrap", 'max-width': '40rem'}}>
                        {achieve.chars.map((x) => {
                            let str = x;
                            if (str.length > 35) {
                                str = x.substr(0, 15) + '...' + x.substr(x.length - 15, 15)
                            }
                            return (<div className="charsItem" style={{
                                color: "white",
                                backgroundColor: "#151540",
                                paddingLeft: "6px",
                                paddingRight: "6px"
                            }}>{str}</div>)
                        })}
                    </div>

                    <label
                        htmlFor="staffComment" style={{"marginTop": "auto", "marginRight": "0.5rem"}}
                        className="control-label col-xs-2">Комментарий: </label>
                    <textarea className="form-control area_text" name="staffComment"
                              placeholder="Комментарий..." id="staffComment"
                              required onChange={this.updateComment} value={this.state.comment}
                              defaultValue={achieve.comment} style={{width: "100%", margin: "0"}}/>


                </div>


                <button id="DeleteButton" className="btn btn-warning" style={{marginTop: "3rem"}}
                        value="Назад" onClick={this.props.closeModal}>Сохранить
                </button>

            </div>

        )
    }
}

function getDate(d) {
    if (!d) return undefined;
    d = new Date(d);
    return (d.getDate() > 9 ? d.getDate() : '0' + d.getDate()) + "." + ((d.getMonth() + 1) > 9 ? (d.getMonth() + 1) : '0' + (d.getMonth() + 1)) + "." + d.getFullYear();
}

export default StaffChangeAchievement