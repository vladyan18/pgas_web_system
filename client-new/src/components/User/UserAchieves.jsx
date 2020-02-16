import React from 'react';

/** @jsx jsx */
import {css, jsx} from '@emotion/core';
import styled from '@emotion/styled';
import UserAchievesTable from './UserAchievesTable';

const horizontalLine = css`
    border-top: 1px solid #9F2D20;
`;

//a20800
const mainButton = css`
    color: #fff;
    background-color: #9F2D20;
    border-color: #9F2D20;
    
    &:focus {
        box-shadow: 0 0 0 .2rem #f1c8c6;
    }
`;

function UserAchieves() {
  return (
    <div>
      <div css={css`display: flex; justify-content: space-between; margin-top: 1rem;`}>
        <div css={css`
        height: max-content; 
        margin-top:auto; 
        margin-bottom: auto; 
        color: black;
        font-size: larger;
        `}>
          <b>Текущие достижения</b>
        </div>
        <form action="/api/getAnket">
          <input type="submit" id="download" className="btn" css={mainButton} value="Скачать анкету"/>
        </form>
      </div>
      <hr css={horizontalLine}/>
      <div css={css`width: 100%; min-height: 10rem;`}>
        <UserAchievesTable/>
      </div>
      <div css={css`background-color: #4C4C4C; color: white; width: 100%; padding: 5px 5px 5px 1rem; margin-bottom: 1rem;`}>
          Архив достижений
      </div>
    </div>
  );
}

export default UserAchieves;
