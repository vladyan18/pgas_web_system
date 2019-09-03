import React, {Component} from 'react';
import logo from '../../../img/gerb.png';
import '../../../style/user_main.css';
import userPersonalStore from '../../../stores/userPersonalStore'
import {observer} from "mobx-react";

class UserHeader extends Component {
    constructor(props) {
        super(props);
    };

    render() {
        return <header>
            <div className="row page_top">
                <div className="col-6 block_header">
                    <img src={logo} className="logo_img"/>
                    <div className="p_header">
                        Санкт-Петербургский государственный университет <br/>
                        {this.props.pageName}
                    </div>
                </div>

                <div className="col-3">
                    {(userPersonalStore.Role == 'Admin' || userPersonalStore.Role == 'SuperAdmin') &&
                    <button type="button" id="SubmitButton"
                            className="btn btn-success btn-sm button_send"
                            data-target="#exampleModal" value="Панель сотрудника">
                        Панель сотрудника
                    </button>
                    }
                </div>
                <div className="col-3">


                    <div className="exit">
                        <a href="/logout">Выход из личного кабинета</a>
                    </div>

                </div>
            </div>
        </header>
    }
}

export default observer(UserHeader)