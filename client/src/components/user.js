import React, {Component} from 'react';
import '../style/user_main.css';
import UserHeaderContainer from "./containers/user/userHeaderContainer";
import UserNavbarContainer from "./containers/user/userNavbarContainer";
import UserAchievesContainer from "./containers/user/userAchievesContainer";
import {Route} from "react-router-dom";
import UserCommonInfoContainer from "./containers/user/UserCommonInfoContainer";
import UserProfileContainer from "./containers/user/userProfileContainer";
import Auth from "../modules/Auth";
import userPersonalStore from "../stores/userPersonalStore";
import CriteriasStore from "../stores/criteriasStore"
import {Switch, withRouter} from "react-router";
import {observer} from "mobx-react";

import EditAchievementContainer from "./containers/user/editAchievementContainer";
import UserAddAchievementContainer from "./containers/user/userAddAchievementContainer";

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
        this.state = {}
    };

    async componentDidMount() {


        let profile = await userPersonalStore.update();
        if (profile) {
            CriteriasStore.getCriteriasForFaculty(profile.Faculty);
            await CriteriasStore.getAnnotations(profile.Faculty);
            this.setState({ready: true})
        } else {
            this.props.history.push('/register')
        }


    }

    async toggleAuthenticateStatus() {
        // check authenticated status and toggle state based on that
        await Auth.fetchAuth();
        this.setState({authenticated: Auth.isUserAuthenticated()});
        console.log(this.state.authenticated)
    }

    render() {
        return (<>{(this.state.ready) && <div className="container-fluid">
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

        </div>}
            </>)
    }

}

export default withRouter(observer(User))
