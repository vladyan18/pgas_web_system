import React, {Component} from 'react';
import '../../../style/user_main.css';
import AchievesUserGroups from '../../staff/achieves/achievesUserGroups';
import staffNewAchievementsStore from '../../../stores/staff/staffNewAchievementsStore';
import {observer} from 'mobx-react';
import staffContextStore from '../../../stores/staff/staffContextStore';

class NewAchievesContainer extends Component {
  constructor(props) {
    super(props);
    this.getAchieves = this.getAchieves.bind(this);
  };

  componentDidMount() {
    this.getAchieves().then();
  }

  async getAchieves() {
    await staffNewAchievementsStore.update(staffContextStore.faculty);
  }

  render() {
    return <AchievesUserGroups users={staffNewAchievementsStore.users} updater={this.getAchieves} isNewList={true}/>;
  }
}

export default observer(NewAchievesContainer);
