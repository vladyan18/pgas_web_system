import React from 'react';
import '../../../style/user_main.css';
import UserAddAchievement from '../../views/user/userAddAchievement/userAddAchievement';
import userPersonalStore from '../../../stores/userPersonalStore';
import {observer} from 'mobx-react';
import userAchievesStore from '../../../stores/userAchievesStore';

function UserAddAchievementContainer(props) {
  if (!userPersonalStore.personal) userPersonalStore.update().then();
  if (!userAchievesStore.achieves) userAchievesStore.getAchieves();

  return (<>{(userPersonalStore.personal && userAchievesStore.achieves) && <UserAddAchievement/>}</>);
}

export default observer(UserAddAchievementContainer);
