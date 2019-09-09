import {decorate, observable} from 'mobx';
import {fetchGet} from "../../services/fetchService";

class staffNewAchievementsStore {
    users = [];

    async update(facultyName) {
        let result = await fetchGet("/api/getUsersForAdmin", {faculty: facultyName});
        this.users = result.Info
    }

    constructor() {

    }
}

decorate(staffNewAchievementsStore, {
    users: observable
});

export default new staffNewAchievementsStore();