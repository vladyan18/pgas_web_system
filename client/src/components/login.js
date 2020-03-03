import React, {Component} from 'react';
import logoBss from '../img/logo_bss2.png';
import lock from '../img/lock.png';
import {BASE_API_URL} from '../common/constants';
import {fetchGet, fetchSendObj, fetchSendWithoutRes} from "../services/fetchService";

class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      password: '',
    };
    this.doLogin = this.doLogin.bind(this);
  };

  async doLogin(e) {
    e.preventDefault();
    let result = await fetchSendWithoutRes('/login', {username: this.state.username, password: this.state.password})

    if (result) {
      window.location.replace('/home');
    } else {
      this.setState({error: true})
    }
  }

  render() {
    return (<div className="container-fluid">
      <header>
        <div className="row page_top">
          <div className="col-12 block_header">
            <img src={logoBss} className="logo_img" style={{height: '30px'}} alt={'login'}/>
            <div className="p_header">Студенческий совет СПбГУ <br/>
                                    Вход в систему ПГАС </div>

          </div>
        </div>

      </header>


      <main>
        <div className="row background_main">
          <div className="col-xl-4 col-lg-3 col-md-2 col-sm-2 col-1"/>
          <div className="col-xl-4 col-lg-6 col-md-8 col-sm-8 col-10 login">
            <img src={lock} className="pic_lock" alt={'login'}/>
            <div className="title_text">Вход в систему ПГАС</div>
            <div className="header_logo_text">Для входа необходимо использовать единый логин (st******)</div>

            <form id = 'login' method ='post' onSubmit={this.doLogin}>
              <label id='name'>Имя пользователя</label><br/>
              <input type='text' id='name' name = 'username' className={"form-control" + (this.state.error ? ' is-invalid': '')} required
              onChange={(e) => this.setState({username: e.target.value, error: undefined})}/><br/>
              <label id='password'>Пароль</label><br/>
              <input type='password' id='password' name = 'password' className={"form-control " + (this.state.error ? ' is-invalid': '')} required={true}
                     onChange={(e) => this.setState({password: e.target.value, error: undefined})}/><br/>
              <input type='submit' className='button btn btn-success' value='Вход в систему'/>
            </form>
          </div>
          <div className="col-xl-4 col-lg-3 col-md-2 col-sm-2 col-1"/>
        </div>
      </main>
    </div>);
  }
}

export default Login;
