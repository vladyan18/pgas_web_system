import React from 'react';
import '../../../style/user_main.css';

function UserAchieves(props) {
    return <div className="col-md-9 rightBlock" id="panel">

        <p id="username" className="headline">{props.userName}</p>
        <hr className="hr_blue"/>
        <div className="profile">
            <div style={{'margin-top': 'auto', 'margin-bottom': 'auto'}}><span>Факультет: </span>
                <faculty id="faculty" className="info">{props.faculty}</faculty>
                <span style={{'margin-left': 1 + 'rem'}}>Курс: </span>
                <course id="course" className="info">{props.course}</course>
            </div>
            <form action="/getAnket">
                <input type="submit" id="download" className="btn btn-primary" value="Скачать анкету"/>
            </form>
        </div>

        <div className="category">
            <h3 className="achGroup">Текущие достижения</h3>
            <block_1 id="achBlock" style={{'display': 'block', 'overflow': 'auto'}}>
                <div id="row_docs"></div>
            </block_1>
        </div>

        <div className="category">
            <h3 className="achGroup">Архив достижений</h3>
            <block_1>
                <div id="archive_docs"></div>
            </block_1>
        </div>
    </div>
}

export default UserAchieves