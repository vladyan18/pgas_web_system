import React, {Component} from 'react';
import AdminCreation from '../../../views/staff/superAdmin/adminCreation';
import {fetchGet} from '../../../../services/fetchService';

class AdminCreationContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  };

  componentWillMount() {
    fetchGet('/api/getFacultiesList', {}).then((result) =>
      this.setState({faculties: result.list}));
  }


  render() {
    return (<>
      {
        this.state.faculties &&
                    <AdminCreation facultiesList={this.state.faculties}/>
      }
      {
        !this.state.faculties &&
                    <div></div>
      }
    </>
    );
  }
}

export default AdminCreationContainer;
