import React from 'react';
import '../../../style/user_main.css';
import StaffHeader from './staffHeader';
import {withRouter} from 'react-router-dom';

function StaffHeaderContainer(props) {
  const {location} = props;
  let pathname;
  switch (location.pathname) {
    case '/staff/manageAnnotations':
      pathname = 'Управление примечаниями';
      break;
    case '/staff/criteriasPage':
      pathname = 'Критерии';
      break;
    case '/staff/statistics':
      pathname = 'Статистика';
      break;
    case '/staff/rating':
      pathname = 'Рейтинг';
      break;
    case '/staff/newAchieves':
      pathname = 'Новые достижения';
      break;
    case '/staff/current':
      pathname = 'Текущий конкурс';
      break;
    case '/staff':
      pathname = 'Меню сотрудника';
      break;
  }
  return <StaffHeader pageName={pathname}/>;
}

StaffHeaderContainer = withRouter(StaffHeaderContainer);
export default StaffHeaderContainer;
