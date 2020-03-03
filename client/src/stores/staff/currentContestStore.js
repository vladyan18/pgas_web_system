import {decorate, observable} from 'mobx';
import {fetchGet} from "../../services/fetchService";

class CurrentContestStore {
    users = [];

    async update(facultyName) {
        let result = await fetchGet("/api/checked", {faculty: facultyName});
        for (let user of result.Info) {
            user.Achievements = user.Achievements.sort(function(obj1, obj2) {
                return Number.parseInt(obj1.crit.substr(0, 2)) - Number.parseInt(obj2.crit.substr(0, 2));
            });
        }
        result.Info = result.Info.sort(function(obj1, obj2) {
            return obj1.LastName > obj2.LastName;
        });
        this.users = result.Info
    }

    constructor() {

    }
}

decorate(CurrentContestStore, {
    users: observable
});

export default new CurrentContestStore();