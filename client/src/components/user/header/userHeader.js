import React, {Component} from 'react';
import '../../../style/user_main.css';
import userPersonalStore from '../../../stores/userPersonalStore';
import {observer} from 'mobx-react';
import {withRouter} from 'react-router-dom';
import { ReactComponent as LogoSPbU } from '../../../assets/img/logo_spbu-compressed-medium.svg';
import { ReactComponent as LogoBSS } from '../../../assets/img/logo_bss-compressed-medium.svg';
/** @jsx jsx */
import {css, jsx} from '@emotion/core';
import styled from '@emotion/styled';
import UserNavItem from '../navbar/userNavItem';
import Dropdown from 'react-bootstrap/Dropdown';

const pageTop = css`
    background-color: white;
    border-bottom: 1px solid #a5a5a5;
    align-items: center;
    font-size: 14px;
    justify-content: space-between;
    margin-left: 0;
    margin-right: 0;

    @media only screen and (max-device-width: 768px) {
      background-color: #fafafa;
    }
`;


const blockHeader = css`
    color: #4a4a4a;
    display: flex;
    font-size: 14px;
    align-items: center;
    margin-left: 1rem;
    @media only screen and (max-device-width: 768px) {
    max-width: 45%;
    height: 3rem;
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
    height: 3rem;
    width: 2.5rem;
    clip-path: polygon(0 0, 70% 0, 100% 100%, 30% 100%);
  }
  
`;

const logoBSS = css`
  height: 55px;
  align-self: center;
  padding-right: 10px;
  @media only screen and (max-device-width: 768px) {
    height: 45px;
  }
`;

const logoSpbuBackground = css`
  display: flex;
  flex-direction: column;
  justify-content: center;
  `;

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
`;

const styles = {
  bmBurgerButton: {
    display: 'none',
  },
  bmBurgerBarsHover: {
    background: '#a90000',
  },
  bmCrossButton: {
    height: '24px',
    width: '24px',
  },
  bmCross: {
    background: '#1b1b1e',
  },
  bmMenuWrap: {
    position: 'fixed',
    height: '100%',
  },
  bmMenu: {
    background: '#f6f8f1',
    padding: '2.5em 0 0',
    fontSize: '1.15em',
  },
  bmMorphShape: {
    fill: '#373a47',
  },
  bmItemList: {
    color: '#b8b7ad',
    padding: '0.8em',
  },
  bmItem: {
    display: 'inline-block',
  },
  bmOverlay: {
    background: 'rgba(0, 0, 0, 0.3)',
  },
};

function HamMenu(props) {
  if (!props.isOpen) return null;
  return <div style={{backgroundColor: '#fafafa', padding: '0.5rem 1rem'}}>
      <UserNavItem to='/home' onClick={props.onClose}>Мои достижения</UserNavItem>
      <UserNavItem to='/upload' onClick={props.onClose}>Добавить достижение</UserNavItem>
      {userPersonalStore.IsInRating && <UserNavItem to='/rating' onClick={props.onClose}>Рейтинг</UserNavItem>}
      <UserNavItem to='/documents' onClick={props.onClose}>Информация</UserNavItem>
      <UserNavItem to='/confirmations' onClick={props.onClose}>Мои документы</UserNavItem>
      <UserNavItem to='/profile' onClick={props.onClose}>Мой профиль</UserNavItem>
  </div>;
}

const bssTitleCSS = css`color: #595959;`;
const pageNameCSS = css`padding-left: 13px; color: black;`;
function DesktopLeftBlock(props) {
  return <div css={blockHeader}>
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
      <span css={bssTitleCSS}>Студенческий совет СПбГУ</span> <br/>
      <span css={pageNameCSS}>{props.pageName}</span>
    </div>
  </div>;
}

function MobileLeftBlock(props) {
  return <div css={blockHeader}>
    <div
         css={css`
         font-size: 1rem;
         cursor: pointer;
         :hover {
            color: red;
         }
         `}
         onClick={props.switchMenu}>
      <i className="fa fa-bars"/> Меню
    </div>
    <div style={{marginLeft: '0.5rem'}}>
    <a href={'https://vk.com/ssspbu'} target="_blank" rel="noopener noreferrer">
      <div css={logoBackground}>
        <LogoBSS css={logoBSS}/>
      </div>
    </a>
    </div>
  </div>;
}

