import React, {Component} from 'react';
import '../../../style/user_main.css';
import AchievesUserGroups from "../../views/staff/achieves/achievesUserGroups";
import staffNewAchievementsStore from "../../../stores/staff/staffNewAchievementsStore";
import {observer} from "mobx-react";
import staffContextStore from "../../../stores/staff/staffContextStore";

class NewAchievesContainer extends Component {
    constructor(props) {
        super(props);
        this.getAchieves = this.getAchieves.bind(this);
    };

    componentWillMount() {
        this.getAchieves()
    }

    getAchieves() {
        staffNewAchievementsStore.update(staffContextStore.faculty).then()
    }

    render() {
        return <AchievesUserGroups users={staffNewAchievementsStore.users} updater={this.getAchieves}/>
    }
}

export default observer(NewAchievesContainer)