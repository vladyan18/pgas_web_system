import React from 'react';
import '../../../style/user_main.css';
import UserDocuments from './/userDocuments';
import {useEffect} from 'react';
import userAchievesStore from '../../../stores/userAchievesStore';
import {observer} from 'mobx-react';

function UserDocumentsContainer() {
  useEffect(() => {
    userAchievesStore.updateCommonConfirmations();
    if (!userAchievesStore.achieves) {
      userAchievesStore.getAchieves();
    }
  }, []);

  return <UserDocuments confirmations={userAchievesStore.confirmations} achievements={userAchievesStore.achieves}/>;
}

export default observer(UserDocumentsContainer);
