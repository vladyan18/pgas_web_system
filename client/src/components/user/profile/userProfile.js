import React, {Component, useState} from 'react';
import '../../../style/add_portfolio.css';
import {withRouter} from 'react-router-dom';
import {css, jsx} from '@emotion/core';
import {OverlayTrigger, Popover} from 'react-bootstrap';
import userPersonalStore from '../../../stores/userPersonalStore';
import {fetchGet, fetchSendObj, fetchSendWithoutRes} from '../../../services/fetchService';
import {getDate} from '../../../helpers/';
import UserMainPanel from '../../common/userMainPanel';
/** @jsx jsx */

function SubscriptionForm({defaultValue}) {
  const [subscriptionEmail, setSubcriptionEmail] = useState(defaultValue || (userPersonalStore.personal.id + '@student.spbu.ru'));
  const [subscripted, setSubcripted] = useState(!!defaultValue && defaultValue !== '');

  function changeNotificationEmail(email) {
    fetchGet('/change_notification_email', { email }).then(() => {
      console.log(email);
      if (email && email !== '') setSubcripted(true);
      else setSubcripted(false);
    });
  }

  if (subscripted) {
    return <div style={{display: 'flex', marginTop: '0.5rem'}}>
      <div><span>{subscriptionEmail}</span></div>
      <button className="btn btn-outline-danger" style={{border: 'none', padding: '0 1rem', marginLeft: '1rem'}} onClick={() => changeNotificationEmail('')}>Отписаться</button>
    </div>;
  }

  return <form onSubmit={(e) => {
    e.preventDefault();
    changeNotificationEmail(subscriptionEmail);
  }}>
    <p style={{color: 'grey', marginTop: '1rem'}}><i>Вы можете подписаться на уведомления о проверке Ваших достижений</i></p>
    <div className="input-group mb-3" style={{maxWidth: '30rem'}}>
      <input type='email' className="form-control" onChange={(e) => setSubcriptionEmail(e.target.value)} defaultValue={subscriptionEmail}/>
      <div className="input-group-append">
        <button type='submit' className="btn btn-primary">Подписаться</button>
      </div>
    </div>
  </form>;
}

function PortfolioForm() {
  const [portfolioOpened, setPortfolioOpened] = useState(userPersonalStore.Settings && userPersonalStore.Settings.portfolioOpened);

  async function switchPortfolio() {
    await fetchSendWithoutRes('/change_settings', {portfolioOpened: !portfolioOpened});
    setPortfolioOpened(!portfolioOpened);
  }

  if (!portfolioOpened) {
    return <div style={{marginTop: '1rem'}}>
      <p style={{color: 'grey'}}><i>После создания своего Портфолио, Вы сможете опубликовать ссылку на него</i></p>
      <button className="btn btn-primary" onClick={switchPortfolio}>Создать портфолио</button>
    </div>;
  }

  const portfolioUrl = 'https://achieve.spbu.ru/api/portfolio/' + userPersonalStore.personal.id;
  return <div style={{marginTop: '1rem'}}>
    <p><b style={{color: 'grey'}}>Адрес портфолио:</b> <a href={ portfolioUrl } target="_blank">{ portfolioUrl }</a></p>
    <button className="btn btn-outline-danger" onClick={switchPortfolio}>Закрыть доступ к Портфолио</button>
  </div>;
}

class UserProfile extends Component {
  constructor(props) {
    super(props);
    this.handlePrivacyChange = this.handlePrivacyChange.bind(this);
    this.state = {};

    this.checkSubscription = async function() {
      const result = await fetchGet('/notifications_subscribtions', {});
      if (!result.subscriptions) result.subscriptions = {};
      this.setState({notificationSettings: result.subscriptions});
    };

    this.removeSubscription = function() {
      fetchSendWithoutRes('/notifications_unsubscribe', {}).then();
    };
  }

  handlePrivacyChange(e) {
    const userOld = userPersonalStore.personal;
    const user = {};
    user.LastName = userOld.LastName;
    user.FirstName = userOld.FirstName;
    user.Patronymic = userOld.Patronymic;
    user.Birthdate = userOld.Birthdate;
    user.Faculty = userOld.Faculty;
    user.Type = userOld.Type;
    user.Course = userOld.Course;

    user.Settings = userOld.Settings;
    if (!user.Settings) {
      user.Settings = {};
    }
    user.Settings.detailedAccessAllowed = e.target.checked;

    fetchSendWithoutRes('/api/registerUser', user).then(() => {
      userPersonalStore.update().then();
    });
  }

  componentDidMount() {
    this.checkSubscription();
  }

