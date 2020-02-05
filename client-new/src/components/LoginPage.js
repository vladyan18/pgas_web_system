import React from 'react';
import lock from '../assets/img/lock.png';
import UserHeader from './User/UserHeader';
/** @jsx jsx */
import {css, jsx} from '@emotion/core';
import styled from '@emotion/styled';

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

function LoginPage(props) {
  return (

    <div className="container-fluid">
      <UserHeader/>
      <div css={mainBlock}>
        <Panel className="row" css={css`width: 25rem;; margin-left: auto; margin-right: auto; padding: 2rem; border-radius: 3px;`}>
          <div>
            <div css={css`display: flex; justify-content: space-between; margin-bottom: 2rem;`}>
              <img src={lock} css={css`height: 70px;`} alt={'login'}/>

              <h3 css={css`font-weight: 800; margin-left: 1rem;`}>Вход в систему достижений</h3>
            </div>
            <div css={css`margin-bottom: 1rem; font-weight: 300;`}>Для входа необходимо использовать единый логин в системах СПбГУ.</div>


            <form id = 'login' method ='post' action="/api/login">
              <label id='name' css={css`font-weight: 500;`} >Имя пользователя</label><br/>
              <input type='text' id='name' name = 'username' className="form-control" placeholder="st******" required/><br/>
              <label id='password' css={css`font-weight: 500;`}>Пароль</label><br/>
              <input type='password' id='password' name = 'password' className="form-control" required={true}/><br/>
              <input type='submit' className='button btn btn-success' css={css`margin-top: 1rem;`} value='Войти в систему'/>
            </form>
          </div>
        </Panel>
      </div>
    </div>
  );
}

export default LoginPage;
