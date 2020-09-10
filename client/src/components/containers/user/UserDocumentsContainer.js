import React from 'react';
import '../../../style/user_main.css';
import UserDocuments from "../../views/user/userDocuments";
import {useEffect} from 'react';
import userAchievesStore from "../../../stores/userAchievesStore";
import {observer} from "mobx-react";

function UserDocumentsContainer() {
  useEffect(() => {
    userAchievesStore.updateCommonConfirmations()
  }, []);

  return <UserDocuments confirmations={userAchievesStore.confirmations}/>;
}

export default observer(UserDocumentsContainer);
