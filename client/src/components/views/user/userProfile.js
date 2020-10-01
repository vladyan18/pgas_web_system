import React, {Component} from 'react';
import '../../../style/add_portfolio.css';
import {withRouter} from 'react-router-dom';
import {Panel} from './style'
import styled from '@emotion/styled';
import {css, jsx} from '@emotion/core';
import {OverlayTrigger, Popover} from "react-bootstrap";
import userPersonalStore from "../../../stores/userPersonalStore";
import {fetchGet, fetchSendObj, fetchSendWithoutRes} from "../../../services/fetchService";
/** @jsx jsx */

class UserProfile extends Component {
  constructor(props) {
    super(props);
    this.handlePrivacyChange = this.handlePrivacyChange.bind(this);
    this.state = {};
    this.checkSubscription = function () {
      checkNotificationSubscription().then((result) => {
        this.setState({subscribedToNotification: result});
      });
    }

    this.removeSubscription = function () {
      fetchSendWithoutRes('/notifications_unsubscribe', {}).then();
    }
  };

  handlePrivacyChange(e) {
    let userOld = userPersonalStore.personal;
    let user = {};
    user.lastname = userOld.LastName;
    user.name = userOld.FirstName;
    user.patronymic = userOld.Patronymic;
    user.birthdate = userOld.Birthdate;
    user.faculty = userOld.Faculty;
    user.type = userOld.Type;
    user.course = userOld.Course;

    user.settings = { detailedAccessAllowed: e.target.checked};

    fetchSendWithoutRes('/api/registerUser', user).then((result) => {
      userPersonalStore.update().then();
    });
  }

  componentDidMount() {
    this.checkSubscription();
  }

  render() {
    const allowAccessPopover = (
        <Popover id="popover-basic" style={{width: "40rem"}}>
          <Popover.Title as="h3">Согласие на открытие доступа</Popover.Title>
          <Popover.Content>
            Ставя эту галочку, вы разрешаете участникам конкурса с вашего факультета, <b>также поставившим эту
            галочку</b>,
            просматривать ваши достижения в рейтинге на ПГАС. Такая возможность предоставляется в целях
            повышения открытости процесса и формирования доверия между всеми участниками назначения ПГАС.
            <br/>
            <i style={{fontSize: "small", color: "#5d5d5d"}}>Таким образом, ставя данную галочку, вы
              дополнительно даете согласие на публикацию информации,
              относящейся к вашим персональным данным в соответствии со статьей 9 Федерального закона
              от 27.07.2006 №152-ФЗ «О персональных данных», в целях повышения открытости процесса назначения
              ПГАС. Отзыв данного согласия
              возможен путем изменения настроек в профиле.</i>
          </Popover.Content>
        </Popover>
    );

    return (<Panel className="col-md-9">
        <div className="profile" style={{'display': 'flex', 'justify-content': 'space-between', margin: "0"}}>
          <p className="headline" style={{'margin-bottom': 'auto'}}>
                    Мой профиль
          </p>
          <div style={{'margin-top': 'auto'}}>
            <button id="editButton" className="btn btn-primary" value="Редактировать"
              onClick={() => this.props.history.push('/edit_profile')}>Редактировать
            </button>
          </div>
        </div>


        <hr className="hr_blue"/>
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

        <div style={{cursor: 'pointer', marginBottom: '2rem'}}>
        <OverlayTrigger trigger={['hover', 'focus']} placement="left"
                        overlay={allowAccessPopover} >
          <div className="checkbox" style={{color: "green"}}>
            <input type="checkbox" id="checkbox_1" defaultChecked={userPersonalStore.Settings && userPersonalStore.Settings.detailedAccessAllowed}
            onChange={this.handlePrivacyChange} style={{cursor: 'pointer', marginRight: '5px'}}/>
            <label htmlFor="checkbox_1" style={{cursor: 'pointer'}}>Открыть участникам доступ к моим достижениям</label>
          </div>
        </OverlayTrigger>
          {userPersonalStore && (userPersonalStore.LastName === 'Волосников' || userPersonalStore.LastName === 'Testov') && <button className="btn btn-primary" onClick={() => {
            if (this.state.subscribedToNotification) {
              askUserPermission()
              this.removeSubscription();
            } else {
              subscribeUser()
            }
          }}>{this.state.subscribedToNotification ? 'Отписаться от уведомлений' : 'Подписаться на уведомления'}</button>}
        </div>
    </Panel>);
  }
}

async function checkNotificationSubscription() {
  const result = await fetchGet('/notifications_subscribtions', {});
  if (!result || result.subscriptions.length === 0) return;

  if (result.subscriptions.findIndex((x) => x.sessionId === result.sessionId) > -1) {
    return true;
  }
}


function getDate(d) {
  if (!d) return undefined;
  d = new Date(d);
  return (d.getDate() > 9 ? d.getDate() : '0' + d.getDate()) + '.' + ((d.getMonth() + 1) > 9 ? (d.getMonth() + 1) : '0' + (d.getMonth() + 1)) + '.' + d.getFullYear();
}

async function askUserPermission() {
  return await Notification.requestPermission();
}

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - base64String.length % 4) % 4)
  // eslint-disable-next-line
  const base64 = (base64String + padding).replace(/\-/g, "+").replace(/_/g, "/")

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

function sendSubscription(subscription) {
  return fetchSendObj('/notifications_subscribe', subscription);
}
const convertedVapidKey = urlBase64ToUint8Array("BFfYWgmcjhhOoC9nue978vFsO3t06G3ePJXgDvTIJ8WZ_mSP_VQhnI-oTn6oJSmjFTHkzjyem4UTvXcGHWWj730");

function subscribeUser() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then(function(registration) {
      if (!registration.pushManager) {
        console.log('Push manager unavailable.');
        return
      }

      registration.pushManager.getSubscription().then(function(existedSubscription) {
        if (existedSubscription === null) {
          console.log('No subscription detected, make a request.')
          registration.pushManager.subscribe({
            applicationServerKey: convertedVapidKey,
            userVisibleOnly: true,
          }).then(function(newSubscription) {
            console.log('New subscription added.')
            sendSubscription(newSubscription)
          }).catch(function(e) {
            if (Notification.permission !== 'granted') {
              console.log('Permission was not granted.')
            } else {
              console.error('An error ocurred during the subscription process.', e)
            }
          })
        } else {
          console.log('Existed subscription detected.')
          sendSubscription(existedSubscription)
        }
      })
    })
        .catch(function(e) {
          console.error('An error ocurred during Service Worker registration.', e)
        })
  }
}

export default withRouter(UserProfile);
