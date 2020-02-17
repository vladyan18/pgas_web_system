import React, {Component} from 'react';
import '../../../../style/user_main.css';
import CurrentAchievesTable from "./currentAchievesTable";
import userAchievesStore from "../../../../stores/userAchievesStore";
import {observer} from "mobx-react";
/** @jsx jsx */
import {css, jsx} from '@emotion/core';
import styled from '@emotion/styled';
import {BASE_API_URL} from "../../../../common/constants";

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

const Panel = styled.div`
    background-color: white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, .2);
`;


class UserAchieves extends Component {
    constructor(props) {
        super(props);
    };

    componentDidMount() {
        this.getAchieves();
    }

    getAchieves() {
        fetch(BASE_API_URL + "/getUserInfo", {
            method: "GET"
        }).then((resp) => {
            return resp.json()
        })
            .then((data) => {
                data.Achs = data.Achs.sort(function (obj1, obj2) {
                    return Number.parseInt(obj1.crit.substr(0, 2)) > Number.parseInt(obj2.crit.substr(0, 2))
                });
                userAchievesStore.achieves = data.Achs
            });
    }

    render() {
        let summaryBall = 0
        if (userAchievesStore.achieves)
        for (let ach of userAchievesStore.achieves)
            if (ach.status == 'Принято' || ach.status == 'Принято с изменениями')
                summaryBall += ach.ball
        return (<Panel css={css`padding: 1rem;`} className="col-md-9">

<div>
      <div css={css`display: flex; justify-content: space-between;`}>
        <div css={css`
        height: max-content; 
        margin-top:auto; 
        margin-bottom: auto; 
        color: black;
        font-size: larger;
        `}>
          <b>Текущие достижения</b>
        </div>
        <form action={BASE_API_URL + "/getAnket"}>
          <input type="submit" id="download" className="btn" css={mainButton} value="Скачать анкету"/>
        </form>
      </div>
      <hr css={horizontalLine}/>
      <div css={css`width: 100%; min-height: 10rem;`}>
        < CurrentAchievesTable currentAchieves={userAchievesStore.achieves}/>
      </div>
      <div css={css`background-color: #4C4C4C; color: white; width: 100%; padding: 5px 5px 5px 1rem; margin-bottom: 1rem;`}>
          Архив достижений
      </div>
    </div>
        </Panel>)
    }
}

export default observer(UserAchieves)
