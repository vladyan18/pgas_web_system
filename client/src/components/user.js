import React, {Component} from 'react';
import '../style/user_main.css';
import UserHeaderContainer from "./containers/user/userHeaderContainer";
import UserNavbarContainer from "./containers/user/userNavbarContainer";
import UserAchievesContainer from "./containers/user/userAchievesContainer";
import {Route} from "react-router-dom";
import UserCommonInfoContainer from "./containers/user/UserCommonInfoContainer";
import UserProfileContainer from "./containers/user/userProfileContainer";
import UserAddAchievementContainer from "./containers/user/userAddAchievementContainer";
import Auth from "../modules/Auth";
import userPersonalStore from "../stores/userPersonalStore";
import EditAchievementContainer from "./containers/user/editAchievementContainer";
import CriteriasStore from "../stores/criteriasStore"
import {Switch} from "react-router";

const PrivateRoute = ({component: Component, ...rest}) => (
    <Route {...rest} render={props => (
        Auth.isUserAuthenticated() ? (
            <Component {...props} {...rest} />
        ) : (
            window.location.assign('/api/login')
        )
    )}/>
);


class User extends Component {
    constructor(props) {
        super(props);

        userPersonalStore.update().then(
            (profile) => {

                CriteriasStore.getCriteriasForFaculty(profile.Faculty);
                CriteriasStore.getAnnotations(profile.Faculty).then()
            }
        )
    };

    async toggleAuthenticateStatus() {
        // check authenticated status and toggle state based on that
        await Auth.fetchAuth();
        this.setState({authenticated: Auth.isUserAuthenticated()});
        console.log(this.state.authenticated)
    }

    render() {
        return (<div className="container-fluid">
        <UserHeaderContainer/>
        <div className="container main_block">
            <div className="row">
                <UserNavbarContainer/>
                <Switch>
                    <Route path="/home" component={UserAchievesContainer}/>
                    <Route path="/achievement/:id" component={EditAchievementContainer}/>
                    <Route path="/upload" component={UserAddAchievementContainer}/>
                    <Route path="/documents" component={UserCommonInfoContainer}/>
                    <Route path="/profile" component={UserProfileContainer}/>
                    <Route path="/" component={UserAchievesContainer}/>
                </Switch>
            </div>
        </div>
        </div>)
    }

}

export default User
