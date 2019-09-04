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
        fetch("/api/checked", {
            method: "GET"
        }).then((resp) => {
            return resp.json()
        })
            .then((data) => {
                console.log('DATA: ' + JSON.stringify(data));
                currentContestStore.users = data.Info
            })
            .catch((error) => console.log(error))
    }

    render() {
        return <AchievesUserGroups users={currentContestStore.users} updater={this.getAchieves}/>
    }
}

export default observer(CurrentContestAchievesContainer)