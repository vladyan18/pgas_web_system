import React, {Component, Suspense} from 'react';
import { Route } from 'react-router-dom';
import {Switch, withRouter} from 'react-router-dom';
import {observer} from 'mobx-react';
import { ToastProvider } from 'react-toast-notifications'
import {Panel} from '../common/style';
import '../../assets/fontawesome-free-5.12.1-web/css/fontAwesomeClear.css'
import userPersonalStore from '../../stores/userPersonalStore';
import CriteriasStore from '../../stores/criteriasStore';
import UserHeaderContainer from './header/userHeaderContainer';
import UserNavbarContainer from './navbar/userNavbarContainer';
import UserDetailedAccessRequest from "./modals/userDetailedAccessRequest";
import UserUpdateProfileRemainder from "./modals/userUpdateProfileRemainder";
import {css, jsx} from '@emotion/core';
import * as serviceWorker from '../../serviceWorker';
import routes from './routes';
/** @jsx jsx */
const preloadAddAchievementContainer = () => import('./addAchievement/userAddAchievementContainer');
const preloadDocumentsContainer = () => import('./documents/UserDocumentsContainer');


class User extends Component {
  constructor(props) {
    super(props);
    this.state = {ready: CriteriasStore && userPersonalStore && !!(userPersonalStore.personal) && !!(CriteriasStore.criterias)};
  };

  async componentDidMount() {
    try {
      serviceWorker.unregister();
    } catch (err) {
      console.log(err);
    }
    preloadAddAchievementContainer();
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
            <UserNavbarContainer preloads={{"/confirmations": () => preloadDocumentsContainer()}}/>
            <Suspense fallback={<Panel className="col-md-9 rightBlock">
              <div className="block_main_right"/></Panel>}>
              <Switch>
                {routes.map((route) => <Route path={route.path} component={route.component} key={route.path}/>)}
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

try {
  serviceWorker.unregister();
} catch (err) {
  console.log(err);
}

export default withRouter(observer(User));
