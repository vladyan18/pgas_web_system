import React, {Component} from 'react';
import '../../../style/user_main.css';
import {observer} from "mobx-react";
import StaffStudentsRating from "../../views/staff/staffStudentsRating";
import CurrentContestRatingStore from "../../../stores/staff/currentContestRatingStore";

class StaffStudentsContainer extends Component {
    constructor(props) {
        super(props);
        this.getUsers = this.getUsers.bind(this);
    };

    componentWillMount() {
        this.getUsers()
    }

    getUsers() {
        CurrentContestRatingStore.update()
    }

    render() {
        return <StaffStudentsRating data={CurrentContestRatingStore.users}/>
    }
}

export default observer(StaffStudentsContainer)