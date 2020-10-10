import React, {Component} from 'react';
import '../../../style/user_main.css';
import AchievesUserGroups from '../../staff/achieves/achievesUserGroups';
import {observer} from 'mobx-react';
import currentContestStore from '../../../stores/staff/currentContestStore';
import staffContextStore from '../../../stores/staff/staffContextStore';

class CurrentContestAchievesContainer extends Component {
  constructor(props) {
    super(props);
    this.getAchieves = this.getAchieves.bind(this);
  }

  componentDidMount() {
    this.getAchieves().then();
  }

  async getAchieves() {
    await currentContestStore.update(staffContextStore.faculty);
  }

  render() {
    return <AchievesUserGroups users={currentContestStore.users} updater={this.getAchieves}/>;
  }
}

export default observer(CurrentContestAchievesContainer);
