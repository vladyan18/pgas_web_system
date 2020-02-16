import './assets/bootstrap.min.css';
import React, {Suspense} from 'react';
import Spinner from './components/spinner/Spinner';
import {Route, BrowserRouter as Router, Switch} from 'react-router-dom';
/** @jsx jsx */
import {css, jsx} from '@emotion/core';
import UserHome from './components/User/UserHome';
import LoginPage from './components/LoginPage';

// eslint-disable-next-line require-jsdoc
function App() {
  return (
    <Router>
      <Suspense fallback={
        <div css={css`backGroundColor: '#e2e2e2', 
          padding: '3rem', 
          marginTop: 'auto', 
          marginBottom: 'auto';`}>
          <Spinner />
        </div>}>
        <Switch>
          <Route path="/" component={LoginPage} />
        </Switch>
      </Suspense>
    </Router>
  );
}
export default App;
