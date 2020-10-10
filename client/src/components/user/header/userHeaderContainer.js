import React from 'react';
import '../../../style/user_main.css';
import UserHeader from './userHeader';
import {withRouter} from 'react-router-dom';
import routes from '../routes';

function UserHeaderContainer(props) {
  const {location} = props;
  const pathname = routes.find((x) => location.pathname.startsWith(x.path)).title;

  return <UserHeader pageName={pathname} clear={props.clear}/>;
}

// eslint-disable-next-line no-func-assign
UserHeaderContainer = withRouter(UserHeaderContainer);
export default UserHeaderContainer;
