import React, {Component} from 'react';
import '../../../../style/user_main.css';
import Dropzone from 'react-dropzone';

class CriteriasMenu extends Component {
    constructor(props) {
        super(props);
        this.state = {};
        this.onDrop = (file) => {
            this.setState({file: file[0]})
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
                        <Dropzone onDrop={this.onDrop} multiple={false}>
                            {({getRootProps, getInputProps}) => (
                                <section className="container">
                                    <div {...getRootProps({className: 'dropzone'})}>
                                        <input {...getInputProps()} />
                                        <p>Drag 'n' drop some files here, or click to select files</p>
                                    </div>
                                    <aside>
                                        <p>Files</p>
                                        <ul>{this.state.file &&
                                        <li key={this.state.file.name}>
                                            {this.state.file.name} - {this.state.file.size} bytes
                                        </li>}
                                        </ul>
                                    </aside>
                                </section>
                            )}
                        </Dropzone>
                        <button className="btn-warning" onClick={this.uploadCrits}>загрузить</button>
                    </div>
                </div>
            </main>
        )
    }
}

export default CriteriasMenu