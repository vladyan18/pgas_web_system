import React, {Component} from 'react';
import logo from '../../../img/gerb.png';
import '../../../style/user_main.css';
import userPersonalStore from '../../../stores/userPersonalStore'
import {observer} from "mobx-react";
import {withRouter} from "react-router";

class StaffHeader extends Component {
    constructor(props) {
        super(props);
        this.switchToUser = this.switchToUser.bind(this);
        this.goToMenu = this.goToMenu.bind(this);
    };

    switchToUser() {
        this.props.history.push('/home');
    }

    goToMenu() {
        this.props.history.push('/staff');
    }

    render() {
        return <header>
            <div className="row page_top">
                <div className="col-9 block_header">
                    <img src={logo} className="logo_img"/>
                    <div className="p_header">
                        Санкт-Петербургский государственный университет <br/>
                        {this.props.pageName}
                    </div>
                </div>


                <div className="col-3">

                    <div style={{"display": "flex", "justify-content": "flex-end"}}>
                        <div>
                            <button type="button"
                                    className="btn btn-outline-primary" onClick={this.goToMenu}>
                                Меню
                            </button>
                        </div>
                        <div className="btn-group" style={{"marginRight": "1rem"}}>
                            <button type="button" className="btn btn-warning dropdown-toggle" data-toggle="dropdown"
                                    aria-haspopup="true" aria-expanded="false">
                                ПМ-ПУ
                            </button>
                            <div className="dropdown-menu">
                                <a className="dropdown-item" href="#">Action</a>
                                <a className="dropdown-item" href="#">Another action</a>
                                <a className="dropdown-item" href="#">Something else here</a>
                                <div className="dropdown-divider"></div>
                                <a className="dropdown-item" href="#">Separated link</a>
                            </div>
                        </div>

                        {(userPersonalStore.Role == 'Admin' || userPersonalStore.Role == 'SuperAdmin') &&
                        <div style={{"marginRight": "1rem"}}>
                            <button type="button" id="SubmitButton"
                                    className="btn btn-outline-primary" onClick={this.switchToUser}>
                                Режим пользователя
                            </button>
                        </div>
                        }
                        <div>
                            <button type="button" id="logoutButton"
                                    className="btn btn-outline-danger">
                                Выход
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </header>
    }
}

export default withRouter(observer(StaffHeader))