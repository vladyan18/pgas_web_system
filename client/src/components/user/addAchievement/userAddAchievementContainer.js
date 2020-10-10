import React, {useEffect} from 'react';
import '../../../style/user_main.css';
import UserAddAchievement from './userAddAchievement';
import userPersonalStore from '../../../stores/userPersonalStore';
import {observer} from 'mobx-react';
import userAchievesStore from '../../../stores/userAchievesStore';

export function UserAddAchievementContainer(props) {
  useEffect(() => {
    if (!userPersonalStore.personal) userPersonalStore.update().then();
    if (!userAchievesStore.achieves) userAchievesStore.getAchieves();
  }, []);

  return (<> <UserAddAchievement/></>);
}

export default observer(UserAddAchievementContainer);
