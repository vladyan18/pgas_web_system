import React from 'react';
import logo from '../../../img/gerb.png';
import '../../../style/user_main.css';

function UserHeader(props) {
    return <header>
        <div className="row page_top">
            <div className="col-9 block_header">
                <img src={logo} className="logo_img"/>
                <div className="p_header">
                    Санкт-Петербургский государственный университет <br/>
                    {props.pageName}
                </div>
            </div>
            <div className="col-3">
                <div className="exit">
                    <a href="/logout">Выход из личного кабинета</a>
                </div>
            </div>
        </div>
    </header>
}

export default UserHeader