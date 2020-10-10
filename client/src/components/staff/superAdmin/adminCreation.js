import React, {Component} from 'react';
import '../../../style/user_main.css';
import {withRouter} from 'react-router-dom';
import {fetchSendObj} from '../../../services/fetchService';

class AdminCreation extends Component {
  constructor(props) {
    super(props);
    this.state = {
      LastName: '',
      FirstName: '',
      Patronymic: '',
      id: '',
      Rights: [],
      Faculty: '',
      Role: 'Admin',
      isRightsValid: true,
    };

    this.handleLastNameChange = (e) => {
      const st = this.state;
      st.LastName = e.target.value;
      this.setState(st);
    };

    this.handleFirstNameChange = (e) => {
      const st = this.state;
      st.FirstName = e.target.value;
      this.setState(st);
    };

    this.handlePatronymicChange = (e) => {
      const st = this.state;
      st.Patronymic = e.target.value;
      this.setState(st);
    };

    this.handleIdChange = (e) => {
      const st = this.state;
      st.id = e.target.value;
      this.setState(st);
    };

    this.handleFacultyChange = (e) => {
      const st = this.state;
      if (e.target.value === '') st.Faculty = undefined;
      else st.Faculty = e.target.value;
      this.setState(st);
    };

    this.handleRightsSelect = (e) => {
      const st = this.state;
      st.Rights.push(e.target.value);
      st.isRightsValid = true;
      this.setState(st);
      e.preventDefault();
    };

    this.handleRoleSelect = (e) => {
      const st = this.state;
      st.Role = e.target.value;
      this.setState(st);
      e.preventDefault();
    };

    this.removeRight = (right) => {
      const st = this.state;
      const index = st.Rights.indexOf(right);
      if (index != -1) {
        st.Rights.splice(st.Rights.indexOf(right), 1);
      }
      this.setState(st);
    };


    this.validateRights = (e) => {
      if (this.state.Rights.length === 0) {
        const st = this.state;
        st.isRightsValid = false;
        this.setState(st);
      }
    };

    this.handleSubmit = (e) => {
      e.preventDefault();
      if (this.state.isRightsValid) {
        const newAdmin = {
          LastName: this.state.LastName,
          FirstName: this.state.FirstName,
          Patronymic: this.state.Patronymic,
          Faculty: this.state.Faculty,
          Rights: this.state.Rights,
          Role: this.state.Role,
          id: this.state.id.toLowerCase(),
        };

        fetchSendObj('/api/createAdmin', newAdmin).then((result) => {
          if (result.ok) this.props.history.push('/staff/');
        }).catch((reason) => console.log('ERROR', reason));
      }
    };
  };


  render() {
    return (
      <main>
        <div id="panel" className="row" style={{'justifyContent': 'center', 'display': 'flex'}}>

          <div className="menu">
            <p className="headline">
                            Создание нового администратора
            </p>
            <hr className="hr_blue"/>
            <div className="container">
              <form onSubmit={this.handleSubmit}>
                <div className="form-group">
                  <label htmlFor="nameInput"><span className="redText">*</span>Фамилия:</label>
                  <input id="nameInput" className="form-control" type="text" name="name" required
                    value={this.state.LastName} onChange={this.handleLastNameChange}/>

                  <label htmlFor="officialNameInput"><span className="redText">*</span>Имя:</label>
                  <input id="officialNameInput" className="form-control" type="text" required
                    name="officialName" value={this.state.FirstName}
                    onChange={this.handleFirstNameChange}/>

                  <label htmlFor="dirNameInput">Отчество:</label>
                  <input id="dirNameInput" className="form-control" type="text" name="dirName"
                    value={this.state.Patronymic} onChange={this.handlePatronymicChange}/>

                  <label htmlFor="IdInput"><span className="redText">*</span>Идентификатор:</label>
                  <input id="IdInput" className="form-control" type="text" name="dirName" required
                    value={this.state.id} onChange={this.handleIdChange}/>

                  <label htmlFor="FacultyInput">Факультет:</label>
                  <select id='FacultyInput' className="form-control" name="check2"
                    defaultValue={''} onChange={this.handleFacultyChange}>
                    <option value="" style={{'color': 'red'}}>-</option>
                    {this.props.facultiesList.map((fac) => {
                      return <option key={fac} value={fac}>{fac}</option>;
                    })}
                  </select>

                  <label htmlFor="RoleInput">Роль:</label>
                  <select id='RoleInput' className="form-control" name="check2"
                    defaultValue={'Admin'} onChange={this.handleRoleSelect}>
                    <option value="Admin">Администратор</option>
                    <option value="SuperAdmin">СуперАдминистратор</option>
                  </select>

                  <label htmlFor="RightsInput"><span className="redText">*</span>Права:</label>
                  <div id="RightsInput">
                    <div style={{'display': 'flex', 'flexWrap': 'wrap', 'width': '20rem'}}>
                      {this.state.Rights.map((right) => {
                        return <div className="btn-xs btn-dark tag"
                          onClick={(e) => this.removeRight(right)}>{right}</div>;
                      })}
                    </div>
                    <select id='RightsSelect'
                      className={'form-control' + (this.state.isRightsValid ? '' : ' is-invalid')}
                      name="check2"
                      defaultValue={''} value="" onChange={this.handleRightsSelect}>
                      <option value="" disabled>Выберите факультет</option>
                      {this.props.facultiesList.filter((x) => (this.state.Rights.indexOf(x) == -1)).map((fac) => {
                        return <option key={fac + 'r'} value={fac}>{fac}</option>;
                      })}
                    </select>
                  </div>
                  <div style={{'width': '100%', 'display': 'flex', 'justifyContent': 'end'}}>
                    <input className="btn btn-primary" type="submit" value="Создать"
                      style={{'marginTop': '1rem'}} onClick={this.validateRights}/>
                  </div>
                </div>
              </form>

            </div>
          </div>

        </div>
      </main>
    );
  }
}

export default withRouter(AdminCreation);
