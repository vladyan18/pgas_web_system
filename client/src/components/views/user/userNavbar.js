import React from 'react';
import '../../../style/user_main.css';
import UserNavItem from "./userNavItem";

function UserNavbar(props) {
    return <div className="col-md-3 leftBlock">
        <div className="left_navbar">
            <ul className="ul_nav">
                <UserNavItem to='/home'>Мое портфолио</UserNavItem>
                <UserNavItem to='/upload'>Добавить достижение</UserNavItem>
                <UserNavItem to='/documents'>Информация</UserNavItem>
                <UserNavItem to='/profile'>Мой профиль</UserNavItem>
            </ul>
        </div>
    </div>
}

export default UserNavbar