  render() {
    const allowAccessPopover = (
        <Popover id="popover-basic" style={{width: '40rem'}}>
          <Popover.Title as="h3">Согласие на открытие доступа</Popover.Title>
          <Popover.Content>
            Ставя эту галочку, вы разрешаете участникам конкурса с вашего факультета, <b>также поставившим эту
            галочку</b>,
            просматривать ваши достижения в рейтинге на ПГАС. Такая возможность предоставляется в целях
            повышения открытости процесса и формирования доверия между всеми участниками назначения ПГАС.
            <br/>
            <i style={{fontSize: 'small', color: '#5d5d5d'}}>Таким образом, ставя данную галочку, вы
              дополнительно даете согласие на публикацию информации,
              относящейся к вашим персональным данным в соответствии со статьей 9 Федерального закона
              от 27.07.2006 №152-ФЗ «О персональных данных», в целях повышения открытости процесса назначения
              ПГАС. Отзыв данного согласия
              возможен путем изменения настроек в профиле.</i>
          </Popover.Content>
        </Popover>
    );

    return (
        <UserMainPanel title={'Мой профиль'}
          buttons={
          <button id="editButton" className="btn btn-primary" value="Редактировать"
              onClick={() => this.props.history.push('/edit_profile')}>Редактировать
          </button>
          }
        >
        <table style={{'margin-bottom': '2rem'}}>
          <tbody>
            <tr>
              <td style={{'text-align': 'right'}}>Ф.И.О.:</td>
              <td id="FIO" style={{'padding-left': '0.5rem'}}> {this.props.fio}</td>
            </tr>
            <tr>
              <td style={{'text-align': 'right'}}>Почта СПбГУ:</td>
              <td id="Faculty" style={{'padding-left': '0.5rem'}}>{this.props.SpbuId}</td>
            </tr>
            <tr>
              <td style={{'text-align': 'right'}}>Дата рождения:</td>
              <td id="Bdate" style={{'padding-left': '0.5rem'}}>{getDate(this.props.Birthdate)}</td>
            </tr>
            <tr>
              <td style={{'text-align': 'right'}}>Факультет:</td>
              <td id="Faculty" style={{'padding-left': '0.5rem'}}>{this.props.Faculty}</td>
            </tr>
            <tr>
              <td style={{'text-align': 'right'}}>Ступень обучения:</td>
              <td id="Type" style={{'padding-left': '0.5rem'}}>{this.props.Type}</td>
            </tr>
            <tr>
              <td style={{'text-align': 'right'}}>Курс:</td>
              <td id="Course" style={{'padding-left': '0.5rem'}}>{this.props.Course}</td>
            </tr>
          </tbody>
        </table>

          <div style={{cursor: 'pointer', marginTop: '3rem', marginBottom: '2rem'}}>
            <OverlayTrigger trigger={['hover', 'focus']} placement="left"
                            overlay={allowAccessPopover} >
              <div className="checkbox" style={{color: 'green'}}>
                <input type="checkbox" id="checkbox_1" defaultChecked={userPersonalStore.Settings && userPersonalStore.Settings.detailedAccessAllowed}
                       onChange={this.handlePrivacyChange} style={{cursor: 'pointer', marginRight: '5px'}}/>
                <label htmlFor="checkbox_1" style={{cursor: 'pointer'}}>Открыть участникам доступ к моим достижениям</label>
              </div>
            </OverlayTrigger>
          </div>

      <div style={{margin: '3rem 0 1rem 0'}}>
        <hr/>
        <b>Управление Портфолио</b>
        <PortfolioForm/>
      </div>


      { this.state.notificationSettings &&
      <div style={{margin: '3rem 0 2rem 0'}}>
        <hr/>
        <b>Управление уведомлениями</b>
        <SubscriptionForm defaultValue={this.state.notificationSettings.email}/>
      </div>
      }

      <hr/>

    </UserMainPanel>);
  }
}

async function askUserPermission() {
  return await Notification.requestPermission();
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  // eslint-disable-next-line
  const base64 = (base64String + padding).replace(/\-/g, "+").replace(/_/g, "/")

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function sendSubscription(subscription) {
  return fetchSendObj('/notifications_subscribe', subscription);
}
const convertedVapidKey = urlBase64ToUint8Array('BFfYWgmcjhhOoC9nue978vFsO3t06G3ePJXgDvTIJ8WZ_mSP_VQhnI-oTn6oJSmjFTHkzjyem4UTvXcGHWWj730');

function subscribeUser() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then(function(registration) {
      if (!registration.pushManager) {
        console.log('Push manager unavailable.');
        return;
      }

      registration.pushManager.getSubscription().then(function(existedSubscription) {
        if (existedSubscription === null) {
          console.log('No subscription detected, make a request.');
          registration.pushManager.subscribe({
            applicationServerKey: convertedVapidKey,
            userVisibleOnly: true,
          }).then(function(newSubscription) {
            console.log('New subscription added.');
            sendSubscription(newSubscription);
          }).catch(function(e) {
            if (Notification.permission !== 'granted') {
              console.log('Permission was not granted.');
            } else {
              console.error('An error ocurred during the subscription process.', e);
            }
          });
        } else {
          console.log('Existed subscription detected.');
          sendSubscription(existedSubscription);
        }
      });
    })
        .catch(function(e) {
          console.error('An error ocurred during Service Worker registration.', e);
        });
  }
}

export default withRouter(UserProfile);
