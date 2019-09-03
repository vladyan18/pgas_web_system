import React from 'react';
import '../../style/user_main.css';
import UserHeader from "../views/user/userHeader";
import {withRouter} from "react-router-dom";

function UserHeaderContainer(props) {
    const {location} = props;
    let pathname;
    switch (location.pathname) {
        case '/home':
            pathname = 'Личный кабинет портфолио';
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

    }
    return <UserHeader pageName={pathname}/>
}

UserHeaderContainer = withRouter(UserHeaderContainer);
export default UserHeaderContainer
