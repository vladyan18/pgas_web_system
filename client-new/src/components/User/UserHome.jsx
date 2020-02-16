import React, {Suspense} from 'react';
import Navbar from '../ui/Navbar';
import UserHeader from './UserHeader';

/** @jsx jsx */
import {css, jsx} from '@emotion/core';
import styled from '@emotion/styled';
import UserAchieves from './userAchieves';
import {Switch, Route} from 'react-router-dom';
import UserAddAchievement from './UserAddAchievement';


const container = css`
    padding-right:15px;
    padding-left:15px;
    margin-right:auto;
    margin-left:auto;
`;

const mainBlock = css`
    margin-top: 50px;
    @media screen and (max-width: 800px) {
        margin-top: 15px;
    }
`;

const Panel = styled.div`
    background-color: white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, .2);
`;

function UserHome() {
  return (
    <div className="container-fluid">
      <UserHeader />
      <div className="container" css={mainBlock}>
        <div className="row">
          <Navbar/>
          <Panel className='col-md-9'>
            <Switch>
              <Route path="/home" component={UserAchieves}/>
              <Route path="/upload" component={UserAddAchievement}/>
              <Route path="/documents" component={null}/>
              <Route path="/profile" component={null}/>
              <Route path="/rating" component={null}/>
              <Route path="/achievement/:id" component={null}/>
              <Route path="/" component={UserAchieves}/>
            </Switch>
          </Panel>
        </div>
      </div>
    </div>);
}

export default UserHome;
