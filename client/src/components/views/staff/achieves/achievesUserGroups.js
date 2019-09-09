import React, {Component} from 'react';
import '../../../../style/admin.css';
import AchievesGroup from "./achievesGroup";
import Modal from "react-modal";
import StaffChangeAchievement from "../StaffChangeAchievement";

class AchievesUserGroups extends Component {
    constructor(props) {
        super(props);
        this.state = {modalIsOpen: false, modalAchId: ''};
        Modal.setAppElement('#root');
        this.openEditModal = this.openEditModal.bind(this);
        this.closeEditModal = this.closeEditModal.bind(this)
    };

    openEditModal(achId) {
        this.setState({modalIsOpen: true, modalAchId: achId})
    }

    closeEditModal(achId) {
        this.setState({modalIsOpen: false, modalAchId: achId})
    }

    updateUsers(newUsers) {

    }


    render() {
        return (
            <main id="main">{this.props.users &&
            <div id="panel" className="col list" style={{"width": "100%"}}>

                {this.props.users.map((item) => (
                    <AchievesGroup item={item} updater={this.props.updater} openModal={this.openEditModal}/>
                ))}
            </div>}
                <Modal className="Modal" style={{content: {"z-index": "111"}, overlay: {"z-index": "110"}}}
                       isOpen={this.state.modalIsOpen}
                       onRequestClose={this.closeEditModal}
                       shouldCloseOnOverlayClick={true}
                       contentLabel="Example Modal"
                       overlayClassName="Overlay"
                >
                    {this.state.modalIsOpen &&
                    <StaffChangeAchievement users={this.props.users} achId={this.state.modalAchId}
                                            closeModal={() => {
                                                this.setState({modalIsOpen: false, modalAchId: ''});
                                                this.props.updater()
                                            }}/>
                    }
                </Modal>
            </main>
        )
    }
}

export default AchievesUserGroups