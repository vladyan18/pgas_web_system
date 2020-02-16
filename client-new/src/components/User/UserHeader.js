import React from 'react';
import Header from '../ui/Header';
import {useLocation} from 'react-router-dom';

function UserHeader(props) {
  const location = useLocation();
  let pathname;
  switch (location.pathname) {
    case '/':
      pathname = 'Мои достижения';
      break;
    case '/home':
      pathname = 'Мои достижения';
      break;
    case '/upload':
      pathname = 'Добавление достижения';
      break;
    case '/documents':
      pathname = 'Информация';
      break;
    case '/profile':
      pathname = 'Мой профиль';
      break;
    case '/achievement/*':
      pathname = 'Достижение';
      break;
  }
  return <Header pageName={pathname}/>;
}

export default UserHeader;
