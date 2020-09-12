import React, {useEffect, useState} from 'react';
import AdminsList from '../../views/staff/adminsList';
import {fetchGet} from "../../../services/fetchService";
import staffContextStore from '../../../stores/staff/staffContextStore';
import {observer} from "mobx-react";

function AdminsListContainer(props) {
  const [admins, setAdmins] = useState([]);
  useEffect(() => {
    fetchGet('/getAdmins', {faculty: staffContextStore.faculty}).then((adminsList) => setAdmins(adminsList));
  }, []);

  return <AdminsList history={props.history} admins={admins}/>;
}

export default observer(AdminsListContainer);
