import {decorate, observable} from 'mobx';

class UserAchievesStore {
    achieves;
    confirmations;

    getAchieves() {
        fetch("/api/getUserInfo", {
            method: "GET"
        }).then((resp) => {
            return resp.json()
        }).then((data) => {
                data.Achs = data.Achs.sort(function (obj1, obj2) {
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
                this.achieves = data.Achs;
                this.confirmations = data.Confirmations
            }).catch((err) => console.log(err));
    }
}

decorate(UserAchievesStore, {
    achieves: observable,
    confirmations: observable
});

export default new UserAchievesStore();