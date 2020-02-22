import React from 'react';
import '../../../style/user_main.css';
import StaffHeader from '../../views/staff/staffHeader';
import {withRouter} from 'react-router-dom';

function StaffHeaderContainer(props) {
  const {location} = props;
  let pathname;
  switch (location.pathname) {
    case '/staff':
      pathname = 'Меню сотрудника';
      break;
  }
  return <StaffHeader pageName={pathname}/>;
}

StaffHeaderContainer = withRouter(StaffHeaderContainer);
export default StaffHeaderContainer;
