import React, {Component} from 'react';
import '../../../style/user_main.css';
import EditAchievement from '../../views/user/userEditAchievement/editAchievement';
import userAchievesStore from '../../../stores/userAchievesStore';
import {observer} from 'mobx-react';

class EditAchievementContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {achId: props.match.params.id, isCopying: false};
    this.copyAchievement = this.copyAchievement.bind(this);
  };

  componentDidMount() {
    if (!userAchievesStore.achieves) userAchievesStore.getAchieves();
  }

  copyAchievement() {
    this.setState({isCopying: true});
  }

  render() {
    return (<>{(userAchievesStore.achieves) &&
        <EditAchievement achieves={userAchievesStore.achieves}
                         achId={this.state.achId}
                         isCopying={this.state.isCopying}
                         copyAch={this.copyAchievement}/>}</>);
  }
}

export default observer(EditAchievementContainer);
