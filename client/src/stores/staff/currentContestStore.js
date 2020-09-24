import {decorate, observable} from 'mobx';
import {fetchGet} from "../../services/fetchService";

class CurrentContestStore {
    users = [];

    async update(facultyName) {
        let result = await fetchGet("/api/checked", {faculty: facultyName});
        console.log('USERS UPDATED');
        for (let user of result.Info) {
            user.Achievements = user.Achievements.sort(function(obj1, obj2) {
                if (!obj1.crit || !obj2.crit) return 0;
                if (obj1.crit.indexOf('(') !== -1)
                    return Number.parseInt(obj1.crit.substr(0, 2)) - Number.parseInt(obj2.crit.substr(0, 2));
                else {
                    const letter1 = obj1.crit[obj1.crit.length - 1].charCodeAt(0);
                    const letter2 = obj2.crit[obj2.crit.length - 1].charCodeAt(0);
                    const number1 = obj1.crit.substr(0, obj1.crit.length - 1);
                    const number2 = obj2.crit.substr(0, obj2.crit.length - 1);
                    let result = Number.parseInt(number1) - Number.parseInt(number2);
                    if (result === 0) {
                        result = letter1 - letter2;
                    }
                    return result
                }
            });
        }
        result.Info = result.Info.sort(function(obj1, obj2) {
            console.log('SORT', obj1.user > obj2.user, obj1.user )
            if (obj1.user > obj2.user) {
                return 1;
            }
            if (obj1.user < obj2.user) {
                return -1;
            }
            return 0;
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