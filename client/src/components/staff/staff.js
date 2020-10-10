import React, {Component, Suspense} from 'react';
import '../../style/user_main.css';
import '../../style/admin.css';
import '../../assets/fontawesome-free-5.12.1-web/css/fontAwesomeClear.css'
import {Route} from "react-router-dom";
import {Switch} from "react-router-dom";
import StaffHeaderContainer from "./staffHeader/staffHeaderContainer";
import StaffMenu from './staffMenu/staffMenu'
import userPersonalStore from "../../stores/userPersonalStore";
import staffContextStore from "../../stores/staff/staffContextStore";
import {observer} from "mobx-react";
import FloatingCircle from "../floatingCircle";

const AdminsListContainer = React.lazy(() => import("./adminsList/adminsListContainer"));
const NewAchievesContainer = React.lazy(() => import("./achieves/newAchievesContainer"));
const CurrentContestAchievementsContainer = React.lazy(() => import("./achieves/currentContestAchievementsContainer"));
const StaffStudentsRatingContainer = React.lazy(() => import("./staffStudentsRating/staffStudentsRatingContainer"));
const StaffCriteriasPage = React.lazy(() => import("./criteriasManagePage/staffCriteriasPage"));
const StaffAnnotationsPage = React.lazy(() => import("./criteriasManagePage/staffAnnotationsPage"));
const CriteriasMenu = React.lazy(() => import('./criteriasManagePage/CriteriasMenu'));
const AdminCreationContainer = React.lazy(() => import('./superAdmin/adminCreationContainer'));
const FacultyCreationContainer = React.lazy(() => import('./superAdmin/facultyCreationContainer'));
const StaffStatistics = React.lazy(() => import("./staffStatistics/staffStatistics"));
const StaffExport = React.lazy(() => import("./staffExport/staffExport"));



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
                    <FloatingCircle/>
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