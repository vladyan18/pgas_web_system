import {decorate, observable} from 'mobx';
import {fetchGet} from "../services/fetchService";

class UserAchievesStore {
    achieves;
    confirmations;
    archivedAchieves;

    getAchieves() {
        fetch("/api/getUserInfo", {
            method: "GET"
        }).then((resp) => {
            return resp.json()
        }).then((data) => {
                data.Achievement = data.Achievement.sort(function (obj1, obj2) {
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
                this.achieves = data.Achievement;
            }).catch((err) => console.log(err));

        fetch("/api/getArchivedAchievements", {
            method: "GET"
        }).then((resp) => {
            return resp.json()
        }).then((data) => {
                this.archivedAchieves = data;
            }).catch((err) => console.log(err));
    }

    updateCommonConfirmations() {
        fetchGet('/api/getConfirmations', {}).then((commonConfirms) => {
            if (commonConfirms) {
                for (let conf of commonConfirms) {
                    if (conf.Type === 'SZ') {
                        commonConfirms.splice(commonConfirms.indexOf(conf), 1)
                    }
                }
                this.confirmations = commonConfirms;
            }
        });
    }

}

decorate(UserAchievesStore, {
    achieves: observable,
    confirmations: observable,
    archivedAchieves: observable
});

export default new UserAchievesStore();
