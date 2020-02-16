import React, {Component} from 'react';
import '../../../style/user_main.css';
import {observer} from "mobx-react";
import StaffStudentsRating from "../../views/staff/staffStudentsRating";
import CurrentContestRatingStore from "../../../stores/staff/currentContestRatingStore";
import staffContextStore from "../../../stores/staff/staffContextStore";
import {withRouter} from "react-router-dom";
import {fetchGet} from "../../../services/fetchService";
import userPersonalStore from "../../../stores/userPersonalStore";
import criteriasStore from "../../../stores/criteriasStore";

class UserStudentsContainer extends Component {
    constructor(props) {
        super(props);
        this.state = {}
        this.getUsers = this.getUsers.bind(this);
    };

    componentDidMount() {

        this.getUsers().then()
    }

    async getUsers() {
        let response = await fetchGet('/api/getRatingForUser', {faculty: userPersonalStore.Faculty})
        this.setState({users: response.Users})
    }

    render() {

        return (criteriasStore.criterias && this.state.users) &&
            <StaffStudentsRating
                faculty={userPersonalStore.Faculty}
                directions={userPersonalStore.Direction ? [userPersonalStore.Direction] : undefined}
                userMode={true}
                crits={criteriasStore.criterias}
                data={this.state.users}/> || null
    }
}

export default observer(UserStudentsContainer)