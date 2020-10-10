import React, {Component} from 'react';
import '../../../style/user_main.css';
import Dropzone from 'react-dropzone';
import CriteriasTableViewer from './criteriasTableViewer';
import {fetchSendWithoutRes} from '../../../services/fetchService';
import staffContextStore from '../../../stores/staff/staffContextStore';

class CriteriasMenu extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.onDrop = (file) => {
      const st = this.state;
      st.file = file[0];
      this.setState(st);
    };
    this.uploadCrits = this.uploadCrits.bind(this);
    this.saveCrits = this.saveCrits.bind(this);
  }

  uploadCrits() {
    const data = new FormData();
    data.append('file', this.state.file, this.state.file.name);
    data.append('faculty', staffContextStore.faculty);

    fetch('/api/uploadCriterias', {
      method: 'POST',
      credentials: 'include',
      body: data,
    }).then((response) => response.json())
        .then((success) => {
          const st = {};
          st.criterias = success.criterias;
          st.differences = success.differences;
          st.notSure = success.notSure;
          st.incorrectAchievements = success.incorrectAchievements;
          console.log(st.criterias.schema);
          this.setState(st);
          // Do something with the successful response
        })
        .catch((error) => console.log(error),
        );
  }

  saveCrits() {
    fetchSendWithoutRes('/api/saveCriterias', {faculty: staffContextStore.faculty, crits: this.state.criterias})
        .then((success) => {
          console.log('SAVE CR', success);
          this.props.history.goBack();
        })
        .catch((error) => console.log(error),
        );
  }

  render() {
    return (<main>
      <div id="panel" className="row justify_center">
        <div className="col-9 general">
          <div className="profile" style={{'display': 'flex', 'justify-content': 'space-between'}}>
            <div className="centered_ver">
              <p className="headline">
                                    Управление критериями
              </p>
            </div>
            <div className="centered_ver">
              <button id="DeleteButton" className="btn btn-secondary"
                value="Назад" onClick={() => {
                  this.props.history.goBack();
                }}>Назад
              </button>
            </div>
          </div>
          <hr className="hr_blue"/>
          <div>
            <div style={{'width': '30%'}}>
              <Dropzone onDrop={this.onDrop} multiple={false}>
                {({getRootProps, getInputProps}) => (
                  <section className="container">
                    <div {...getRootProps({className: 'dropzone'})}>
                      <input {...getInputProps()} />
                      <p>Нажмите или перетащите файл с критериями</p>
                    </div>
                    <aside>
                      <ul>{this.state.file &&
                                        <li key={this.state.file.name}>
                                          {this.state.file.name} - {this.state.file.size} bytes
                                        </li>}
                      </ul>
                      <div style={{
                        'display': 'flex',
                        'justifyContent': 'space-between',
                        'width': '100%',
                      }}>
                        <button className="btn btn-warning" onClick={this.uploadCrits}>загрузить
                        </button>

                      </div>

                    </aside>
                  </section>

                )}
              </Dropzone>
            </div>
            {this.state.differences && <div style={{marginTop: '3rem'}}>
            <h2>Несовпадения в критериях: {this.state.differences.length}</h2>
            <table className="table table-light">
              <thead>
              <tr><th>Ключ</th><th>Причина</th><th style={{textAlign: 'right'}}>Путь</th></tr>
              </thead>
              <tbody>
              {this.state.differences.map((x) => <tr style={{width: '100%'}}>
                <td>'{x.key}'</td>
                <td style={{textAlign: 'center', color: x.reason === 'added' ? 'green' : 'red'}}>{x.reason}</td>
                <td style={{textAlign: 'right'}}><span style={{fontSize: 'small'}}>{x.path}</span></td></tr>)}
              </tbody>
            </table></div>}

              {!!this.state.notSure && <div style={{marginTop: '3rem'}}><h2>Нужно дополнительно проверить: <span style={{color: 'yellow'}}>{this.state.notSure}</span></h2></div>}

            {this.state.incorrectAchievements && <div style={{marginTop: '3rem'}}>
              <h2>Некорректные достижения у пользователей: {this.state.incorrectAchievements.length}</h2>
              <table className="table table-light">
                <thead>
                <tr><th>Студент</th><th>Некорректно:</th></tr>
                </thead>
                <tbody>
                {this.state.incorrectAchievements.map((x) => <tr style={{width: '100%'}}>
                  <td>{x.user}</td>
                  <td style={{textAlign: 'left'}}>{(() => {
                    let str = '';
                    for (let i = 0; i < x.oldChars.length; i++) {
                        if (x.incorrectChars.includes(x.oldChars[i])) break;
                        str += '\'' + x.oldChars[i] + '\'' + ', ';
                    }
                    return str;
                  })()
                  } {(() => {
                    let str = '';
                    for (let i = 0; i < x.incorrectChars.length; i++) {
                      str += '\'' + x.incorrectChars[i] + '\'' + ', ';
                    }
                    return <span style={{color: 'red'}}>{str}</span>;
                  })()}</td></tr>)}
                </tbody>
              </table></div>}


            <div style={{'width': '70%', 'height': '100%', 'marginTop': '3rem'}}>
              {this.state.criterias &&
                                <CriteriasTableViewer criterias={this.state.criterias.crits}
                                  schema={this.state.criterias.schema} limits={this.state.criterias.limits}/>}
            </div>
            {this.state.criterias &&
            <button className="btn btn-success"
                    onClick={this.saveCrits}>Сохранить</button>}
          </div>
        </div>
      </div>
    </main>
    );
  }
}

export default CriteriasMenu;
