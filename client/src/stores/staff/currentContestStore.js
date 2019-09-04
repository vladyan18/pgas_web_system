import {decorate, observable} from 'mobx';

class CurrentContestStore {
    users = [];

    constructor() {

    }
}

decorate(CurrentContestStore, {
    users: observable
});

export default new CurrentContestStore();