import Modal from 'react-modal';
import React, {Component} from 'react';
import '../../../style/checkbox.css';
import userPersonalStore from '../../../stores/userPersonalStore';
import {fetchSendWithoutRes} from '../../../services/fetchService';
import {withRouter} from 'react-router';

class UserUpdateProfileRemainder extends Component {
    constructor(props) {
        super(props);
        this.state = {modalIsOpen: true};
        this.closeModal = this.closeModal.bind(this);
        this.save = this.save.bind(this);
        this.goToEdition = this.goToEdition.bind(this);
    }

    closeModal() {
        if (!userPersonalStore.personal.settings || !userPersonalStore.personal.settings.notifiedAboutUpdate) {
            this.save();
        }
        this.setState({modalIsOpen: false});
    }

    goToEdition() {
        this.save();
        this.props.history.push('/edit_profile');
    }

    save() {
        const userOld = userPersonalStore.personal;
        const user = {};
        user.lastname = userOld.LastName;
        user.name = userOld.FirstName;
        user.patronymic = userOld.Patronymic;
        user.birthdate = userOld.Birthdate;
        user.faculty = userOld.Faculty;
        user.type = userOld.Type;
        user.course = userOld.Course;
        user.settings = userOld.Settings;
        if (!user.settings) user.settings = {};
        user.settings.notifiedAboutUpdate = true;

        fetchSendWithoutRes('/api/registerUser', user).then(() => {
            userPersonalStore.update().then();
        });
    }

    render() {
        if (!userPersonalStore.personal) return null;
        if (!userPersonalStore.personal.Registered) return null;

        if (!userPersonalStore.Settings || !userPersonalStore.Settings.notifiedAboutUpdate) {
            return <Modal className="Modal" style={{content: {'z-index': '111'}, overlay: {'z-index': '110'}}}
                          isOpen={this.state.modalIsOpen}
                          onRequestClose={this.closeModal}
                          shouldCloseOnOverlayClick={false}
                          contentLabel="Example Modal"
                          overlayClassName="Overlay">
                <div className="modalContentWrapper" style={{maxHeight: '50rem', maxWidth: '100vw' }}>
                    <div className="block"
                         style={{maxHeight: 'inherit', maxWidth: '100vw', overflow: 'auto', paddingTop: '0.5rem'}}>
                        <div className="profile"
                             style={{'display: flex; justify-content': 'space-between', 'margin': '0'}}>
                            <p className="headline" style={{'margin-bottom': 'auto', 'margin-right': '1rem'}}>
                                <b>Проверьте актуальность личных данных</b>
                            </p>
                        </div>

                        <hr className="hr_blue"/>

                        <p style={{marginBottom: '2rem'}}>Данные, внесенные в систему, используются при формировании анкеты. <br/>
                            Если что-то поменялось, не забудьте отредактировать профиль.</p>

                        <div style={{display: 'flex', justifyContent: 'center'}}>
                        <table style={{'margin-bottom': '2rem'}}>
                            <tbody>
                            <tr>
                                <td style={{'text-align': 'right'}}>Факультет:</td>
                                <td id="Faculty" style={{'padding-left': '0.5rem'}}>{userPersonalStore.personal.Faculty}</td>
                            </tr>
                            <tr>
                                <td style={{'text-align': 'right'}}>Ступень обучения:</td>
                                <td id="Type" style={{'padding-left': '0.5rem'}}><b>{userPersonalStore.personal.Type}</b></td>
                            </tr>
                            <tr>
                                <td style={{'text-align': 'right'}}>Курс:</td>
                                <td id="Course" style={{'padding-left': '0.5rem'}}><b>{userPersonalStore.personal.Course}</b></td>
                            </tr>
                            </tbody>
                        </table>
                        </div>


                        <div style={{display: 'flex', justifyContent: 'space-between',
                        marginTop: '2rem'}}>
                            <button id="DeleteButton" className="btn btn-secondary"
                                    value="Назад" onClick={this.closeModal}
                            >Закрыть
                            </button>
                            <button id="DeleteButton" className="btn btn-primary"
                                    value="Назад" onClick={this.goToEdition}
                            >Редактировать
                            </button>
                        </div>
                    </div>
                </div>
            </Modal>;
          } else return null;
    }
}

export default withRouter(UserUpdateProfileRemainder);
