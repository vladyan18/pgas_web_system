import React, {Component} from 'react';
import logo from '../../../img/gerb.png';
import '../../../style/user_main.css';
import userPersonalStore from '../../../stores/userPersonalStore';
import {observer} from 'mobx-react';
import {withRouter} from 'react-router-dom';
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
    @media only screen and (max-device-width: 480px) {
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
  @media only screen and (max-device-width: 480px) {
    height: 35px;
    width: 40px;
  }
  
`;

const LogoBSS = styled.img`
  height: 55px;
  align-self: center;
  padding-right: 10px;
  @media only screen and (max-device-width: 480px) {
    height: 35px;
  }
`;

const LogoSPbU = styled.img`
  height: 55px;
  @media only screen and (max-device-width: 480px) {
    height: 32px;
  }

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

const rightPanel = css `
    @media only screen and (max-device-width: 480px) {
    max-width: 55%;
    flex: 0 0 55%;
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
        <div className="col-8" css={blockHeader}>
          <a href={'https://spbu.ru'} target="_blank" rel="noopener noreferrer">
            <LogoSPbU src={logoSPbU} alt={'СПбГУ'}/>
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

        <div className="col-4" css={rightPanel}>
          <div css={css`display: flex; justify-content: flex-end;`}>

            <div css={verticalAlign}>
              <div css={FIO}>
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
                  @media only screen and (max-device-width: 480px) {
                    font-size: smaller;
                    border-color: transparent;
                 }
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

export default withRouter(observer(UserHeader));
