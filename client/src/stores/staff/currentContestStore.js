import {decorate, observable} from 'mobx';
import {fetchGet} from "../../services/fetchService";

class CurrentContestStore {
    users = [];

    async update(facultyName) {
        let result = await fetchGet("/api/checked", {faculty: facultyName});
        this.users = result.Info
    }

    constructor() {

    }
}

decorate(CurrentContestStore, {
    users: observable
});

export default new CurrentContestStore();