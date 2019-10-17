import React from 'react';
import '../../../style/user_main.css';
import UserNavItem from "./userNavItem";
import userPersonalStore from "../../../stores/userPersonalStore";
import {observer} from "mobx-react";

function UserNavbar(props) {
    return <div className="col-md-3 leftBlock">
        <div className="left_navbar">
            <ul className="ul_nav">
                <UserNavItem to='/home'>Мое портфолио</UserNavItem>
                <UserNavItem to='/upload'>Добавить достижение</UserNavItem>
                {userPersonalStore.IsInRating && <UserNavItem to='/rating'>Рейтинг</UserNavItem>}
                <UserNavItem to='/documents'>Информация</UserNavItem>
                <UserNavItem to='/profile'>Мой профиль</UserNavItem>
            </ul>
        </div>
    </div>
}

export default observer(UserNavbar)