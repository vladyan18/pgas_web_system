import React, {useEffect, useState} from 'react';
import AdminsList from './adminsList';
import {fetchGet} from "../../../services/fetchService";
import staffContextStore from '../../../stores/staff/staffContextStore';
import {observer} from "mobx-react";

function AdminsListContainer(props) {
  const [admins, setAdmins] = useState([]);
  function refresh() {
        fetchGet('/getAdmins', {faculty: staffContextStore.faculty}).then((adminsList) => {
          if (adminsList) {
            setAdmins([...adminsList])
          }
        });
  }
  useEffect(() => refresh(), []);

  return <AdminsList history={props.history} admins={admins} refreshCb={refresh}/>;
}

export default observer(AdminsListContainer);
