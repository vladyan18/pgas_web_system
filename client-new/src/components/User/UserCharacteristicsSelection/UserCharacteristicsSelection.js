import React, {useState} from 'react';
/** @jsx jsx */
import {css, jsx} from '@emotion/core';
import CharacteristicsListing from './CharacteristicsListing';

const Button = (props) => <div css={css`
height: 100px; 
width: 130px; 
background-color:#9F2D20; 
margin: 1rem; 
box-shadow: 0 2px 4px rgba(0, 0, 0, .2); 
color: white;
cursor: pointer;
text-align: center;`}>
  {props.area }
</div>;

function UserCharacteristicsSelection(props) {
  const areas = ['Учеба', 'Наука', 'Активизм', 'Культура', 'Спорт'];
  return (
    <div>
      <CharacteristicsListing/>

      <div className="container-fluid">
        <div className="row">
          {
            areas.map((area) => <Button area={area} />)
          }

        </div>
      </div>
    </div>
  );
}

export default UserCharacteristicsSelection;
