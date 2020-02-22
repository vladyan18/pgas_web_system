import React, {Component} from 'react';
import '../../../style/user_main.css';
import UserRegistrationPage from '../../views/user/userRegistrationPage';
import {fetchGet} from '../../../services/fetchService';

class UserRegistrationContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  };

  componentDidMount() {
    console.log('MOUNTED');
    fetchGet('/api/getFacultiesList', {}).then((facultiesList) => {
      console.log(facultiesList);
      this.setState({faculties: facultiesList.list});
    });
  }

  render() {
    return (<>
      {this.state.faculties && <UserRegistrationPage faculties={this.state.faculties}/>}
    </>);
  }
}

export default UserRegistrationContainer;
