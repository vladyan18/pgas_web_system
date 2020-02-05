import React from 'react';
import NavItem from './NavItem';
//import userPersonalStore from '../../../stores/userPersonalStore';
import {observer} from 'mobx-react';

/** @jsx jsx */
import {css, jsx} from '@emotion/core';

const LeftNavbar = css`
  width: 90%;
  padding: 10px 10px 65px 10px;
  background-color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, .2);
  
  & > ul {
    margin-left: 0;
    padding-left: 0;
  };
`;

function Navbar(props) {
  return <div className="col-md-3" css={css`padding: 0;`}>
    <div css={LeftNavbar}>
      <ul className="ul_nav">
        <NavItem to='/home'>Мои достижения</NavItem>
        <NavItem to='/upload'>Добавить достижение</NavItem>

        <NavItem to='/documents'>Информация</NavItem>
        <NavItem to='/profile'>Мой профиль</NavItem>
      </ul>
    </div>
  </div>;
}

export default Navbar;
