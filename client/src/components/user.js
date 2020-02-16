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
import UserStudentsContainer from "./containers/user/userStudentsRatingContainer";
import staffStudentsRatingContainer, {StaffStudentsContainerFabric} from "./containers/staff/staffStudentsRatingContainer";

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
            await CriteriasStore.getCriteriasForFaculty(profile.Faculty);
            if (CriteriasStore.criterias) await CriteriasStore.getAnnotations(profile.Faculty);
            this.setState({ready: true})
        } else {
            //this.props.history.push('/register')
        }


    }

    async toggleAuthenticateStatus() {
        // check authenticated status and toggle state based on that
        await Auth.fetchAuth();
        this.setState({authenticated: Auth.isUserAuthenticated()});
        console.log(this.state.authenticated)
    }

    render() {
        if (!CriteriasStore.criterias && CriteriasStore.facultyRawName) // Error handling when criterias not found
            return (
            <>{(this.state.ready) &&
            <div className="container-fluid">
                <UserHeaderContainer/>
                <div className="container main_block">
                    <div className="rightBlock" id="panel" style={{display: 'flex', justifyContent: 'center', padding:'50px'}}>

                        <p>Ваш Студсовет еще не предоставил все необходимые данные для системы. Обратитесь в свой Студсовет. <br/><br/>
                            Факультет: <b>{CriteriasStore.facultyRawName}</b></p>
                    </div>
                </div>
            </div>}</>
            )

        if (userPersonalStore.facultyRawName) // Error handling when faculty not found
            return (
                <>{
                <div className="container-fluid">
                    <UserHeaderContainer/>
                    <div className="container main_block">
                        <div className="rightBlock" id="panel" style={{display: 'flex', justifyContent: 'center', padding:'50px'}}>

                            <p>Поддержка вашего факультета в системе еще не реализована. Обратитесь в свой Студсовет. <br/><br/>
                                Факультет: <b>{userPersonalStore.facultyRawName}</b></p>
                        </div>
                    </div>
                </div>}</>
            )

        return (

            <>{(this.state.ready) && <div className="container-fluid">
        <UserHeaderContainer/>
        <div className="container main_block">
            <div className="row">
                <UserNavbarContainer/>
                <Switch>
                    <Route path="/home" component={UserAchievesContainer}/>
                    <Route path="/achievement/:id" component={EditAchievementContainer}/>
                    <Route path="/rating" component={UserStudentsContainer}/>
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
