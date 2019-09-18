import React, {Component} from 'react';
import '../../../../style/user_main.css';
import BootstrapTable from "react-bootstrap-table-next";
import Modal from "react-modal";
import Dropzone from "react-dropzone";
import {fetchSendObj} from "../../../../services/fetchService";
import {OverlayTrigger, Popover} from "react-bootstrap";

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
            e.preventDefault();
            e.stopPropagation();
            let st = this.state;
            st.Name = e.target.value;
            this.setState(st)
        };

        this.handleLinkChange = (e) => {
            e.preventDefault();
            e.stopPropagation();
            let st = this.state;
            st.URL = e.target.value;
            this.setState(st)
        }
    };

    types = {'link': 'Ссылка', 'doc': 'Документ', 'sz': 'Служ. записка'};
    columns = [{
        dataField: 'Type',
        text: 'Тип',
        style: {width: "10%"},
        formatter: (cell, row) => this.types[row.Type]
    }, {
        dataField: 'Data',
        text: 'Подтверждение',
        formatter: (cell, row) => (<a href={row.Data} target="_blank">{row.Name}</a>)
    }, {
        isDummyField: true,
        formatter: (cell, row) => {
            if (row.Type == 'doc')
                return <span>{(row.Size / 1024 / 1024).toFixed(2)} Мб</span>;
            if (row.Type == 'link') {

            }
            return ''
        }
    }];

    headerContainerStyle = {
        display: "flex",
        width: "70%"
    };

    openModal(e) {
        e.preventDefault();
        e.stopPropagation();
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
        e.stopPropagation();

        if (this.state.Type == 'doc') {
            if (!this.state.file || !this.state.Name) {
                return
            }
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
            if (!this.state.URL || !this.state.Name) {
                return
            }

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
        const SZNamePopover = (
            <Popover id="popover-basic">
                <Popover.Content style={{backgroundColor: "rgb(243, 243, 255)"}}>
                    Нужно указать полное название служебной записки. <br/>
                    <span style={{color: "#4d4d4d"}}>
                    Пример:<br/>
                    <i>СЗ от 22.02.2022 №21-СС-ПМ-ПУ</i> <br/>
                    </span>
                </Popover.Content>
            </Popover>
        );

        const LinkNamePopover = (
            <Popover id="popover-basic">
                <Popover.Content style={{backgroundColor: "rgb(243, 243, 255)"}}>
                    По названию ссылки должно быть понятно, что по ней можно увидеть. <br/>
                    <span style={{color: "#4d4d4d"}}>
                    Пример:<br/>
                    <i>Статья *Название* в e-library</i> <br/>
                    </span>
                </Popover.Content>
            </Popover>
        );
        return (
            <div>
                <div style={this.headerContainerStyle}>
                    <p>Подтверждения: </p>
                    <b style={{marginLeft: "2rem", color: "green", cursor: "pointer"}} onClick={this.openModal}>
                        добавить
                    </b>
                </div>

                <div>
                    {this.state.confirmations.length > 0 &&
                    <BootstrapTable keyField='_id' data={this.state.confirmations} columns={this.columns}
                                    headerClasses={["hidden"]} bordered={false}/>
                    }
                </div>

                <Modal className="Modal" style={{content: {"z-index": "111"}, overlay: {"z-index": "110"}}}
                       isOpen={this.state.modalIsOpen}
                       onRequestClose={this.closeModal}
                       shouldCloseOnOverlayClick={true}
                       contentLabel="Example Modal"
                       overlayClassName="Overlay">
                    {this.state.modalIsOpen &&
                    <div className="modalContentWrapper">

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
                                <button id="DocButton" className="btn btn-success" style={{marginRight: "1rem"}}
                                        value="Назад" onClick={() => this.chooseType('doc')}>Документ
                                </button>
                                <button id="LinkButton" className="btn btn-success" style={{marginRight: "1rem"}}
                                        value="Назад" onClick={() => this.chooseType('link')}>Ссылка
                                </button>
                                <button id="LinkButton" className="btn btn-success"
                                        value="Назад" onClick={() => this.chooseType('sz')}>Служ. записка
                                </button>
                            </div>}
                            {
                                this.state.Type == 'link' && <form>
                                    <label htmlFor="Name"><span className="redText">*</span>Название:
                                        <OverlayTrigger trigger={['click', 'focus']} placement="bottom"
                                                        overlay={LinkNamePopover}>
                                            <i className={"fas fa-question-circle"}
                                               style={{cursor: "pointer", marginLeft: "0.3rem", marginTop: "0px"}}
                                               onClick={(e) => {
                                                   e.preventDefault()
                                               }}/>
                                        </OverlayTrigger></label>
                                    <input id="Name" className="form-control" type="text" required
                                           onChange={this.handleNameChange} autoFocus={true}/>
                                    <label htmlFor="Link"><span className="redText">*</span>Ссылка:</label>
                                    <input id="Link" className="form-control" type="text" required
                                           onChange={this.handleLinkChange}/>
                                    <input id="SaveButton" className="btn btn-success" type="button" value="Сохранить"
                                           onClick={this.addConfirmation}
                                           disabled={!(this.state.URL && this.state.Name)}/>
                                </form>
                            }
                            {
                                this.state.Type == 'sz' && <form>
                                    <label htmlFor="Name"><span className="redText">*</span>Название служебной записки:
                                        <OverlayTrigger trigger={['click', 'focus']} placement="bottom"
                                                        overlay={SZNamePopover}>
                                            <i className={"fas fa-question-circle"}
                                               style={{cursor: "pointer", marginLeft: "0.3rem", marginTop: "0px"}}
                                               onClick={(e) => {
                                                   e.preventDefault()
                                               }}/>
                                        </OverlayTrigger></label>
                                    <input id="Name" className="form-control" type="text" required
                                           onChange={this.handleSZNameChange} autoFocus={true}/>
                                    <label htmlFor="Link">Приложение:</label>
                                    <input id="Link" className="form-control" type="text" required
                                           onChange={this.handleSZAppendixChange}/>
                                    <label htmlFor="Link">Пункт:</label>
                                    <input id="Link" className="form-control" type="text" required
                                           onChange={this.handleSZParagraphChange}/>
                                    <input id="SaveButton" className="btn btn-success" type="button" value="Сохранить"
                                           onClick={this.addConfirmation}
                                           disabled={!(this.state.URL && this.state.Name)}/>
                                </form>
                            }
                            {
                                this.state.Type == 'doc' && <form onSubmit={e => {
                                    e.preventDefault();
                                }}>
                                    <label htmlFor="Name"><span className="redText">*</span>Название:</label>
                                    <input id="Name" className="form-control" type="text" required autoFocus={true}
                                           onChange={this.handleNameChange}/>
                                    <label htmlFor="Link"><span className="redText">*</span>Документ:</label>
                                    <Dropzone onDrop={this.onDrop} multiple={false}>
                                        {({getRootProps, getInputProps}) => (
                                            <section>
                                                {!this.state.file &&
                                                <div {...getRootProps({className: 'dropzone'})}
                                                     style={{"backgroundColor": "white"}}>
                                                    <input {...getInputProps()} />
                                                    <p>Нажмите, либо перетащите файл</p>
                                                    <p style={{fontSize: "small", color: "#4f4f4f"}}>Максимальный
                                                        размер: 50 Мб</p>
                                                </div>}
                                                <aside>
                                                    <ul>{this.state.file && <div>
                                                        <table className="table-borderless">
                                                            <tr>
                                                                <td>
                                                                    <div style={{
                                                                        marginRight: "2rem",
                                                                        maxWidth: "300px",
                                                                        wordWrap: "break-word"
                                                                    }}>
                                                                        {this.state.file.name}
                                                                    </div>
                                                                </td>
                                                                <td style={{color: "#434343"}}>
                                                                    {(this.state.file.size / 1024 / 1024).toFixed(2)} Мб
                                                                </td>
                                                            </tr>
                                                        </table>
                                                        {Math.ceil(this.state.file.size / 1024 / 1024) > 50 &&
                                                        <span className="redText">Размер файла превышает 50 Мб</span>}
                                                    </div>}
                                                    </ul>
                                                </aside>
                                            </section>

                                        )}
                                    </Dropzone>
                                    <button id="SaveButton" className="btn btn-success"
                                            disabled={!(this.state.Name && this.state.file) ||
                                            Math.ceil(this.state.file.size / 1024 / 1024) > 50}
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