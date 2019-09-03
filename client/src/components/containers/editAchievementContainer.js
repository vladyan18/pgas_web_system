import React, {Component} from 'react';
import '../../style/user_main.css';
import EditAchievement from "../views/user/userEditAchievement/editAchievement";
import userAchievesStore from "../../stores/userAchievesStore";
import {observer} from "mobx-react";

class EditAchievementContainer extends Component {
    achId;

    constructor(props) {
        super(props);
        this.achId = this.props.match.params.id
    };


    render() {
        return <EditAchievement achieves={userAchievesStore.achieves} achId={this.achId}/>
    }
}

export default observer(EditAchievementContainer)