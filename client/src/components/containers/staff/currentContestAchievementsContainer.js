import React, {Component} from 'react';
import '../../../style/user_main.css';
import AchievesUserGroups from "../../views/staff/achieves/achievesUserGroups";
import {observer} from "mobx-react";
import currentContestStore from "../../../stores/staff/currentContestStore";

class CurrentContestAchievesContainer extends Component {
    constructor(props) {
        super(props);
        this.getAchieves = this.getAchieves.bind(this);
    };

    componentWillMount() {
        this.getAchieves()
    }

    getAchieves() {
        currentContestStore.update();
    }

    render() {
        return <AchievesUserGroups users={currentContestStore.users} updater={this.getAchieves}/>
    }
}

export default observer(CurrentContestAchievesContainer)