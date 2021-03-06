import React from 'react';
import '../../../style/user_main.css';
import UserNavItem from './userNavItem';
import userPersonalStore from '../../../stores/userPersonalStore';
import {observer} from 'mobx-react';

/** @jsx jsx */
import {css, jsx} from '@emotion/core';
import userAchievesStore from '../../../stores/userAchievesStore';

const LeftNavbar = css`
  width: 90%;
  padding: 10px 10px 10px 10px;
  background-color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, .2);
  border-radius: 2px;
  & > ul {
    margin-left: 0;
    padding-left: 0;
  };
   & > ul > li {
          @media only screen and (max-device-width: 768px) {
      font-size: medium;
      }
   };
   @media only screen and (max-device-width: 765px) {
      width:100%;
   }
      @media only screen and (max-device-width: 480px) {
      display: none;
   }
`;

const leftBlock = css`
                  @media only screen and (max-device-width: 480px) {
                    margin-bottom: 1rem;
                 }
                       @media only screen and (max-device-width: 768px) {
      display: none;
   }
`;

const ulNav = css`
   padding-bottom: 0px;
   @media only screen and (max-device-width: 480px) {
      margin-bottom: 0px;
      padding-bottom: 0px;
   }
`;

let preloaded = false;
function preloadDocuments(preloads) {
  if (!preloaded && !userAchievesStore.confirmations) {
    preloaded = true;
    preloads['/confirmations']();
    userAchievesStore.updateCommonConfirmations();
  }
}

function UserNavbar(props) {
  const onhover = () => preloadDocuments(props.preloads);
  return <div className="col-md-3 leftBlock" css={leftBlock}>
    <div css={LeftNavbar}>
      <ul className="ul_nav" css={ulNav}>
        <UserNavItem to='/home'>Мои достижения</UserNavItem>
        <UserNavItem to='/upload'>Добавить достижение</UserNavItem>
        {userPersonalStore.IsInRating && <UserNavItem to='/rating'>Рейтинг на ПГАС</UserNavItem>}
        <UserNavItem to='/documents'>Информация</UserNavItem>
        <UserNavItem to='/confirmations' onHover={onhover}>Мои документы</UserNavItem>
        <UserNavItem to='/profile'>Мой профиль</UserNavItem>
      </ul>
    </div>
  </div>;
}

export default observer(UserNavbar);
