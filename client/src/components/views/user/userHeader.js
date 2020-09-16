import React, {Component} from 'react';
import '../../../style/user_main.css';
import userPersonalStore from '../../../stores/userPersonalStore';
import {observer} from 'mobx-react';
import {withRouter} from 'react-router-dom';
import { ReactComponent as LogoSPbU } from '../../../assets/img/logo_spbu-compressed-medium.svg';
import { ReactComponent as LogoBSS } from '../../../assets/img/logo_bss-compressed-medium.svg';
/** @jsx jsx */
import {css, jsx} from '@emotion/core';

const pageTop = css`
    background-color: white;
    border-bottom: 1px solid #a5a5a5;
    align-items: center;
    font-size: 14px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, .2);
    justify-content: space-between;
    margin-left: 0;
    margin-right: 0;
`;

const blockHeader = css`
    color: #4a4a4a;
    display: flex;
    font-size: 14px;
    align-items: center;
    margin-left: 1rem;
    @media only screen and (max-device-width: 768px) {
    max-width: 45%;
  }
`;

const logoBackground = css`
  background-color: #9F2D20;
  height: 60px;
  width: 70px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  clip-path: polygon(0 0, 60% 0, 100% 100%, 40% 100%);
  @media only screen and (max-device-width: 768px) {
    height: 35px;
    width: 40px;
  }
  
`;

const logoBSS = css`
  height: 55px;
  align-self: center;
  padding-right: 10px;
  @media only screen and (max-device-width: 768px) {
    height: 35px;
  }
`;

const logoSpbuBackground = css`
  display: flex;
  flex-direction: column;
  justify-content: center;
  `

const logoSPbU = css`
  height: 55px;
  width: 47px;
  @media only screen and (max-device-width: 768px) {
    height: 32px;
    width: 27px;
  }

`;

const verticalAlign = css`
  display: flex; 
  flex-direction: column; 
  justify-content: center;
`;

const rightPanel = css `
    margin-right: 1rem;
    @media only screen and (max-device-width: 768px) {
    max-width: 65%;
    flex: 0 0 65%;
  }
`;

const FIO = css `
margin-right: 20px; 
font-size: medium;
  @media only screen and (max-device-width: 800px) {
    font-size: small;
  }
  @media only screen and (max-device-width: 480px) {
    font-size: x-small;
  }
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
    const props = this.props;
    return <header>
      <div className="row" css={pageTop}>
        <div css={blockHeader}>
          <a href={'https://spbu.ru'} target="_blank" rel="noopener noreferrer">
            <div css={logoSpbuBackground}>
            <LogoSPbU css={logoSPbU}/>
            </div>
          </a>
          <a href={'https://vk.com/ssspbu'} target="_blank" rel="noopener noreferrer">
            <div css={logoBackground}>
                <LogoBSS css={logoBSS}/>
            </div>
          </a>
          <div className="p_header">
            <span css={css`color: #595959;`}>Студенческий совет СПбГУ</span> <br/>
            <span css={css`padding-left: 13px; color: black;`}>{props.pageName}</span>
          </div>
        </div>

        {!props.clear &&  <div css={rightPanel}>
          <div css={css`display: flex; justify-content: flex-end;`}>

            <div css={verticalAlign}>
              <div css={FIO}>
                {userPersonalStore && userPersonalStore.fio}
              </div>
            </div>
            {(userPersonalStore.Role === 'Admin' || userPersonalStore.Role === 'SuperAdmin') &&
            <div style={{'marginRight': '1rem'}}>
              <button type="button" id="SubmitButton"
                      className="btn btn-outline-primary"
                      css = {css`                 
                    @media only screen and (max-device-width: 768px) {
                    font-size: smaller;
                    border-color: transparent;
                      }`
                      }
                      onClick={this.switchToStaff}>
                Режим проверяющего
              </button>
            </div>
            }
            <div>
              {userPersonalStore && userPersonalStore.personal && <form action="/api/logout">
                <button type="submit"
                  className="btn btn-outline-danger"
                  css={css`
                border-color: #9F2D20;
                color: #9F2D20;
                  @media only screen and (max-device-width: 768px) {
                    font-size: smaller;
                    border-color: transparent;
                 }
                `}
                  action="/api/logout">
                Выход
                </button>
              </form>}
            </div>
          </div>
        </div>}
      </div>
    </header>;
  }
}

export default withRouter(observer(UserHeader));
