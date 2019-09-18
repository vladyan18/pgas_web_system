import React, {Component} from 'react';
import '../../../style/user_main.css';
import EditAchievement from "../../views/user/userEditAchievement/editAchievement";
import userAchievesStore from "../../../stores/userAchievesStore";
import {observer} from "mobx-react";

class EditAchievementContainer extends Component {
    constructor(props) {
        super(props);
        this.state = {achId: props.match.params.id}

    };

    componentDidMount() {
        if (!userAchievesStore.achieves) userAchievesStore.getAchieves()

    }

    render() {
        console.log(userAchievesStore.achieves);
        return (<>{(userAchievesStore.achieves) &&
        <EditAchievement achieves={userAchievesStore.achieves} achId={this.state.achId}/>}</>)
    }
}

export default observer(EditAchievementContainer)