import React, {Component} from 'react';
import '../../../style/user_main.css';
import {observer} from 'mobx-react';
import StaffStudentsRating from './staffStudentsRating';
import CurrentContestRatingStore from '../../../stores/staff/currentContestRatingStore';
import staffContextStore from '../../../stores/staff/staffContextStore';
import {withRouter} from 'react-router-dom';

class StaffStudentsContainer extends Component {
  constructor(props) {
    super(props);
    this.getUsers = this.getUsers.bind(this);
  };

  componentDidMount() {
    this.getUsers();
  }

  getUsers() {
    CurrentContestRatingStore.update(staffContextStore.faculty).then();
  }

  render() {
    return staffContextStore.criterias &&
                <main className="row"  style={{'justifyContent': 'center', 'display': 'flex'}}>
                  <StaffStudentsRating
                  faculty={staffContextStore.faculty}
                  directions={staffContextStore.directions}
                  crits={staffContextStore.criterias}
                  data={CurrentContestRatingStore.users}/>
                </main>
               ||
            null;
  }
}

export default observer(StaffStudentsContainer);
