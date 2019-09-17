import React, {Component} from 'react';
import '../../../../style/user_main.css';
import ManageUsers from "../../../views/staff/superAdmin/ManageUsers";

class ManageUsersContainer extends Component {
    constructor(props) {
        super(props);
    };


    render() {
        return (<ManageUsers></ManageUsers>)
    }
}

export default ManageUsersContainer