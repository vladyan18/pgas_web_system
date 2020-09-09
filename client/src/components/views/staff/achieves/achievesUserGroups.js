import React, {Component} from 'react';
import '../../../../style/admin.css';
import AchievesGroup from './achievesGroup';
import Modal from 'react-modal';
import StaffChangeAchievement from '../StaffChangeAchievement';
import staffContextStore from '../../../../stores/staff/staffContextStore';
/** @jsx jsx */
import {css, jsx} from '@emotion/core';
import styled from '@emotion/styled';
import {observer} from "mobx-react";
import SystematicsInfo from "./systematicsInfo";

class AchievesUserGroups extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {modalIsOpen: false, modalAchId: '', systematicsConflicts: [], onlyUpdated: false};
    Modal.setAppElement('#root');
    this.openEditModal = this.openEditModal.bind(this);
    this.closeEditModal = this.closeEditModal.bind(this);
    this.toggleCheckedAchieve = this.toggleCheckedAchieve.bind(this);
    this.handleDirectionSelect = this.handleDirectionSelect.bind(this);
    this.updateSystematicsCallback = this.updateSystematicsCallback.bind(this);
    this.toggleOnlyUpdated = this.toggleOnlyUpdated.bind(this);
  };

  updateSystematicsCallback(systematicsConflicts) {
    if (JSON.stringify(systematicsConflicts) !== JSON.stringify(this.state.systematicsConflicts))
    this.setState({systematicsConflicts: systematicsConflicts})
  }

  openEditModal(achId) {
    this.setState({modalIsOpen: true, modalAchId: achId});
  }

  closeEditModal(achId) {
    this.setState({modalIsOpen: false, modalAchId: achId});
  }

  updateUsers(newUsers) {

  }

  toggleCheckedAchieve() {
    this.setState({hideCheckedAchieves: !this.state.hideCheckedAchieves});
  }

  toggleOnlyUpdated() {
    this.setState({onlyUpdated: !this.state.onlyUpdated})
  }
  handleDirectionSelect(e) {
    this.setState({currentDirection: e.target.value});
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (!this.props.isNewList && staffContextStore.directions && staffContextStore.directions.length > 0) {
      if (!this.state.currentDirection) {
        this.setState({currentDirection: staffContextStore.directions[0]});
      }
    }
  }

  render() {
    let totalAchCount = 0;
    let checkedAchCount = 0;

    let countOfUpdatedAchieves = 0;
    let filteredUsers = this.props.users;
    if (this.state.onlyUpdated) {
      filteredUsers = filteredUsers.filter((x) => x.Achievements.some((ach) => ach.isPendingChanges)).map((x) => Object.assign({}, x));
    }

    for (const user of filteredUsers) {
      if (this.state.onlyUpdated) {
        user.Achievements = user.Achievements.filter((x) => x.isPendingChanges)
      }
      for (const ach of user.Achievements) {
        if (ach.status !== 'Ожидает проверки') {
          if (ach.status !== 'Изменено') {
            checkedAchCount += 1;
          }
          if (ach.isPendingChanges) {
            countOfUpdatedAchieves += 1;
          }
        }
        totalAchCount += 1;
      }
    }

    return (
      <main id="main">
            <div id="panel" className="col list" style={{'width': '100%'}} css={css`box-shadow: 0 2px 4px rgba(0, 0, 0, .2);`}>
              {countOfUpdatedAchieves > 0 && <div style={{width: '100%', textAlign: 'center'}}>
                <span style={{color: 'blue',  borderBottom: '1px dashed blue',
                  cursor: 'pointer'}} onClick={this.toggleOnlyUpdated}>Обновлено достижений: <b>{countOfUpdatedAchieves}</b></span>
              </div>}
              <div style={{display: 'flex', justifyContent: 'space-between'}}>
                <h2 style={{fontSize: '2rem'}}>
                  <b>Факультет: {staffContextStore.faculty}</b>
                  <br/>
                  <span style={{fontSize: '1.5rem'}}>Количество студентов: {filteredUsers.length}</span>
                  {!this.props.isNewList && staffContextStore.directions && staffContextStore.directions.length > 0 && <select id='1'
                    className="form-control selectors"
                    onChange={this.handleDirectionSelect}>
                    {staffContextStore.directions.map((dir) =>
                      <option value={dir}>{dir}</option> )}
                  </select>}
                </h2>
                <div>
                  <p style={
                    {
                      fontSize: '1.28rem',
                      marginBottom: '0.8rem',
                      marginLeft: '-1px',
                      marginTop: '-0.1rem',
                    }
                  }>{this.state.onlyUpdated ? 'Просмотр обновленных достижений' : <>Проверено достижений: {checkedAchCount}/{totalAchCount}</>}</p>
                  {!this.state.onlyUpdated && <button
                    className={`btn btn-${this.state.hideCheckedAchieves ? 'success':'outline-info'}`}
                    onClick={this.toggleCheckedAchieve} >{this.state.hideCheckedAchieves ? 'Показать ' : 'Скрыть '}
                        проверенные достижения
                  </button>}
                </div>
              </div>

            <SystematicsInfo users={filteredUsers} updateSystematicsCallback={this.updateSystematicsCallback}/>


              {filteredUsers && filteredUsers.map((item) => (
                <div key={item.Id}>
                  <AchievesGroup item={item} updater={this.props.updater}
                                 openModal={this.openEditModal}
                                 filters={{hideCheckedAchieves: this.state.hideCheckedAchieves}}
                                 systematicsConflicts={this.state.systematicsConflicts}
                  />
                </div>
              ))}
            </div>
      <Modal className="Modal" style={{content: {'z-index': '111'}, overlay: {'z-index': '110'}}}
        isOpen={this.state.modalIsOpen}
        onRequestClose={this.closeEditModal}
        shouldCloseOnOverlayClick={true}
        contentLabel="Example Modal"
        overlayClassName="Overlay"
      >
        {this.state.modalIsOpen &&
                    <StaffChangeAchievement users={filteredUsers} achId={this.state.modalAchId}
                      closeModal={() => {
                        this.setState({modalIsOpen: false, modalAchId: ''});
                        this.props.updater();
                      }}/>
        }
      </Modal>
      </main>
    );
  }
}

export default AchievesUserGroups;
