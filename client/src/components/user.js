import React, {Component, Suspense} from 'react';
import '../assets/fontawesome-free-5.12.1-web/css/fontAwesomeClear.css'
import UserHeaderContainer from './containers/user/userHeaderContainer';
import UserNavbarContainer from './containers/user/userNavbarContainer';
import UserAchievesContainer from './containers/user/userAchievesContainer';
import {Route} from 'react-router-dom';
import UserCommonInfoContainer from './containers/user/UserCommonInfoContainer';
import UserProfileContainer from './containers/user/userProfileContainer';
import Auth from '../modules/Auth';
import userPersonalStore from '../stores/userPersonalStore';
import CriteriasStore from '../stores/criteriasStore';
import {Switch, withRouter} from 'react-router-dom';
import {observer} from 'mobx-react';
import UserDetailedAccessRequest from "./views/user/userDetailedAccessRequest";
import styled from "@emotion/styled";
import {css, jsx} from '@emotion/core';
import UserUpdateProfileRemainder from "./views/user/userUpdateProfileRemainder";
/** @jsx jsx */

const UserAddAchievementContainer = React.lazy(() => import('./containers/user/userAddAchievementContainer'));
const EditAchievementContainer = React.lazy(() => import('./containers/user/editAchievementContainer'));
const UserStudentsContainer  = React.lazy(() => import('./containers/user/userStudentsRatingContainer'));
const UserDocumentsContainer = React.lazy(() => import('./containers/user/UserDocumentsContainer'));


const Panel = styled.div`
    background-color: white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, .2);
`;


class User extends Component {
  constructor(props) {
    super(props);
    this.state = {ready: CriteriasStore && userPersonalStore && !!(userPersonalStore.personal) && !!(CriteriasStore.criterias)};
  };

  async componentDidMount() {
    const profile = await userPersonalStore.update();
    if (profile) {
      await Promise.all([
          CriteriasStore.getCriteriasForFaculty(profile.Faculty),
          CriteriasStore.getAnnotations(profile.Faculty)
      ]);
      this.setState({ready: true});
    } else {
      this.props.history.push('/register');
    }
  }

  render() {
    return (

      <>
        <UserHeaderContainer/>
        <div className="container-fluid">
        {(this.state.ready) &&
        <div className="container main_block">
          <div className="row">
            <UserNavbarContainer/>
            <Suspense fallback={<Panel className="col-md-9 rightBlock">
              <div className="block_main_right"></div></Panel>}>
            <Switch>
              <Route path="/home" component={UserAchievesContainer}/>
              <Route path="/achievement/:id" component={EditAchievementContainer}/>
              <Route path="/rating" component={UserStudentsContainer}/>
              <Route path="/upload" component={UserAddAchievementContainer}/>
              <Route path="/documents" component={UserCommonInfoContainer}/>
              <Route path="/profile" component={UserProfileContainer}/>
              <Route path="/confirmations" component={UserDocumentsContainer}/>
              <Route path="/" component={UserAchievesContainer}/>
            </Switch>
            </Suspense>
            </div>
          </div>
      }
      <UserDetailedAccessRequest />
      <UserUpdateProfileRemainder />
      </div>
      </>);
  }
}

export default withRouter(observer(User));
