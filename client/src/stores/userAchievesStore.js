import {decorate, observable} from 'mobx';

class UserAchievesStore {
    achieves;

    getAchieves() {
        fetch("/api/getUserInfo", {
            method: "GET"
        }).then((resp) => {
            console.log(resp);
            return resp.json()
        })
            .then((data) => {
                console.log(data);
                data.Achs = data.Achs.sort(function (obj1, obj2) {
                    return Number.parseInt(obj1.crit.substr(0, 2)) > Number.parseInt(obj2.crit.substr(0, 2))
                });
                this.achieves = data.Achs
            }).catch((err) => console.log(err));
    }
}

decorate(UserAchievesStore, {
    achieves: observable
});

export default new UserAchievesStore();