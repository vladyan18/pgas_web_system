import React from 'react';
import '../style/user_main.css';
import UserHeaderContainer from "./containers/userHeaderContainer";
import UserNavbarContainer from "./containers/userNavbarContainer";
import UserAchievesContainer from "./containers/userAchievesContainer";
import Route from "react-router-dom/es/Route";
import UserCommonInfoContainer from "./containers/UserCommonInfoContainer";
import UserProfileContainer from "./containers/userProfileContainer";
import UserAddAchievementContainer from "./containers/userAddAchievementContainer";

function User(props) {
    return <div className="container-fluid">
        <UserHeaderContainer/>
        <div className="container main_block">
            <div className="row">
                <UserNavbarContainer/>
                <Route path="/home" component={UserAchievesContainer}/>
                <Route path="/upload" component={UserAddAchievementContainer}/>
                <Route path="/documents" component={UserCommonInfoContainer}/>
                <Route path="/profile" component={UserProfileContainer}/>
            </div>
        </div>
    </div>

}

export default User