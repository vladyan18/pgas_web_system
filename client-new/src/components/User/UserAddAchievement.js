import React, {useState} from 'react';
/** @jsx jsx */
import {css, jsx} from '@emotion/core';
import eduLogo from '../../assets/icons/univer_hat.svg';
import artLogo from '../../assets/icons/art_icon.svg';
import UserCharacteristicsSelection from './UserCharacteristicsSelection/UserCharacteristicsSelection';

const horizontalLine = css`
    border-top: 1px solid #9F2D20;
`;

function UserAddAchievement(props) {
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
          <b>Добавление достижения</b>
        </div>
      </div>
      <hr css={horizontalLine}/>
      <div css={css`
      display: flex;
      justify-content: center;
      `}>
        <UserCharacteristicsSelection/>
      </div>
    </div>
  );
}

function makeDate(d) {
  if (!d) return undefined;
  const date = d.split('.');
  return new Date(date[2] + '-' + date[1] + '-' + date[0]);
}

export default UserAddAchievement;
