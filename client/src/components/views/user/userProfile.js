import React from 'react';
import '../../../style/add_portfolio.css';

function UserProfile(props) {
    return (<div className="col-md-9 rightBlock">
        <div className="block_main_right">
            <div className="profile" style={{'display': 'flex', 'justify-content': 'space-between'}}>
                <p className="headline" style={{'margin-bottom': 'auto'}}>
                    Мой профиль
                </p>
                <div style={{'margin-top': 'auto'}}>
                    <a href="/editProfile">
                        <button id="editButton" className="btn btn-primary" value="Редактировать">Редактировать</button>
                    </a>
                </div>
            </div>


            <hr className="hr_blue"/>
            <table>
                <tbody>
                <tr>
                    <td style={{'text-align': 'right'}}>Ф.И.О.:</td>
                    <td id="FIO" style={{'padding-left': '0.5rem'}}></td>
                </tr>
                <tr>
                    <td style={{'text-align': 'right'}}>Дата рождения:</td>
                    <td id="Bdate" style={{'padding-left': '0.5rem'}}></td>
                </tr>
                <tr>
                    <td style={{'text-align': 'right'}}>Факультет:</td>
                    <td id="Faculty" style={{'padding-left': '0.5rem'}}></td>
                </tr>
                <tr>
                    <td style={{'text-align': 'right'}}>Ступень обучения:</td>
                    <td id="Type" style={{'padding-left': '0.5rem'}}></td>
                </tr>
                <tr>
                    <td style={{'text-align': 'right'}}>Курс:</td>
                    <td id="Course" style={{'padding-left': '0.5rem'}}></td>
                </tr>
                </tbody>
            </table>
        </div>
    </div>)
}

export default UserProfile