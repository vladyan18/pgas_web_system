import {decorate, observable} from 'mobx';
import {fetchGet} from "../../services/fetchService";

class CurrentContestRatingStore {
    users = [];

    async update(facultyName) {
        let result = await fetchGet("/api/getRating", {faculty: facultyName});
        this.users = result.Users
    }

    constructor() {

    }
}

decorate(CurrentContestRatingStore, {
    users: observable
});

export default new CurrentContestRatingStore();