const FIOblock = styled.div`display: flex; justify-content: flex-end;`;
const AdminPanelButton = styled.button`
@media only screen and (max-device-width: 768px) {
                    font-size: smaller;
                    border-color: transparent;
                      }
`;
const LogoutButton = styled.button`
border-color: #9F2D20;
                color: #9F2D20;
                  @media only screen and (max-device-width: 768px) {
                    font-size: smaller;
                    border-color: transparent;
                 }
`;

const DesktopRightBlock = observer((props) => {
  return (<>{!props.clear && <div css={rightPanel}>
    <FIOblock>
      <div css={verticalAlign}>
        <div css={FIO}>
          {userPersonalStore && userPersonalStore.fio}
        </div>
      </div>
      {['Admin', 'SuperAdmin', 'Moderator', 'Observer'].includes(userPersonalStore.Role) &&
      <div style={{'marginRight': '1rem'}}>
        <AdminPanelButton type="button" id="SubmitButton"
                className="btn btn-outline-primary"
                onClick={props.switchToStaff}>
          Режим проверяющего
        </AdminPanelButton>
      </div>
      }
      <div>
        {userPersonalStore && userPersonalStore.personal && <form action="/api/logout">
          <LogoutButton type="submit"
                  className="btn btn-outline-danger"
                  action="/api/logout">
            Выход
          </LogoutButton>
        </form>}
      </div>
    </FIOblock>
  </div>}</>);
});

const CustomToggle = React.forwardRef(({ children, onClick }, ref) => (
    <a
        href=""
        ref={ref}
        style={{color: 'black'}}
        onClick={(e) => {
          e.preventDefault();
          onClick(e);
        }}
    >
      {children}
    </a>
));

const MobileRightBlock = observer((props) => {
  return <>{!props.clear && <div>
    <div css={css`display: flex; justify-content: flex-end;`}>
      <div css={verticalAlign}>
        <div css={FIO}>

          <Dropdown>
            <Dropdown.Toggle as={CustomToggle} id="dropdown-basic">
              {userPersonalStore && userPersonalStore.LastName && <>
                {`${userPersonalStore.LastName} ${userPersonalStore.FirstName[0]}. ${userPersonalStore.Patronymic ? userPersonalStore.Patronymic[0] + '.' : ''} `}
                <i className="fa fa-chevron-down"/>
              </>}
            </Dropdown.Toggle>

            <Dropdown.Menu>
              <Dropdown.Item href="/staff"><span style={{color: 'blue'}}>Режим проверяющего</span></Dropdown.Item>
              <Dropdown.Item href="/api/logout"><span style={{color: 'red'}}>Выход</span></Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </div>
    </div>
  </div>} </>;
});

const headerCSS = css`box-shadow: 0 2px 4px rgba(0, 0, 0, .2);`;

class UserHeader extends Component {
  constructor(props) {
    super(props);
    this.switchToStaff = this.switchToStaff.bind(this);
    this.switchMenu = this.switchMenu.bind(this);
    this.closeMenu = this.closeMenu.bind(this);
    const isMobile = (window.innerWidth <= 812);
    this.state = {isMobile};
  }

  switchToStaff() {
    this.props.history.push('/staff');
  }

  switchMenu() {
    this.setState({isMenuOpened: !this.state.isMenuOpened});
  }

  closeMenu() {
    this.setState({isMenuOpened: false});
  }

  render() {
    return <>
    <header css={headerCSS}>
      <div className="row" css={pageTop}>
        {!this.state.isMobile && <DesktopLeftBlock {...this.props}/>}
        {this.state.isMobile && <MobileLeftBlock switchMenu={this.switchMenu}/>}

        {!this.state.isMobile && <DesktopRightBlock {...this.props} switchToStaff={this.switchToStaff}/>}
        {this.state.isMobile && <MobileRightBlock {...this.props}/>}
      </div>
      <HamMenu isOpen={this.state.isMenuOpened} onClose={this.closeMenu}/>
    </header></>;
  }
}

export default withRouter(observer(UserHeader));
