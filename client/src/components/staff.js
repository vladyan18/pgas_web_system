import React, {Component, Suspense} from 'react';
import '../style/user_main.css';
import '../style/admin.css';
import '../assets/fontawesome-free-5.12.1-web/css/fontAwesomeClear.css'
import {Route} from "react-router-dom";
import Auth from "../modules/Auth";
import {Switch} from "react-router-dom";
import StaffHeaderContainer from "./containers/staff/staffHeaderContainer";
import StaffMenu from './views/staff/staffMenu'
import userPersonalStore from "../stores/userPersonalStore";
import staffContextStore from "../stores/staff/staffContextStore";
import {observer} from "mobx-react";

const AdminsListContainer = React.lazy(() => import("./containers/staff/adminsListContainer"));
const NewAchievesContainer = React.lazy(() => import("./containers/staff/newAchievesContainer"));
const CurrentContestAchievementsContainer = React.lazy(() => import("./containers/staff/currentContestAchievementsContainer"));
const StaffStudentsRatingContainer = React.lazy(() => import("./containers/staff/staffStudentsRatingContainer"));
const StaffCriteriasPage = React.lazy(() => import("./views/staff/staffCriteriasPage"));
const StaffAnnotationsPage = React.lazy(() => import("./views/staff/staffAnnotationsPage"));
const CriteriasMenu = React.lazy(() => import('./views/staff/criteriasManagePage/CriteriasMenu'));
const AdminCreationContainer = React.lazy(() => import('./containers/staff/superAdmin/adminCreationContainer'));
const FacultyCreationContainer = React.lazy(() => import('./containers/staff/superAdmin/facultyCreationContainer'));
const StaffStatistics = React.lazy(() => import("./views/staff/staffStatistics"));
const StaffExport = React.lazy(() => import("./views/staff/staffExport"));



class Staff extends Component {
    constructor(props) {
        super(props);
        this.state = {
            authenticated: false
        };

    };

    componentDidMount() {
        userPersonalStore.update().then((result) => {
            staffContextStore.changeFaculty(userPersonalStore.Rights[0]).then();
            staffContextStore.getAnnotations().then();
        })
    }

    render() {
        return (<div className="container-fluid">
            <StaffHeaderContainer/>
            <div id="mainBody">
                {staffContextStore.faculty &&
                <Suspense fallback={<div style={{backGroundColor: "#e2e2e2", padding: "3rem", marginTop:'auto', marginBottom:'auto'}}>
                    <div id="floatingCirclesG">
                        <div className="f_circleG" id="frotateG_01"/>
                        <div className="f_circleG" id="frotateG_02"/>
                        <div className="f_circleG" id="frotateG_03"/>
                        <div className="f_circleG" id="frotateG_04"/>
                        <div className="f_circleG" id="frotateG_05"/>
                        <div className="f_circleG" id="frotateG_06"/>
                        <div className="f_circleG" id="frotateG_07"/>
                        <div className="f_circleG" id="frotateG_08"/>
                    </div>
                </div>}>
                    <Switch>
                        <Route path="/staff/newAchieves" component={NewAchievesContainer}/>
                        <Route path="/staff/current" component={CurrentContestAchievementsContainer}/>
                        <Route path="/staff/rating" component={StaffStudentsRatingContainer}/>
                        <Route path="/staff/criteriasMenu" component={CriteriasMenu}/>
                        <Route path="/staff/criteriasPage" component={StaffCriteriasPage}/>
                        <Route path="/staff/manageAnnotations" component={StaffAnnotationsPage}/>
                        <Route path="/staff/facultyCreation" component={FacultyCreationContainer}/>
                        <Route path="/staff/adminCreation" component={AdminCreationContainer}/>
                        <Route path="/staff/statistics" component={StaffStatistics}/>
                        <Route path="/staff/export" component={StaffExport}/>
                        <Route path="/staff/adminsList" component={AdminsListContainer}/>
                        <Route path="/staff/" component={StaffMenu}/>
                    </Switch>
                </Suspense>
                }
            </div>
        </div>)
    }

}

export default observer(Staff)