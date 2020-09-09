import React, {Component} from 'react';
import '../../../style/user_main.css';
import {observer} from 'mobx-react';
import StaffStudentsRating from '../../views/staff/staffStudentsRating';
import CurrentContestRatingStore from '../../../stores/staff/currentContestRatingStore';
import staffContextStore from '../../../stores/staff/staffContextStore';
import {withRouter} from 'react-router-dom';
import {fetchGet} from '../../../services/fetchService';
import userPersonalStore from '../../../stores/userPersonalStore';
import criteriasStore from '../../../stores/criteriasStore';
import UserDetailedRating from "../../views/user/userDetailedRating";

class UserStudentsContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    if ( userPersonalStore.Settings && userPersonalStore.Settings.detailedAccessAllowed) {
        this.state.isDetailedMode = true;
    }
    this.getUsers = this.getUsers.bind(this);
    this.toggleMode = this.toggleMode.bind(this);
  };

  componentDidMount() {
    this.getUsers().then();
  }

  toggleMode() {
    this.setState({isDetailedMode: !this.state.isDetailedMode});
  }

  async getUsers() {
    const response = await fetchGet('/api/getRatingForUser', {faculty: userPersonalStore.Faculty});

    let sortedAchs = [];
    for (const user of response.Users) {
      if (user.Achievements) {
        user.Achievements = user.Achievements.filter((x) => x.status === 'Принято' || x.status === 'Принято с изменениями');
        user.Achievements = user.Achievements.sort(function (obj1, obj2) {
          if (obj1.crit.indexOf('(') !== -1)
            return Number.parseInt(obj1.crit.substr(0, 2)) - Number.parseInt(obj2.crit.substr(0, 2));
          else {
            const letter1 = obj1.crit[obj1.crit.length - 1].charCodeAt(0);
            const letter2 = obj2.crit[obj2.crit.length - 1].charCodeAt(0);
            const number1 = obj1.crit.substr(0, obj1.crit.length - 1);
            const number2 = obj2.crit.substr(0, obj2.crit.length - 1);
            let result = Number.parseInt(number1) - Number.parseInt(number2);
            if (result === 0) {
              result = letter1 - letter2;
            }
            return result
          }
        });
      }
      sortedAchs.push(user);
    }
    this.setState({users: sortedAchs});
  }

  render() {
    //if (!(criteriasStore.criterias && this.state.users)) return null;

    if (this.state.isDetailedMode) {
       return <UserDetailedRating
           faculty={userPersonalStore.Faculty}
           directions={userPersonalStore.Direction ? [userPersonalStore.Direction] : undefined}
           userMode={true}
           crits={criteriasStore.criterias}
           data={this.state.users} toggleModeCallback={this.toggleMode}/>
    } else {
      return <StaffStudentsRating faculty={userPersonalStore.Faculty}
                                  directions={userPersonalStore.Direction ? [userPersonalStore.Direction] : undefined}
                                  userMode={true}
                                  crits={criteriasStore.criterias}
                                  data={this.state.users}
                                  toggleDetailedModeCallback={(this.state.isDetailedMode === false) ? this.toggleMode : undefined}
      />
    }
  }
}

export default observer(UserStudentsContainer);
