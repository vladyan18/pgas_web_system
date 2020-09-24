import React from 'react';
import '../../../style/user_main.css';
import UserHeader from '../../views/user/userHeader';
import {withRouter} from 'react-router-dom';

function UserHeaderContainer(props) {
  const {location} = props;
  let pathname;
  switch (location.pathname) {
    case '/home':
      pathname = 'Мои достижения';
      break;
    case '/upload':
      pathname = 'Добавление достижения';
      break;
    case '/documents':
      pathname = 'Информация';
      break;
    case '/confirmations':
      pathname = 'Мои документы';
      break;
    case '/profile':
      pathname = 'Мой профиль';
      break;
    case '/rating':
      pathname = 'Рейтинг';
      break;
    case '/login':
      pathname = 'Система учета достижений';
      break;
    case '/achievement/*':
      pathname = 'Достижение';
      break;
    case '/':
      pathname = 'Мои достижения';
      break;
  }
  return <UserHeader pageName={pathname} clear={props.clear}/>;
}

UserHeaderContainer = withRouter(UserHeaderContainer);
export default UserHeaderContainer;
