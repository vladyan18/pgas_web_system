import {decorate, observable} from 'mobx';

class staffNewAchievementsStore {
    users = [];

    constructor() {

    }
}

decorate(staffNewAchievementsStore, {
    users: observable
});

export default new staffNewAchievementsStore();