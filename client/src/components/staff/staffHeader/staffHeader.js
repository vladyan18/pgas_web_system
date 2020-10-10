import React, {Component} from 'react';
import '../../../style/user_main.css';
import userPersonalStore from '../../../stores/userPersonalStore';
import {observer} from 'mobx-react';
import {withRouter} from 'react-router-dom';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import staffContextStore from '../../../stores/staff/staffContextStore';
import staffNewAchievementsStore from '../../../stores/staff/staffNewAchievementsStore';
import currentContestStore from '../../../stores/staff/currentContestStore';
import currentContestRatingStore from '../../../stores/staff/currentContestRatingStore';
import logoBss from '../../../assets/img/logo_bss.svg';
import logoSPbU from '../../../assets/img/CoA_Small_whitebg.svg';
/** @jsx jsx */
import {css, jsx} from '@emotion/core';
import styled from '@emotion/styled';

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

const pageTop = css`
    background-color: white;
    border-bottom: 1px solid #a5a5a5;
    align-items: center;
    font-size: 14px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, .2);
`;

class StaffHeader extends Component {
  constructor(props) {
    super(props);
    this.switchToUser = this.switchToUser.bind(this);
    this.goToMenu = this.goToMenu.bind(this);
    this.switchFaculty = this.switchFaculty.bind(this);
  }

  switchToUser() {
    this.props.history.push('/home');
  }

  switchFaculty(faculty, event) {
    event.preventDefault();
    staffContextStore.changeFaculty(faculty).then();
    staffNewAchievementsStore.update(faculty).then();
    currentContestStore.update(faculty).then();
    currentContestRatingStore.update(faculty).then();
  }

  goToMenu() {
    this.props.history.push('/staff');
  }

  render() {
    return <header>
      <div className="row" css={pageTop}>
        <div className="col-9 block_header" style={{marginTop: 0, marginBottom: 0}}>
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
            <span css={css`padding-left: 13px; color: black;`}>{this.props.pageName}</span>
          </div>
        </div>


        <div className="col-3 buttons_header ">

          <div className="admin_header_buttons_group">
            <div>
              <button type="button"
                className="btn btn-outline-primary" onClick={this.goToMenu}>
                                Меню
              </button>
            </div>
            <DropdownButton variant="warning" title={staffContextStore.faculty}>
              {userPersonalStore.Rights && userPersonalStore.Rights.map((x) => (
                <Dropdown.Item key={x} onClick={(e) => this.switchFaculty(x, e)}>{x}</Dropdown.Item>
              ))
              }
            </DropdownButton>

            {['Admin', 'SuperAdmin', 'Moderator', 'Observer'].includes(userPersonalStore.Role) &&
                        <div style={{'marginRight': '1rem'}}>
                          <button type="button" id="SubmitButton"
                            className="btn btn-outline-primary" onClick={this.switchToUser}>
                                Режим пользователя
                          </button>
                        </div>
            }
            <div>
              <form action="/api/logout">
              <button type="submit" id="logoutButton"
                className="btn btn-outline-danger">
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

export default withRouter(observer(StaffHeader));
