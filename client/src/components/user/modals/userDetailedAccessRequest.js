import Modal from "react-modal";
import React, {Component} from "react";
import ConfirmationForm from "../confirmation/ConfirmationForm";
import {Popover} from "react-bootstrap";
import "../../../style/checkbox.css"
import userPersonalStore from "../../../stores/userPersonalStore";
import {fetchSendWithoutRes} from "../../../services/fetchService";

class UserDetailedAccessRequest extends Component {
    constructor(props) {
        super(props);
        this.state = {modalIsOpen: true, checked: false};
        this.closeModal = this.closeModal.bind(this);
        this.handleCheck = this.handleCheck.bind(this);
        this.deny = this.deny.bind(this);
        this.accept = this.accept.bind(this);
    }

    closeModal() {
        this.setState({modalIsOpen: false});
    }

    handleCheck(e) {
        this.setState({checked: !this.state.checked})
    }

    accept() {
        let userOld = userPersonalStore.personal;
        let user = {};
        user.LastName = userOld.LastName;
        user.FirstName = userOld.FirstName;
        user.Patronymic = userOld.Patronymic;
        user.Birthdate = userOld.Birthdate;
        user.Faculty = userOld.Faculty;
        user.Type = userOld.Type;
        user.Course = userOld.Course;

        user.Settings = userOld.Settings;
        if (!user.Settings) {
            user.Settings = {};
        }
        user.Settings.detailedAccessAllowed = true;

        fetchSendWithoutRes('/api/registerUser', user).then((result) => {
            userPersonalStore.update().then();
            this.closeModal()
        });
    }

    deny() {
        let userOld = userPersonalStore.personal;
        let user = {};
        user.LastName = userOld.LastName;
        user.FirstName = userOld.FirstName;
        user.Patronymic = userOld.Patronymic;
        user.Birthdate = userOld.Birthdate;
        user.Faculty = userOld.Faculty;
        user.Type = userOld.Type;
        user.Course = userOld.Course;

        user.Settings = userOld.Settings;
        if (!user.Settings) {
            user.Settings = {};
        }
        user.Settings.detailedAccessAllowed = false;

        fetchSendWithoutRes('/api/registerUser', user).then((result) => {
            userPersonalStore.update().then();
            this.closeModal()
        });
    }

    render() {
        if (!userPersonalStore.personal) return null;
        if (!userPersonalStore.personal.Registered) return null;

        if (!userPersonalStore.Settings
            || userPersonalStore.Settings.detailedAccessAllowed === undefined
            || userPersonalStore.Settings.detailedAccessAllowed === null)
        {
            return <Modal className="Modal" style={{content: {"z-index": "111"}, overlay: {"z-index": "110"}}}
                          isOpen={this.state.modalIsOpen}
                          onRequestClose={this.closeModal}
                          shouldCloseOnOverlayClick={false}
                          contentLabel="Example Modal"
                          overlayClassName="Overlay">
                <div className="modalContentWrapper" style={{maxHeight: "40rem"}}>
                    <div className="block"
                         style={{maxHeight: "inherit", maxWidth: "29rem", overflow: "auto", paddingTop: '0.5rem'}}>
                        <div className="profile"
                             style={{"display: flex; justify-content": "space-between", "margin": "0"}}>
                            <p className="headline" style={{"margin-bottom": "auto", "margin-right": "1rem"}}>
                                <b>Открытие доступа к достижениям</b>
                            </p>
                        </div>

                        <hr className="hr_blue"/>
                        <p>Поставив галочку, вы разрешите участникам конкурса с вашего факультета (направления), также поставившим
                            эту
                            галочку,
                            просматривать ваши достижения в рейтинге на ПГАС. Такая возможность предоставляется в целях
                            повышения открытости процесса и формирования доверия между всеми участниками назначения
                            ПГАС. </p>
                        <i style={{fontSize: "small", color: "#5d5d5d"}}>Таким образом, ставя данную галочку, вы
                            дополнительно даете согласие на публикацию информации,
                            относящейся к вашим персональным данным в соответствии со статьей 9 Федерального закона
                            от 27.07.2006 №152-ФЗ «О персональных данных», в целях повышения открытости процесса
                            назначения
                            ПГАС. Отзыв данного согласия
                            возможен путем изменения настроек в профиле.</i>

                        <div className="checkbox" style={{color: "green", marginTop: '1rem'}}>
                            <input type="checkbox" id="checkbox_modal_1"
                                   defaultChecked={userPersonalStore.Settings && userPersonalStore.Settings.detailedAccessAllowed}
                                   onChange={this.handleCheck}
                                   style={{cursor: 'pointer', marginRight: '5px', fontSize: 'large'}}/>
                            <label htmlFor="checkbox_modal_1" style={{cursor: 'pointer'}}><b>Открыть участникам доступ к моим
                                достижениям</b></label>
                        </div>

                        <div style={{display: 'flex', justifyContent:'space-between', paddingLeft: '4rem', paddingRight:'4rem',
                        marginTop: '2rem'}}>
                        <button id="DeleteButton" className="btn btn-outline-danger"
                                value="Назад" onClick={this.deny}>Отказаться
                        </button>
                            <button id="DeleteButton" className="btn btn-success"
                                    value="Назад" onClick={this.accept}
                                    disabled={!this.state.checked}
                            >Сохранить
                            </button>
                        </div>
                    </div>
                </div>
            </Modal>
          } else return null;
    }
}

export default UserDetailedAccessRequest