import React, {Component} from 'react';
import '../../../style/user_main.css';
import {fetchGet} from '../../../services/fetchService';
import UserEditProfilePage from './userEditProfilePage';
import userPersonalStore from '../../../stores/userPersonalStore';

class UserEditProfileContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    fetchGet('/api/getFacultiesList', {}).then((facultiesList) => {
      this.setState({faculties: facultiesList.list});
    });
  }

  render() {
    return (<>
      {(this.state.faculties && userPersonalStore.personal) &&
            <UserEditProfilePage personal={userPersonalStore.personal} faculties={this.state.faculties}/>}
    </>);
  }
}

export default UserEditProfileContainer;
