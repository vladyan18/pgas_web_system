import React, {Component} from 'react';
import '../../../../style/user_main.css';
import BootstrapTable from "react-bootstrap-table-next";
import Modal from "react-modal";
import Dropzone from "react-dropzone";
import {fetchGet, fetchSendObj, fetchSendWithoutRes} from "../../../../services/fetchService";
import {OverlayTrigger, Popover} from "react-bootstrap";
import HelpButton from "../helpButton";
import EditConfirmation from "./editConfirmation";

class ConfirmationForm extends Component {
    constructor(props) {
        super(props);
        this.state = {modalIsOpen: false, confirmations: []};
        this.openModal = this.openModal.bind(this);
        this.closeModal = this.closeModal.bind(this);
        this.addConfirmation = this.addConfirmation.bind(this);
        this.addExistingConfirmation = this.addExistingConfirmation.bind(this);
        this.closeEditingModal = this.closeEditingModal.bind(this);

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

        this.saveResult = (e, confirmation) => {
            e.preventDefault();
            e.stopPropagation();
            let st = this.state;
            st.confirmations.push(confirmation);
            this.setState(st, () => {
                this.props.updateForm(this.state.confirmations);
                this.closeModal(null);
            })
        };

        this.handleLinkChange = (e) => {
            e.preventDefault();
            e.stopPropagation();
            let st = this.state;
            st.URL = e.target.value;
            this.setState(st)
        };

        this.handleSZNameChange = (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.setState({Name: e.target.value})
        };

        this.handleSZAppendixChange = (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.setState({SZAppendix: e.target.value})
        };

        this.handleSZParagraphChange = (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.setState({SZParagraph: e.target.value})
        };

        this.handleAdditionalInfoChange = (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.setState({additionalInfo: e.target.value})
        };

        this.openExisting = (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.setState({existingOpened: true, sameFilesLoaded: undefined})
        }
    };

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.props.value && this.props.value !== this.state.confirmations) {
            this.setState({confirmations: this.props.value});
        }
    }

    async componentDidMount() {
        let commonConfirms = await fetchGet('/api/getConfirmations', {});

        for (let conf of commonConfirms) {
            if (conf.Type == 'SZ') {
                commonConfirms.splice(commonConfirms.indexOf(conf), 1)
            }
        }
        this.setState({commonConfirms: commonConfirms})
    }

    types = {'link': 'Ссылка', 'doc': 'Документ', 'SZ': 'Служ. записка'};
    columns = [{
        dataField: 'Type',
        text: 'Тип',
        style: {width: "10%", fontSize: "small"},
        formatter: (cell, row) => {
            if (row.Type == 'link') {
                if (row.Data.startsWith('https://elibrary.ru/item.asp?id=') || row.Data.startsWith('elibrary.ru/item.asp?id=')) {
                    return 'e-library'
                }
            }
            return this.types[row.Type]
        }
    }, {
        dataField: 'Data',
        text: 'Подтверждение',
        style: {width: "40%", overflow:"hidden"},
        formatter: (cell, row) => {
            if (row.Type == 'SZ') {
                return (<div style={{fontSize: "small"}}>{row.Name}
                    {row.SZ ? (row.SZ.Appendix ? ', прил. ' + row.SZ.Appendix : '') : ''}
                    {row.SZ ? (row.SZ.Paragraph ? ', п. ' + row.SZ.Paragraph : '') : ''}
                </div>)
            } else return (<div style={{overflow:"hidden", textOverflow: "ellipsis", maxWidth:"18rem", fontSize: "small"}}>
                <a href={row.Data} onClick={(e) => e.stopPropagation()} target="_blank">{row.Name}</a>
                <br/>{row.additionalInfo}</div>)
        }
    }, {
        isDummyField: true,
        formatter: (cell, row) => {
            if (row.Type == 'doc')
                return <span>{(row.Size / 1024 / 1024).toFixed(2)} Мб</span>;
            if (row.Type == 'link') {
                if (row.Data.startsWith('https://elibrary.ru/item.asp?id=') || row.Data.startsWith('elibrary.ru/item.asp?id=')) {
                    if (row.CrawlResult) {
                        return (
                            <div style={{display: "flex", justifyContent: "space-between", fontSize: "x-small"}}>
                                {row.CrawlResult.title ? <div style={{maxWidth: "10rem", fontSize: "xx-small"}}>
                                    <div>"{row.CrawlResult.title.toLowerCase()}"</div>
                                    <div><i>{row.CrawlResult.magazine ? row.CrawlResult.magazine.toLowerCase() : ''}</i>
                                    </div>
                                </div> : ''}
                                <div style={{width: "100%", marginLeft: "0.5rem"}}>
                                    <div style={{display: "flex", justifyContent: "space-between"}}>
                                        {row.CrawlResult.inRINC ?
                                            <div className="greenText">В РИНЦе <i className="fa fa-check"/></div> :
                                            <div className="redText">Не в РИНЦе<i className="fa fa-times"/></div>}
                                        {row.CrawlResult.isAuthor ?
                                            <div className="greenText">Указан в авторах <i className="fa fa-check"/>
                                            </div> :
                                            <div className="redText">Не указан в авторах<i className="fa fa-times"/>
                                            </div>}
                                    </div>
                                    {row.CrawlResult.year ? <div style={{fontSize: 'small', merginTop: '0.5rem'}}>
                                        <b>Год: {row.CrawlResult.year}</b></div> : ''}
                                </div>
                            </div>


                        )
                    } else return (<div style={{color: "#505050"}}>Нет информации из e-library</div>)
                }
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
        st.existingOpened = false;
        st.existingConfirm = false;
        st.existingSelected = false;
        st.additionalInfo = undefined;
        st.Type = undefined;
        st.file = undefined;
        st.Name = undefined;
        st.URL = undefined;
        st.isLoading = false;
        st.sameFilesLoaded = undefined;
        st.loadedFile = undefined;
        this.setState(st)
    }

    closeEditingModal(e) {
        let st = this.state;
        st.isEditing = false;
        st.editingConfirmation = undefined;
        this.setState(st)
    }

    addExistingConfirmation(e) {
        e.preventDefault();
        e.stopPropagation();

        if (this.state.loadedFile) {
            fetchSendWithoutRes('/delete_confirmation', {id: this.state.loadedFile._id}).then();
        }
        let ex = this.state.existingConfirm;
        let st = this.state;
        ex.additionalInfo = this.state.additionalInfo;
        st.sameFilesLoaded = undefined;
        st.loadedFile = undefined;
        st.confirmations.push(ex);
        this.setState(st, () => {
            this.props.updateForm(this.state.confirmations);
        });
        this.closeModal(null)

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
            let prom = fetch('/api/add_file_for_confirmation', {
                method: 'post',
                body: oData
            });
            this.setState({isLoading: true});

            prom.then((oRes) => {
                if (oRes.status === 200) {
                    oRes.json().then(({result, sameFiles}) => {
                            this.setState({isLoading: false});
                            result.additionalInfo = this.state.additionalInfo;
                            if (sameFiles) {
                                this.setState({sameFilesLoaded: sameFiles, Type: undefined, loadedFile: result});
                            } else {
                                let st = this.state;
                                if (!st.confirmations) {
                                    st.confirmations = [];
                                }
                                st.confirmations.push(result);
                                this.setState(st, () => {
                                    this.props.updateForm(this.state.confirmations);
                                });
                                this.closeModal(null)
                            }
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
                if (!st.confirmations) {
                    st.confirmations = [];
                }
                result.additionalInfo = this.state.additionalInfo;
                st.confirmations.push(result);
                this.setState(st, () => {
                    this.props.updateForm(this.state.confirmations);
                });

                this.closeModal(null)
            })))
        } else if (this.state.Type == 'SZ') {

            if (!this.state.Name) {
                return
            }

            let newConf = {Name: this.state.Name, Type: this.state.Type};
            newConf.SZ = {Appendix: this.state.SZAppendix, Paragraph: this.state.SZParagraph};
            fetchSendObj('/api/add_confirmation', newConf).then(((result => {
                let st = this.state;
                if (!st.confirmations) {
                    st.confirmations = [];
                }
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

        const AddInfoPopover = (
            <Popover id="popover-basic">
                <Popover.Content style={{backgroundColor: "rgb(243, 243, 255)"}}>
                    В этом поле стоит указать информацию, которая поможет проверяющим понять, на что смотреть в
                    подтверждении, если это необходимо.
                    Если у проверяющих возникнут проблемы, вам придется идти на апелляцию.<br/>
                    <span style={{color: "#4d4d4d"}}>
                    Примеры:<br/>
                    <i>- п. 6</i><br/>
                    <i>- пункты 1-2</i><br/>
                    <i>- п.п 1.а</i><br/>
                    </span>
                </Popover.Content>
            </Popover>
        );

        const AddInfoHelp = (
            <HelpButton  overlay={AddInfoPopover} placement={"top"} />);

        const deleteConfirmation = (e, confirmation) => {
            let confirmations = this.state.confirmations;
            confirmations.splice(confirmations.indexOf(confirmation), 1)
            this.props.updateForm(confirmations);
            //this.setState({confirmations: confirmations})
        };

        const saveConfirmation = (confirmation) => {
            if (confirmation) {
                let confirmations = this.state.confirmations;
                const index = confirmations.findIndex((x) => (x._id === this.state.editingConfirmation._id));
                console.log(index, confirmations);
                confirmations[index] = Object.assign({}, confirmations[index], confirmation);
                console.log(confirmations[index]);
                this.props.updateForm(confirmations);
                this.setState({confirmations: [...confirmations]});
            }
            this.closeEditingModal();
        }

        const editConfirmation = (e, confirmation) => {
            e.stopPropagation();
            e.preventDefault();
            this.setState({isEditing: true, editingConfirmation: confirmation});
        };

        let columns = this.columns.concat([
            {
                isDummyField: true,
                style: {textAlign: "right"},
                formatter: (cell, row) => (<>{!this.props.disabled &&
                    <div style={{display: "flex", justifyContent: "right"}}>
                        <button onClick={(e) => editConfirmation(e, row)}
                            style={
                                {
                                    cursor: "pointer",
                                    marginLeft: "0.3rem",
                                    marginRight: "1rem",
                                    marginTop: "0px",
                                    border:'none',
                                    padding: 0,
                                    backgroundColor: 'transparent',
                                    outline: 'none',
                                    color: "orange",
                                    fontSize: "1rem"
                                }}><i className="fa fa-edit"/>
                        </button>
                <button
                    onClick={(e) => deleteConfirmation(e, row)}
                                                  style={
                                                      {
                                                          cursor: "pointer",
                                                          marginLeft: "0.3rem",
                                                          marginTop: "2px",
                                                          border:'none',
                                                          padding: 0,
                                                          backgroundColor: 'transparent',
                                                          outline: 'none',
                                                          color: "red",
                                                          fontSize: "1.1rem"
                                                      }}><i className="fa fa-times"/>
                </button>
                    </div>}</>)
            }
        ]);

        return (
            <div>
                <div style={this.headerContainerStyle}>
                    <p>Подтверждения: </p>
                    { <b style={{marginLeft: "2rem", color: "green", cursor: "pointer"}} onClick={this.openModal} >
                        добавить
                    </b>}
                </div>

                <div>
                    {this.state.confirmations && this.state.confirmations.length > 0 &&
                    <BootstrapTable keyField='_id' data={this.state.confirmations} columns={columns}
                                    headerClasses={["hidden"]} bordered={false}/>
                    }
                </div>

                <Modal className="Modal" style={{content: {"z-index": "111"}, overlay: {"z-index": "110"}}}
                       isOpen={this.state.modalIsOpen}
                       onRequestClose={this.closeModal}
                       shouldCloseOnOverlayClick={true}
                       contentLabel="Example Modal"
                       overlayClassName="Overlay">
                    <>
                        {this.state.isLoading &&
                        <div style={{backGroundColor: "#e2e2e2", padding: "3rem"}}>
                            <div id="floatingCirclesG">
                                <div className="f_circleG" id="frotateG_01"></div>
                                <div className="f_circleG" id="frotateG_02"></div>
                                <div className="f_circleG" id="frotateG_03"></div>
                                <div className="f_circleG" id="frotateG_04"></div>
                                <div className="f_circleG" id="frotateG_05"></div>
                                <div className="f_circleG" id="frotateG_06"></div>
                                <div className="f_circleG" id="frotateG_07"></div>
                                <div className="f_circleG" id="frotateG_08"></div>
                            </div>
                        </div>}
                        {(this.state.modalIsOpen && !this.state.isLoading) &&
                        <div className="modalContentWrapper" style={{maxHeight: "40rem", maxWidth: "100vw",}}>

                            <div className="block"
                                 style={{maxHeight: "inherit", maxWidth: "inherit", overflow: "auto"}}>
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

                                {(!this.state.Type && !this.state.existingOpened && !this.state.sameFilesLoaded) && <div>
                                    <p>Выберите существующее подтверждение:</p>
                                    <div style={{display: "flex", justifyContent: "center"}}>
                                        <button id="DocButton" className="btn btn-primary"
                                                style={{margin: "0", width: "50%"}}
                                                value="Назад" onClick={this.openExisting}>Открыть
                                        </button>
                                    </div>
                                    <p style={{marginTop: "1rem"}}>Или создайте новое:</p>
                                    <div style={{display: "flex", justifyContent: "center"}}>
                                <button id="DocButton" className="btn btn-success" style={{marginRight: "1rem"}}
                                        value="Назад" onClick={() => this.chooseType('doc')}>Документ
                                </button>
                                <button id="LinkButton" className="btn btn-success" style={{marginRight: "1rem"}}
                                        value="Назад" onClick={() => this.chooseType('link')}>Ссылка
                                </button>
                                <button id="LinkButton" className="btn btn-success"
                                        value="Назад" onClick={() => this.chooseType('SZ')}>Служ. записка
                                </button>
                                    </div>
                            </div>}
                            {
                                this.state.Type == 'link' && <form>
                                    <label htmlFor="Name"><span className="redText">*</span>Название:
                                        <HelpButton  overlay={LinkNamePopover} placement={"top"} />
                                    </label>
                                    <input id="Name" className="form-control" type="text" required autoComplete={'off'}
                                           onChange={this.handleNameChange} autoFocus={true}/>
                                    <label htmlFor="Link"><span className="redText">*</span>Ссылка:</label>
                                    <input id="Link" className="form-control" type="text" required
                                           onChange={this.handleLinkChange} autoComplete={'off'}/>
                                    <label htmlFor="AddInfo">Дополнительная информация:
                                        <HelpButton  overlay={AddInfoPopover} placement={"top"} />
                                    </label>
                                    <input id="AddInfo" className="form-control" type="text" required
                                           onChange={this.handleAdditionalInfoChange} autoComplete={'off'}/>
                                    <input id="SaveButton" className="btn btn-success" type="button" value="Сохранить"
                                           onClick={this.addConfirmation}
                                           disabled={!(this.state.URL && this.state.Name)}/>
                                </form>
                            }
                            {
                                this.state.Type == 'SZ' && <form>
                                    <label htmlFor="Name"><span className="redText">*</span>Название служебной записки:
                                        <HelpButton  overlay={SZNamePopover} placement={"top"} />
                                    </label>
                                    <input id="SZName" name="SZname" className="form-control" type="text" required
                                           onChange={this.handleSZNameChange} autoFocus={true}/>
                                    <label htmlFor="Link">Приложение:</label>
                                    <input id="SZApp" className="form-control" type="text" required
                                           onChange={this.handleSZAppendixChange}/>
                                    <label htmlFor="Link">Пункт:</label>
                                    <input id="SZPar" className="form-control" type="text" required
                                           onChange={this.handleSZParagraphChange}/>
                                    <input id="SaveButton" className="btn btn-success" type="button" value="Сохранить"
                                           onClick={this.addConfirmation}
                                           disabled={!(this.state.Name)}/>
                                </form>
                            }
                            {
                                this.state.Type == 'doc' && <form onSubmit={e => {
                                    e.preventDefault();
                                }}>
                                    <label htmlFor="Name"><span className="redText">*</span>Название:</label>
                                    <input id="Name" className="form-control" type="text" required autoFocus={true}
                                           onChange={this.handleNameChange} autoComplete={'off'}/>
                                    <label htmlFor="AddInfo">Дополнительная информация: {AddInfoHelp}
                                    </label>
                                    <input id="AddInfo" className="form-control" type="text" required
                                           onChange={this.handleAdditionalInfoChange} autoComplete={'off'}/>
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
                                                        размер: 15 Мб</p>
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
                                                        {Math.ceil(this.state.file.size / 1024 / 1024) > 15 &&
                                                        <span className="redText">Размер файла превышает 15 Мб</span>}
                                                    </div>}
                                                    </ul>
                                                </aside>
                                            </section>

                                        )}
                                    </Dropzone>
                                    <button id="SaveButton" className="btn btn-success"
                                            disabled={!(this.state.Name && this.state.file) ||
                                            Math.ceil(this.state.file.size / 1024 / 1024) > 15}
                                            value="Назад" onClick={this.addConfirmation}>Сохранить
                                    </button>
                                </form>
                            }
                                {(this.state.existingOpened && !this.state.existingSelected && this.state.commonConfirms) && <div>
                                    <label htmlFor="Name">Выберите подтверждение:</label>
                                    <BootstrapTable keyField='_id' data={this.state.commonConfirms}
                                                    columns={this.columns}
                                                    rowEvents={this.commonConfRowEvents}
                                                    headerClasses={["hidden"]} classes={["existingConfirmationsRow"]}
                                                    bordered={false}/>
                                </div>}
                                {(this.state.existingSelected) &&
                                <form>
                                    <label htmlFor="Name">Выбрано подтверждение:</label>
                                    <div>{this.state.existingConfirm.Name}</div>
                                    <label htmlFor="AddInfo">Дополнительная информация: {AddInfoHelp}</label>
                                    <input id="AddInfo" className="form-control" type="text" required
                                           onChange={this.handleAdditionalInfoChange} defaultValue={this.state.additionalInfo} autoComplete={'off'}/>
                                    <input id="SaveButton" className="btn btn-success" type="button" value="Сохранить"
                                           onClick={this.addExistingConfirmation}/>
                                </form>
                                }
                                {(this.state.sameFilesLoaded && !this.state.existingSelected) && <div>
                                    <p style={{marginTop: "1rem"}}><b>Вы уже загружали этот документ.</b><br/><br/>
                                    Вы можете прикрепить существующее подтверждение с этим файлом, кликнув на него:</p>
                                    <BootstrapTable keyField='_id' data={this.state.sameFilesLoaded}
                                                    columns={this.columns}
                                                    rowEvents={this.commonConfRowEvents}
                                                    headerClasses={["hidden"]} classes={["existingConfirmationsRow"]}
                                                    bordered={false}/>
                                                    <div style={{display: 'flex', justifyContent: 'center', marginBottom: '1rem'}}>
                                    <button id="SaveButton" className="btn btn-outline-danger" style={{borderWidth: '0'}} type="button"
                                           onClick={(e) => {this.saveResult(e, this.state.loadedFile)}}>
                                        Нет, сохранить как {this.state.loadedFile.Name}
                                    </button>
                                                    </div>
                                </div>}
                        </div>

                    </div>
                    }
                    </>
                </Modal>

                <Modal className="Modal" style={{content: {"z-index": "111"}, overlay: {"z-index": "110"}}}
                       isOpen={this.state.isEditing}
                       onRequestClose={this.closeEditingModal}
                       shouldCloseOnOverlayClick={true}
                       contentLabel="Example Modal"
                       overlayClassName="Overlay">
                    <EditConfirmation confirmation={this.state.editingConfirmation} save={saveConfirmation}/>
                </Modal>

            </div>

        )
    }

    commonConfRowEvents = {
        onClick: (e, row, rowIndex) => {
            this.setState({existingConfirm: row, existingSelected: true})
        }
    };
}

export default ConfirmationForm