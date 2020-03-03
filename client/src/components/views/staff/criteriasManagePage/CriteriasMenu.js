import React, {Component} from 'react';
import '../../../../style/user_main.css';
import Dropzone from 'react-dropzone';
import CriteriasTableViewer from './criteriasTableViewer';
import {fetchSendObj} from '../../../../services/fetchService';
import staffContextStore from '../../../../stores/staff/staffContextStore';

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
  };

  uploadCrits() {
    const data = new FormData();
    data.append('file', this.state.file, this.state.file.name);
    data.append('faculty', 'ПМ-ПУ');

    fetch('/api/uploadCriterias', {
      method: 'POST',
      credentials: 'include',
      body: data,
    }).then((response) => response.json())
        .then((success) => {
          console.log('CR', success);
          const st = this.state;
          st.criterias = success;
          console.log(st.criterias.schema);
          this.setState(st);
          // Do something with the successful response
        })
        .catch((error) => console.log(error),
        );
  }

  saveCrits() {
    fetchSendObj('/api/saveCriterias', {faculty: staffContextStore.faculty, crits: this.state.criterias})
        .then((success) => {
          console.log('SAVE CR', success);
          // Do something with the successful response
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
          <div style={{'display': 'flex'}}>
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
                        {this.state.criterias &&
                                            <button className="btn btn-success"
                                              onClick={this.saveCrits}>сохранить</button>}
                      </div>

                    </aside>
                  </section>

                )}
              </Dropzone>
            </div>
            <div style={{'width': '70%', 'height': '100%'}}>
              {this.state.criterias &&
                                <CriteriasTableViewer criterias={this.state.criterias.crits}
                                  schema={this.state.criterias.schema}/>}
            </div>
          </div>
        </div>
      </div>
    </main>
    );
  }
}

export default CriteriasMenu;
