import React, {Component} from 'react';
import logoBss from '../img/logo_bss2.png';
import lock from '../assets/img/lock.png';
import {BASE_API_URL} from '../common/constants';
import {fetchGet, fetchSendObj, fetchSendWithoutRes} from "../services/fetchService";
import {css, jsx} from '@emotion/core';
/** @jsx jsx */
import {LoginPanel} from "./views/user/style";
import UserHeader from "./views/user/userHeader";
import UserHeaderContainer from "./containers/user/userHeaderContainer";

class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      password: '',
    };
    this.doLogin = this.doLogin.bind(this);
  };

  componentDidMount() {
    let isAuth = localStorage.getItem('isAuthenticated') === 'true';
    if (isAuth) {
      window.location.replace('/home');
    }
  }

  async doLogin(e) {
    e.preventDefault();
    let result = await fetchSendWithoutRes('/login', {username: this.state.username, password: this.state.password});

    if (result) {
      console.log('SET ITEM')
      localStorage.setItem('isAuthenticated', 'true');
      if (window.location.pathname === '/login') {
        window.location.replace('/home');
      } else {
        window.location.reload();
      }
    } else {
      this.setState({error: true})
    }
  }

  render() {
    return (<>
      <UserHeaderContainer clear={true}/>
        <div className="container-fluid">
      <main>
        <div className="row background_main" style={{display: 'flex', justifyContent: 'center'}}>
          <LoginPanel>
            <tr>
              <td><img src={lock} className="pic_lock" style={{height: '4rem', width: '4rem', marginRight: '1rem'}} alt={'login'}/></td>
              <td style={{verticalAlign: 'middle', paddingTop: '0.2rem', maxWidth: '15rem'}}><b style={{fontSize: '2rem', 'lineHeight': '1.6rem'}}>Вход в систему ПГАС</b></td>
            </tr>
            <div className="header_logo_text"
                 style={{fontWeight: 'lighter', fontSize: '1rem', marginTop: '1rem', maxWidth: '20rem'}}>Для входа необходимо использовать единый логин (st******)</div>

            <form id = 'login' method ='post' onSubmit={this.doLogin}>
              <label id='name'><b>Имя пользователя</b></label><br/>
              <input type='text' id='name' name = 'username' className={"form-control" + (this.state.error ? ' is-invalid': '')} required
              onChange={(e) => this.setState({username: e.target.value, error: undefined})}/>
              <label id='password' style={{marginTop: '0.5rem'}}><b>Пароль</b></label><br/>
              <input type='password' id='password' name = 'password' className={"form-control " + (this.state.error ? ' is-invalid': '')} required={true}
                     onChange={(e) => this.setState({password: e.target.value, error: undefined})}/><br/>
              <input type='submit' style={{float: 'right'}} className='button btn btn-success' value='Вход в систему'/>
            </form>
          </LoginPanel>
        </div>
      </main>
    </div>
      </>);
  }
}

export default Login;
