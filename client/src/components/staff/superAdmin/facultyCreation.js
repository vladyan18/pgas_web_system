import React, {Component} from 'react';
import '../../../style/user_main.css';
import {withRouter} from 'react-router-dom';

class FacultyCreation extends Component {
  constructor(props) {
    super(props);
    this.state = {name: '', officialName: '', dirName: ''};

    this.handleNameChange = (e) => {
      const st = this.state;
      st.name = e.target.value;
      this.setState(st);
    };

    this.handleOfficialNameChange = (e) => {
      const st = this.state;
      st.officialName = e.target.value;
      this.setState(st);
    };

    this.handleDirChange = (e) => {
      const st = this.state;
      st.dirName = e.target.value;
      this.setState(st);
    };

    this.handleSubmit = (e) => {
      e.preventDefault();
      const faculty = {Name: this.state.name, OfficialName: this.state.officialName, DirName: this.state.dirName};
      fetch('/api/createFaculty', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(faculty),
      }).then((oRes) => {
        if (oRes.status === 200) {
          this.props.history.push('/staff/');
        } else {
          console.log(
              'Error ' + oRes.status + ' occurred when trying to upload your file.',
          );
        }
      });
    };
  }


  render() {
    return (
      <main>
        <div id="panel" className="row" style={{'justifyContent': 'center', 'display': 'flex'}}>

          <div className="menu">
            <p className="headline">
                            Создание факультета
            </p>
            <hr className="hr_blue"/>
            <div className="container">
              <form onSubmit={this.handleSubmit}>
                <div className="form-group">
                  <label htmlFor="nameInput">Название:</label>
                  <input id="nameInput" className="form-control" type="text" name="name"
                    value={this.state.name} onChange={this.handleNameChange}/>

                  <label htmlFor="officialNameInput">Официальное название:</label>
                  <input id="officialNameInput" className="form-control" type="text"
                    name="officialName" value={this.state.officialName}
                    onChange={this.handleOfficialNameChange}/>

                  <label htmlFor="dirNameInput">Название направления:</label>
                  <input id="dirNameInput" className="form-control" type="text" name="dirName"
                    value={this.state.dirName} onChange={this.handleDirChange}/>
                  <div style={{'width': '100%', 'display': 'flex', 'justifyContent': 'end'}}>
                    <input className="btn btn-primary" type="submit" value="Создать"
                      style={{'marginTop': '1rem'}}/>
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

export default withRouter(FacultyCreation);
