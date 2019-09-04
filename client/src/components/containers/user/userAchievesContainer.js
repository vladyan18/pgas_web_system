import React, {Component} from 'react';
import '../../../style/user_main.css';
import UserAchieves from "../../views/user/userAchieves/userAchieves";
import {observer} from "mobx-react";
import userPersonalStore from "../../../stores/userPersonalStore";

class UserAchievesContainer extends Component {
    constructor(props) {
        super(props);
    };


    render() {
        return <UserAchieves userName={userPersonalStore.fio} faculty={userPersonalStore.Faculty}
                             course={userPersonalStore.Course}/>
    }
}

export default observer(UserAchievesContainer)