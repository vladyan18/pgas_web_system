import {decorate, observable} from 'mobx';
import {fetchGet} from "../../services/fetchService";

class staffNewAchievementsStore {
    users = [];

    async update(facultyName) {
        let result = await fetchGet("/api/getUsersForAdmin", {faculty: facultyName});

        for (let user of result.Info) {
            user.Achievements = user.Achievements.sort(function(obj1, obj2) {
                if (obj1.crit.indexOf('(') !== -1)
                    return Number.parseInt(obj1.crit.substr(0, 2)) - Number.parseInt(obj2.crit.substr(0, 2));
                else {
                    const letter1 = obj1.crit[obj1.crit.length - 1].charCodeAt(0);
                    const letter2 = obj2.crit[obj2.crit.length - 1].charCodeAt(0);
                    const number1 = obj1.crit.substr(0, obj1.crit.length - 1);
                    const number2 = obj2.crit.substr(0, obj2.crit.length - 1);
                    console.log(number1, letter1, number2, letter2)
                    let result = Number.parseInt(number1) - Number.parseInt(number2);
                    if (result === 0) {
                        result = letter1 - letter2;
                    }
                    return result
                }
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

decorate(staffNewAchievementsStore, {
    users: observable
});

export default new staffNewAchievementsStore();