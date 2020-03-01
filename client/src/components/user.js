import React, {Component, Suspense} from 'react';
import '../style/user_main.css';
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

import EditAchievementContainer from './containers/user/editAchievementContainer';
import UserAddAchievementContainer from './containers/user/userAddAchievementContainer';
const UserStudentsContainer  = React.lazy(() => import('./containers/user/userStudentsRatingContainer'));

const PrivateRoute = ({component: Component, ...rest}) => (
  <Route {...rest} render={(props) => (
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
    this.state = {};
  };

  async componentDidMount() {
    const profile = await userPersonalStore.update();
    if (profile) {
      //Promise.allSettled([CriteriasStore.getCriteriasForFaculty(profile.Faculty), CriteriasStore.getAnnotations(profile.Faculty)])
      //  .then(() => this.setState({ready: true}));
      await CriteriasStore.getCriteriasForFaculty(profile.Faculty);
      if (CriteriasStore.criterias) await CriteriasStore.getAnnotations(profile.Faculty);
      this.setState({ready: true});
    } else {
      this.props.history.push('/register');
    }
  }

  async toggleAuthenticateStatus() {
    // check authenticated status and toggle state based on that
    await Auth.fetchAuth();
    this.setState({authenticated: Auth.isUserAuthenticated()});
  }

  render() {
    return (

      <><div className="container-fluid">
        <UserHeaderContainer/>
        {(this.state.ready) &&
        <div className="container main_block">
          <div className="row">
            <UserNavbarContainer/>
            <Suspense fallback={null}>
            <Switch>
              <Route path="/home" component={UserAchievesContainer}/>
              <Route path="/achievement/:id" component={EditAchievementContainer}/>
              <Route path="/rating" component={UserStudentsContainer}/>
              <Route path="/upload" component={UserAddAchievementContainer}/>
              <Route path="/documents" component={UserCommonInfoContainer}/>
              <Route path="/profile" component={UserProfileContainer}/>
              <Route path="/" component={UserAchievesContainer}/>
            </Switch>
            </Suspense>
            </div>
          </div>
      }
      </div>
      </>);
  }
}

export default withRouter(observer(User));
