import React, {Component} from 'react';
import '../../../style/add_portfolio.css';
import {withRouter} from "react-router";

class UserProfile extends Component {
    constructor(props) {
        super(props);
    };

    render() {
    return (<div className="col-md-9 rightBlock">
        <div className="block_main_right">
            <div className="profile" style={{'display': 'flex', 'justify-content': 'space-between'}}>
                <p className="headline" style={{'margin-bottom': 'auto'}}>
                    Мой профиль
                </p>
                <div style={{'margin-top': 'auto'}}>
                    <button id="editButton" className="btn btn-primary" value="Редактировать"
                            onClick={() => this.props.history.push('/edit_profile')}>Редактировать
                    </button>
                </div>
            </div>


            <hr className="hr_blue"/>
            <table style={{"margin-bottom": "2rem"}}>
                <tbody>
                <tr>
                    <td style={{'text-align': 'right'}}>Ф.И.О.:</td>
                    <td id="FIO" style={{'padding-left': '0.5rem'}}> {this.props.fio}</td>
                </tr>
                <tr>
                    <td style={{'text-align': 'right'}}>Почта СПбГУ:</td>
                    <td id="Faculty" style={{'padding-left': '0.5rem'}}>{this.props.SpbuId}</td>
                </tr>
                <tr>
                    <td style={{'text-align': 'right'}}>Дата рождения:</td>
                    <td id="Bdate" style={{'padding-left': '0.5rem'}}>{getDate(this.props.Birthdate)}</td>
                </tr>
                <tr>
                    <td style={{'text-align': 'right'}}>Факультет:</td>
                    <td id="Faculty" style={{'padding-left': '0.5rem'}}>{this.props.Faculty}</td>
                </tr>
                <tr>
                    <td style={{'text-align': 'right'}}>Ступень обучения:</td>
                    <td id="Type" style={{'padding-left': '0.5rem'}}>{this.props.Type}</td>
                </tr>
                <tr>
                    <td style={{'text-align': 'right'}}>Курс:</td>
                    <td id="Course" style={{'padding-left': '0.5rem'}}>{this.props.Course}</td>
                </tr>
                </tbody>
            </table>
        </div>
    </div>)
    }
}

function getDate(d) {
    if (!d) return undefined;
    d = new Date(d);
    return (d.getDate() > 9 ? d.getDate() : '0' + d.getDate()) + "." + ((d.getMonth() + 1) > 9 ? (d.getMonth() + 1) : '0' + (d.getMonth() + 1)) + "." + d.getFullYear();
}

export default withRouter(UserProfile)