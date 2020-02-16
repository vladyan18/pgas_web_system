import React, {Component} from 'react';
import logo from '../../../img/gerb.png';
import '../../../style/user_main.css';
import userPersonalStore from '../../../stores/userPersonalStore'
import {observer} from "mobx-react";
import {withRouter} from "react-router";
import logoBss from '../../../assets/img/logo_bss.svg';
import logoSPbU from '../../../assets/img/CoA_Small_whitebg.svg';
// import userPersonalStore from '../../../stores/userPersonalStore';
/** @jsx jsx */
import {css, jsx} from '@emotion/core';
import styled from '@emotion/styled';

const pageTop = css`
    background-color: white;
    border-bottom: 1px solid #a5a5a5;
    align-items: center;
    font-size: 14px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, .2);
`;

const blockHeader = css`
    color: #4a4a4a;
    display: flex;
    font-size: 14px;
    align-items: center;
`;

const logoBackground = css`
  background-color: #9F2D20;
  height: 60px;
  width: 70px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  clip-path: polygon(0 0, 60% 0, 100% 100%, 40% 100%);
`;

const LogoBSS = styled.img`
  height: 55px;
  align-self: center;
  padding-right: 10px;
`;

const ButtonsBlock = styled.div`
       width: 80%;
       flex: none;
       max-width: none;
       -webkit-flex: none;
`;

const verticalAlign = css`
  display: flex; 
  flex-direction: column; 
  justify-content: center;
`;


class UserHeader extends Component {
    constructor(props) {
        super(props);
        this.switchToStaff = this.switchToStaff.bind(this);
    };

    switchToStaff() {
        this.props.history.push('/staff');
    }

    render() {
    let props = this.props;
return <header>
    <div className="row" css={pageTop}>
      <div className="col-8" css={blockHeader}>
        <a href={'https://spbu.ru'} target="_blank" rel="noopener noreferrer">
          <img src={logoSPbU} css={css`height: 55px;`}/>
        </a>
        <a href={'https://vk.com/ssspbu'} target="_blank" rel="noopener noreferrer">
          <div css={logoBackground}>
            <LogoBSS src={logoBss} alt={'БСС'}/>
          </div>
        </a>
        <div className="p_header">
          <span css={css`color: #595959;`}>Студенческий совет СПбГУ</span> <br/>
          <span css={css`padding-left: 13px; color: black;`}>{props.pageName}</span>
        </div>
      </div>

      <div className="col-4">
        <div css={css`display: flex; justify-content: flex-end;`}>

          <div css={verticalAlign}>
            <div css={css`margin-right: 20px; font-size: medium;`}>
            {userPersonalStore && userPersonalStore.fio}
            </div>
          </div>
          <div>
            <form action="/api/logout">
              <button type="submit"
                className="btn btn-outline-danger"
                css={css`
                border-color: #9F2D20;
                color: #9F2D20;
                `}
                action="/api/logout">
                Выход
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </header>;
    }
}

export default withRouter(observer(UserHeader))
