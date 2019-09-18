import React, {Component} from 'react';
import logo from '../../../img/gerb.png';
import '../../../style/user_main.css';
import userPersonalStore from '../../../stores/userPersonalStore'
import {observer} from "mobx-react";
import {withRouter} from "react-router";
import Dropdown from "react-bootstrap/Dropdown"
import DropdownButton from "react-bootstrap/DropdownButton"
import staffContextStore from "../../../stores/staff/staffContextStore";
import staffNewAchievementsStore from "../../../stores/staff/staffNewAchievementsStore";
import currentContestStore from "../../../stores/staff/currentContestStore";
import currentContestRatingStore from "../../../stores/staff/currentContestRatingStore";

class StaffHeader extends Component {
    constructor(props) {
        super(props);
        this.switchToUser = this.switchToUser.bind(this);
        this.goToMenu = this.goToMenu.bind(this);
        this.switchFaculty = this.switchFaculty.bind(this)
    };

    switchToUser() {
        this.props.history.push('/home');
    }

    switchFaculty(faculty, event) {
        event.preventDefault();
        staffContextStore.changeFaculty(faculty).then();
        staffNewAchievementsStore.update(faculty).then();
        currentContestStore.update(faculty).then();
        currentContestRatingStore.update(faculty).then()

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


                <div className="col-3 buttons_header ">

                    <div className="admin_header_buttons_group">
                        <div>
                            <button type="button"
                                    className="btn btn-outline-primary" onClick={this.goToMenu}>
                                Меню
                            </button>
                        </div>
                        <DropdownButton variant="warning" title={staffContextStore.faculty}>
                            {userPersonalStore.Rights && userPersonalStore.Rights.map((x) => (
                                <Dropdown.Item key={x} onClick={e => this.switchFaculty(x, e)}>{x}</Dropdown.Item>
                            ))
                            }
                        </DropdownButton>

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