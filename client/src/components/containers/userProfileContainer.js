import React, {Component} from 'react';
import '../../style/user_main.css';
import UserProfile from "../views/user/userProfile";
import {observer} from 'mobx-react';
import userPersonalStore from "../../stores/userPersonalStore";


class UserProfileContainer extends Component {
    constructor(props) {
        super(props);
    };

    render() {
        return <UserProfile fio={userPersonalStore.fio} Birthdate={userPersonalStore.Birthdate}
                            Faculty={userPersonalStore.Faculty}
                            Course={userPersonalStore.Course} Type={userPersonalStore.Type}/>
    }
}

export default observer(UserProfileContainer)