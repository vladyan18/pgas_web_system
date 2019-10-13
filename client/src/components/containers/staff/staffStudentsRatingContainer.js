import React, {Component} from 'react';
import '../../../style/user_main.css';
import {observer} from "mobx-react";
import StaffStudentsRating from "../../views/staff/staffStudentsRating";
import CurrentContestRatingStore from "../../../stores/staff/currentContestRatingStore";
import staffContextStore from "../../../stores/staff/staffContextStore";

class StaffStudentsContainer extends Component {
    constructor(props) {
        super(props);
        this.getUsers = this.getUsers.bind(this);
    };

    componentWillMount() {
        this.getUsers()
    }

    getUsers() {
        CurrentContestRatingStore.update(staffContextStore.faculty).then()
    }

    render() {
        return staffContextStore.criterias && <StaffStudentsRating data={CurrentContestRatingStore.users}/> || null
    }
}

export default observer(StaffStudentsContainer)