import React, {Component, Suspense} from 'react';
import '../style/user_main.css';
import {Route} from "react-router-dom";
import Auth from "../modules/Auth";
import {Switch} from "react-router";
import StaffHeaderContainer from "./containers/staff/staffHeaderContainer";
import StaffMenu from './views/staff/staffMenu'
import NewAchievesContainer from "./containers/staff/newAchievesContainer";
import CurrentContestAchievementsContainer from "./containers/staff/currentContestAchievementsContainer";
import StaffStudentsRatingContainer from "./containers/staff/staffStudentsRatingContainer";
import userPersonalStore from "../stores/userPersonalStore";
import staffContextStore from "../stores/staff/staffContextStore";
import StaffCriteriasPage from "./views/staff/staffCriteriasPage";
import StaffAnnotationsPage from "./views/staff/staffAnnotationsPage";
import {observer} from "mobx-react";

const CriteriasMenu = React.lazy(() => import('./views/staff/criteriasManagePage/CriteriasMenu'));
const AdminCreationContainer = React.lazy(() => import('./containers/staff/superAdmin/adminCreationContainer'));
const FacultyCreationContainer = React.lazy(() => import('./containers/staff/superAdmin/facultyCreationContainer'));

const PrivateRoute = ({component: Component, ...rest}) => (
    <Route {...rest} render={props => (
        Auth.isUserAuthenticated() ? (
            <Component {...props} {...rest} />
        ) : (
            window.location.assign('/api/login')
        )
    )}/>
);


class Staff extends Component {
    constructor(props) {
        super(props);
        this.state = {
            authenticated: false
        };

    };

    componentDidMount() {
        userPersonalStore.update().then((result) => {
            staffContextStore.changeFaculty(userPersonalStore.Rights[0]).then()
        })
    }

    componentWillMount() {
        if (!Auth.isUserAuthenticated()) window.location.assign('/api/login')
    }

    componentWillUpdate(nextProps, nextState, nextContext) {
        Auth.fetchAuth().then(() => {
            if (!Auth.isUserAuthenticated()) window.location.assign('/api/login')
        })
    }

    async toggleAuthenticateStatus() {
        // check authenticated status and toggle state based on that
        await Auth.fetchAuth();
        this.setState({authenticated: Auth.isUserAuthenticated()});
        console.log(this.state.authenticated)
    }

    render() {
        return (<div className="container-fluid">
            <StaffHeaderContainer/>
            <div id="mainBody">
                {staffContextStore.faculty &&
                <Suspense fallback={<div>Loading...</div>}>
                    <Switch>
                        <Route path="/staff/newAchieves" component={NewAchievesContainer}/>
                        <Route path="/staff/current" component={CurrentContestAchievementsContainer}/>
                        <Route path="/staff/rating" component={StaffStudentsRatingContainer}/>
                        <Route path="/staff/criteriasMenu" component={CriteriasMenu}/>
                        <Route path="/staff/criteriasPage" component={StaffCriteriasPage}/>
                        <Route path="/staff/manageAnnotations" component={StaffAnnotationsPage}/>
                        <Route path="/staff/facultyCreation" component={FacultyCreationContainer}/>
                        <Route path="/staff/adminCreation" component={AdminCreationContainer}/>
                        <Route path="/staff/" component={StaffMenu}/>
                    </Switch>
                </Suspense>
                }
            </div>
        </div>)
    }

}

export default observer(Staff)