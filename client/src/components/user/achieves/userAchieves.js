import React, {Component} from 'react';
import '../../../style/user_main.css';
import CurrentAchievesTable from './currentAchievesTable';
import userAchievesStore from '../../../stores/userAchievesStore';
import {observer} from 'mobx-react';
import {css, jsx} from '@emotion/core';
/** @jsx jsx */
import {BASE_API_URL} from '../../../consts/constants';
import {withRouter} from 'react-router-dom';
import UserMainPanel from '../../common/userMainPanel';

// a20800
const mainButton = css`
    color: #fff;
    background-color: #9F2D20;
    border-color: #9F2D20;
    
    &:focus {
        box-shadow: 0 0 0 .2rem #f1c8c6;
    }
    
    @media only screen and (max-device-width: 480px) {
        font-size: x-small;
    }
`;

const panelCSS = css`
    margin-bottom: 2rem;
    padding: 1rem;
    @media only screen and (max-device-width: 480px) {
        padding-top: 1rem;
    }
            @media only screen and (max-device-width: 812px) {
        margin: 0 auto 2rem auto;
    }
`;


class UserAchieves extends Component {
  constructor(props) {
    super(props);
    this.state = {archiveHidden: true};
    this.checkConfirms = this.checkConfirms.bind(this);
    this.toggleArchiveHide = this.toggleArchiveHide.bind(this);
  }

  toggleArchiveHide() {
    this.setState({archiveHidden: !this.state.archiveHidden});
  }

  componentDidMount() {
    userAchievesStore.getAchieves();
  }

  checkConfirms(e) {
    const achsWithoutConfirms = [];
    let message = '\n';
    for (const ach of userAchievesStore.achieves) {
      if (!ach.confirmations || ach.confirmations.length === 0) {
        if (ach.crit !== '1 (7а)' && ach.crit !== '7а') {
          achsWithoutConfirms.push(ach);
          message += ach.crit + '. ' + ach.achievement + '\n';
        }
      }
    }

    if (achsWithoutConfirms.length > 0) {
      // eslint-disable-next-line
      if (!confirm(
          'У Вас есть достижения, к которым не приложены подтверждения:\n' +
          message +
          '\nВы уверены, что хотите скачать документы?')) {
        e.stopPropagation();
        e.preventDefault();
      }
    }
  }

  render() {
    let summaryBall = 0;
    let summaryPreliminaryBall = 0;
    if (userAchievesStore.achieves) {
      for (const ach of userAchievesStore.achieves) {
        if (ach.status === 'Принято' || ach.status === 'Принято с изменениями') {
          summaryBall += ach.ball;
        }
        if (ach.preliminaryBall) {
          summaryPreliminaryBall += ach.preliminaryBall;
        }
      }
    }
    if (!userAchievesStore.achieves) return null;
    return (<UserMainPanel title={<b style={{fontSize: '1.2rem'}}>Текущие достижения</b>} panelCSS={panelCSS}
        buttons={
          <form action={BASE_API_URL + '/getAnket'} onSubmit={this.checkConfirms}>
            <input type="submit" id="download" className="btn" css={mainButton} value="Скачать анкету"/>
          </form>
        }
        >
        <div style={{display: 'flex'}}>
        {summaryBall > 0 && <div css={css`font-size: small; margin-bottom: 1rem;`}>Суммарный балл: {summaryBall}</div>}
        {summaryPreliminaryBall > 0 && summaryBall !== summaryPreliminaryBall &&
        <div style={summaryBall > 0 ? {marginLeft: '2rem'} : {}} css={css`font-size: small; margin-bottom: 1rem; color: grey;`}>Предварительный балл: {summaryPreliminaryBall}</div>}
        </div>
        <div css={css`width: 100%; min-height: 10rem;`}>
            {userAchievesStore.achieves && <CurrentAchievesTable currentAchieves={userAchievesStore.achieves}/>}
            {userAchievesStore.achieves.length === 0 && <div style={{width: '100%', paddingTop: '2rem'}}>
                <div style={{width: '100%', textAlign: 'center', fontWeight: 350}}>Пока что Вы ничего не внесли</div>
                <div style={{width: '100%', textAlign: 'center'}}>
                    <button className='btn' style={{color: '#007bff', backgroundColor: 'unset', fontSize: 'large'}}
                            onClick={() => this.props.history.push('/upload')}
                    >Добавить достижение</button>
                </div>
            </div>}
        </div>
        {userAchievesStore.archivedAchieves && userAchievesStore.archivedAchieves.length > 0 && <div>
          <div css={css`background-color: #4C4C4C; color: white; width: 100%; padding: 5px 5px 5px 1rem; margin-bottom: 1rem; cursor: pointer;`}
               onClick={this.toggleArchiveHide}>
            <i className={'fas fa-chevron-' + (!this.state.archiveHidden ? 'right' : 'down') + ' mychevron'}
               />
             <span style={{marginLeft: '1rem'}}>Архив достижений</span>
          </div>
          {!this.state.archiveHidden && <div css={css`width: 100%; min-height: 10rem;`}>
            <table>
            {userAchievesStore.archivedAchieves && userAchievesStore.archivedAchieves.map((x) => <tr><td css={css`width:5%; border-top: 1px solid #e3e3e3;`}>{x.crit}</td><td css={css`width:70%; border-top: 1px solid #e3e3e3;`}>{x.achievement}</td><td css={css`border-top: 1px solid #e3e3e3;`}>{(new Date(x.achDate)).toLocaleDateString('ru-RU')}</td><td css={css`border-top: 1px solid #e3e3e3;`}>{(x.status !== 'Ожидает проверки') && x.status}</td></tr>)}
            </table>
          </div>}
        </div>}

      <div css={css`
      width: 3rem; height: 3rem; background-color: #129b41; border-radius: 50%; box-shadow: 0 2px 4px rgba(0, 0, 0, .6);;
      position: fixed; right: 1rem; bottom: 1rem; z-index: 9999; cursor: pointer; color: white; font-size: 2rem; text-align: center;
        display: none;
        @media only screen and (max-device-width: 768px) {
            display: block;
        }
      `}
      onClick={() => this.props.history.push('/upload')}>
        <i className="fa fa-plus" aria-hidden="true" style={{margin: 'auto'}}/>
      </div>
    </UserMainPanel>);
  }
}

// #9b1818
// #129b41

export default withRouter(observer(UserAchieves));
