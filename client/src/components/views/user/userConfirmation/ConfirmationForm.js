import React, {Component} from 'react';
import '../../../../style/user_main.css';
import BootstrapTable from "react-bootstrap-table-next";
import Modal from "react-modal";
import Dropzone from "react-dropzone";
import {fetchSendObj} from "../../../../services/fetchService";

class ConfirmationForm extends Component {
    constructor(props) {
        super(props);
        this.state = {modalIsOpen: false, confirmations: []};
        this.openModal = this.openModal.bind(this);
        this.closeModal = this.closeModal.bind(this);
        this.addConfirmation = this.addConfirmation.bind(this);

        if (props.value) {
            this.state.confirmations = props.value
        }

        this.onDrop = (file) => {
            let st = this.state;
            st.file = file[0];
            this.setState(st)
        };

        this.handleNameChange = (e) => {
            let st = this.state;
            st.Name = e.target.value;
            this.setState(st)
        };

        this.handleLinkChange = (e) => {
            let st = this.state;
            st.URL = e.target.value;
            this.setState(st)
        }
    };

    columns = [{
        dataField: 'Type',
        text: 'Тип'
    }, {
        dataField: 'Name',
        text: 'Название'
    }, {
        dataField: 'Data',
        text: '',
        formatter: (cell, row) => (<a href={row.Data} target="_blank">Ссылка</a>)
    }];

    headerContainerStyle = {
        display: "flex",
        width: "70%"
    };

    openModal(e) {
        let st = this.state;
        st.modalIsOpen = true;
        this.setState(st)
    }

    closeModal(e) {
        let st = this.state;
        st.modalIsOpen = false;
        st.Type = undefined;
        st.file = undefined;
        st.Name = undefined;
        st.URL = undefined;
        this.setState(st)
    }

    addConfirmation(e) {
        e.preventDefault();

        if (this.state.Type == 'doc') {
            let newConf = {Name: this.state.Name, Type: this.state.Type};

            let oData = new FormData();
            oData.append('file', this.state.file, this.state.file.name);
            oData.append('data', JSON.stringify(newConf));
            fetch('/api/add_file_for_confirmation', {
                method: 'post',
                body: oData
            }).then((oRes) => {
                if (oRes.status === 200) {
                    oRes.json().then((res) => {
                            let st = this.state;
                            st.confirmations.push(res);
                            this.props.updateForm(this.state.confirmations);
                            this.closeModal(null)
                        }
                    )
                } else {
                    console.log(
                        'Error ' + oRes.status + ' occurred when trying to upload your file.'
                    )
                }
            })

        } else if (this.state.Type == 'link') {
            let newConf = {Name: this.state.Name, Type: this.state.Type, Data: this.state.URL};
            fetchSendObj('/api/add_confirmation', newConf).then(((result => {
                let st = this.state;
                st.confirmations.push(result);
                this.props.updateForm(this.state.confirmations);
                this.closeModal(null)
            })))
        }


    }

    chooseType(type) {
        let st = this.state;
        st.Type = type;
        this.setState(st)
    }

    render() {
        return (
            <div>
                <div style={this.headerContainerStyle}>
                    <p>Подтверждения: </p>
                    <button className="btn btn-xs btn-success" onClick={this.openModal}><b>+</b></button>
                </div>
                <div>
                    {this.state.confirmations.length > 0 &&
                    <BootstrapTable keyField='_id' data={this.state.confirmations} columns={this.columns}/>
                    }
                </div>

                <Modal className="Modal" style={{content: {"z-index": "111"}, overlay: {"z-index": "110"}}}
                       isOpen={this.state.modalIsOpen}
                       onRequestClose={this.closeModal}
                       shouldCloseOnOverlayClick={true}
                       contentLabel="Example Modal"
                       overlayClassName="Overlay">
                    {this.state.modalIsOpen &&
                    <div>

                        <div className="block">
                            <div className="profile"
                                 style={{"display: flex; justify-content": "space-between", "margin": "0"}}>
                                <p className="headline" style={{"margin-bottom": "auto", "margin-right": "1rem"}}>
                                    Добавление подтверждения
                                </p>
                                <div style={{'margin-top': 'auto'}}>
                                    <button id="DeleteButton" className="btn btn-secondary"
                                            value="Назад" onClick={this.closeModal}>Закрыть
                                    </button>
                                </div>
                            </div>

                            <hr className="hr_blue"/>
                            <p className="desc_headline">
                                Не забудьте также приложить его к бумажной анкете
                            </p>

                            {!this.state.Type && <div>
                                <p>Выберите тип подтверждения:</p>
                                <button id="DocButton" className="btn btn-success"
                                        value="Назад" onClick={() => this.chooseType('doc')}>Документ
                                </button>
                                <button id="LinkButton" className="btn btn-success"
                                        value="Назад" onClick={() => this.chooseType('link')}>Ссылка
                                </button>
                            </div>}
                            {
                                this.state.Type == 'link' && <form>
                                    <label htmlFor="Name">Название:</label>
                                    <input id="Name" className="form-control" type="text" required
                                           onChange={this.handleNameChange}/>
                                    <label htmlFor="Link">Ссылка:</label>
                                    <input id="Link" className="form-control" type="text" required
                                           onChange={this.handleLinkChange}/>
                                    <button id="SaveButton" className="btn btn-success"
                                            value="Назад" onClick={this.addConfirmation}>Сохранить
                                    </button>
                                </form>
                            }
                            {
                                this.state.Type == 'doc' && <form>
                                    <label htmlFor="Name">Название:</label>
                                    <input id="Name" className="form-control" type="text" required
                                           onChange={this.handleNameChange}/>
                                    <label htmlFor="Link">Документ:</label>
                                    <Dropzone onDrop={this.onDrop} multiple={false}>
                                        {({getRootProps, getInputProps}) => (
                                            <section className="container">
                                                {!this.state.file &&
                                                <div {...getRootProps({className: 'dropzone'})}>
                                                    <input {...getInputProps()} />
                                                    <p>Нажмите, либо перетащите файл</p>
                                                </div>}
                                                <aside>
                                                    <ul>{this.state.file &&
                                                    <li key={this.state.file.name}>
                                                        {this.state.file.name} - {this.state.file.size / 1024 / 1024} Мб
                                                    </li>}
                                                    </ul>
                                                </aside>
                                            </section>

                                        )}
                                    </Dropzone>
                                    <button id="SaveButton" className="btn btn-success"
                                            value="Назад" onClick={this.addConfirmation}>Сохранить
                                    </button>
                                </form>
                            }
                        </div>

                    </div>
                    }
                </Modal>

            </div>

        )
    }
}

export default ConfirmationForm