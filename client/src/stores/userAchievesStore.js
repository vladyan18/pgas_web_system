import {decorate, observable} from 'mobx';

class UserAchievesStore {
    achieves;

    constructor() {

    }
}

decorate(UserAchievesStore, {
    achieves: observable
});

export default new UserAchievesStore();