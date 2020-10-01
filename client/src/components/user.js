import React, {Component, Suspense} from 'react';
import '../assets/fontawesome-free-5.12.1-web/css/fontAwesomeClear.css'
import UserHeaderContainer from './containers/user/userHeaderContainer';
import UserNavbarContainer from './containers/user/userNavbarContainer';
import UserAchievesContainer from './containers/user/userAchievesContainer';
import { Route } from 'react-router-dom';
import UserCommonInfoContainer from './containers/user/UserCommonInfoContainer';
import UserProfileContainer from './containers/user/userProfileContainer';
import userPersonalStore from '../stores/userPersonalStore';
import CriteriasStore from '../stores/criteriasStore';
import {Switch, withRouter} from 'react-router-dom';
import {observer} from 'mobx-react';
import UserDetailedAccessRequest from "./views/user/userDetailedAccessRequest";
import styled from "@emotion/styled";
import {css, jsx} from '@emotion/core';
import * as serviceWorker from '../serviceWorker';
import UserUpdateProfileRemainder from "./views/user/userUpdateProfileRemainder";
import { ToastProvider } from 'react-toast-notifications'
/** @jsx jsx */

try {
  serviceWorker.unregister();
} catch (err) {
  console.log(err);
}

const ReactLazyPreload = importStatement => {
  const Component = React.lazy(importStatement);
  Component.preload = importStatement;
  return Component;
};

const preloadContainer = () => import('./containers/user/userAddAchievementContainer');
const UserAddAchievementContainer = React.lazy(preloadContainer);
const EditAchievementContainer = React.lazy(() => import('./containers/user/editAchievementContainer'));
const UserStudentsContainer  = React.lazy(() => import('./containers/user/userStudentsRatingContainer'));
const UserDocumentsContainer = ReactLazyPreload(() => import('./containers/user/UserDocumentsContainer'));


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
    try {
      serviceWorker.unregister();
      console.log('UNREGISTERED SW')
    } catch (err) {
      console.log(err);
    }
    preloadContainer();
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
      <ToastProvider placement={'bottom-left'}>
        <UserHeaderContainer/>
        <div className="container-fluid">
        {(this.state.ready) &&
        <div className="container main_block">
          <div className="row">
            <UserNavbarContainer preloads={{"/confirmations": () => UserDocumentsContainer.preload()}}/>
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
      </ToastProvider>);
  }
}

export default withRouter(observer(User));
