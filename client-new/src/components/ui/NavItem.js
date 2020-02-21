import React from 'react';
import {Link, useLocation} from 'react-router-dom';
/** @jsx jsx */
import {css, jsx} from '@emotion/core';

const navElement = css`
    font-size: 1.1rem;
    list-style-type: none;
    
    &:hover {
      background-color: #fdeeed;
    };
    
    & > a {
      color: #000000;
      display: block;
      padding: 0.3rem;
    };
    & > a:hover {
    text-decoration: none;
    };
    & > a:focus {
    outline: none;
    };
`;

const activeElement = css`
    color: white;
    background-color: #9F2D20;
    
    &:hover {
      background-color: #9F2D20;
    };
    
    & > a {
      color: white;
    };
`;

/**
 *
 * @param props
 * @return {*}
 * @constructor
 */
function NavItem(props) {
  const location = useLocation();
  const {index, to, children} = props;

  const isActive = location.pathname === to || (location.pathname === '/' && to === '/home');
  const LinkComponent = index ? Link : Link;

  return (
    <li css={[navElement, isActive && activeElement]}>
      <LinkComponent css={css`margin-left: 0.25rem;`} to={to} {...props}>{children}</LinkComponent>
    </li>
  );
}

export default NavItem;