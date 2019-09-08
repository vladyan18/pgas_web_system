import React, {Component} from 'react';
import '../../../../style/user_main.css';
import Dropzone from 'react-dropzone';
import CriteriasTableViewer from "./criteriasTableViewer";

class CriteriasMenu extends Component {
    constructor(props) {
        super(props);
        this.state = {};
        this.onDrop = (file) => {
            let st = this.state;
            st.file = file[0];
            this.setState(st)
        };
        this.uploadCrits = this.uploadCrits.bind(this)
    };

    uploadCrits() {
        let data = new FormData();
        data.append('file', this.state.file, this.state.file.name);

        fetch('/api/uploadCriterias', {
            method: 'POST',
            credentials: "include",
            body: data,
        }).then(response => response.json())
            .then(success => {
                console.log('CR', success);
                let st = this.state;
                st.criterias = success;
                console.log(st.criterias.schema);
                this.setState(st)
                // Do something with the successful response

            })
            .catch(error => console.log(error)
            );
    }

    render() {

        return (<main>
                <div id="panel" className="row justify_center">
                    <div className="col-9 general">
                        <div className="profile" style={{"display": "flex", "justify-content": "space-between"}}>
                            <div className="centered_ver">
                                <p className="headline">
                                    Управление критериями
                                </p>
                            </div>
                        </div>
                        <hr className="hr_blue"/>
                        <div style={{"display": "flex"}}>
                            <div style={{"width": "30%"}}>
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
                                        <button className="btn btn-warning" onClick={this.uploadCrits}>загрузить
                                        </button>
                                    </aside>
                                </section>

                            )}
                        </Dropzone>
                            </div>
                            <div style={{"width": "70%", "height": "100%"}}>
                                {this.state.criterias &&
                                <CriteriasTableViewer criterias={this.state.criterias.crits}
                                                      schema={this.state.criterias.schema}/>}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        )
    }
}

export default CriteriasMenu