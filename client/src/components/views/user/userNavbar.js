import React from 'react';
import '../../../style/user_main.css';
import UserNavItem from "./userNavItem";
import userPersonalStore from "../../../stores/userPersonalStore";
import {observer} from "mobx-react";

/** @jsx jsx */
import {css, jsx} from '@emotion/core';

const LeftNavbar = css`
  width: 90%;
  padding: 10px 10px 10px 10px;
  background-color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, .2);
  
  & > ul {
    margin-left: 0;
    padding-left: 0;
  };
`;

function UserNavbar(props) {
    return <div className="col-md-3 leftBlock">
        <div css={LeftNavbar}>
            <ul className="ul_nav">
                <UserNavItem to='/home'>Мои достижения</UserNavItem>
                <UserNavItem to='/upload'>Добавить достижение</UserNavItem>
                {userPersonalStore.IsInRating && <UserNavItem to='/rating'>Рейтинг</UserNavItem>}
                <UserNavItem to='/documents'>Информация</UserNavItem>
                <UserNavItem to='/profile'>Мой профиль</UserNavItem>
            </ul>
        </div>
    </div>
}

export default observer(UserNavbar)
