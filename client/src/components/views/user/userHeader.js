import React, {Component} from 'react';
import logo from '../../../img/gerb.png';
import logoBss from '../../../img/logo_bss2.png';
import '../../../style/user_main.css';
import userPersonalStore from '../../../stores/userPersonalStore'
import {observer} from "mobx-react";
import {withRouter} from "react-router";

class UserHeader extends Component {
    constructor(props) {
        super(props);
        this.switchToStaff = this.switchToStaff.bind(this);
    };

    switchToStaff() {
        this.props.history.push('/staff');
    }

    render() {
        return <header>
            <div className="row page_top">
                <div className="col-8 block_header">
                    <img src={logoBss} className="logo_img" style={{ height: "45px"}}/>
                    <div className="p_header">
                        Студенческий совет СПбГУ <br/>
                        {this.props.pageName}
                    </div>
                </div>

                <div className="col-4 buttons_header">
                    <div style={{"display": "flex", "justify-content": "flex-end"}}>
                        {(userPersonalStore.Role == 'Admin' || userPersonalStore.Role == 'SuperAdmin') &&
                        <div style={{"marginRight": "1rem"}}>
                            <button type="button" id="SubmitButton"
                                    className="btn btn-outline-primary" onClick={this.switchToStaff}>
                                Управление
                            </button>
                        </div>
                        }
                        <div>
                            <form action="/api/logout">
                                <button type="submit" id="logoutButton"
                                        className="btn btn-outline-danger" action="/api/logout">
                                Выход
                            </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    }
}

export default withRouter(observer(UserHeader))