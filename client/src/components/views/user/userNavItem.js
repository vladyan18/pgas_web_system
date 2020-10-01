import React, {Component} from 'react';
import {Link, withRouter} from 'react-router-dom';
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
    
        @media only screen and (max-device-width: 768px) {
    font-size: small;
    padding: 0.2rem;
    :not(:last-child) {
    border-bottom: 1px solid #f4f4f4;
    }
  }
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
    
    @media only screen and (max-device-width: 768px) {
    background-color: unset;
    & > a {
      font-weight: bold;
      color: black;
    };
  }
`;


class UserNavItem extends Component {
  render() {
    const {location, onHover, onClick} = this.props;
    const {index, to, children, ...props} = this.props;

    const isActive = location.pathname == to || (location.pathname == '/' && to == '/home');
    const LinkComponent = index ? Link : Link;

    return (
      <li css={[navElement, isActive && activeElement]}>
        <LinkComponent css={css`margin-left: 0.25rem;`} to={to} {...props} onMouseEnter={onHover} onClick={onClick}>{children}</LinkComponent>
      </li>
    );
  }
}

UserNavItem = withRouter(UserNavItem);

export default UserNavItem;
