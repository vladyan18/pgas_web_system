import {decorate, observable} from 'mobx';

class staffNewAchievementsStore {
    users = [];

    update() {
        fetch("/api/getUsersForAdmin", {
            method: "GET"
        }).then((resp) => {
            return resp.json()
        })
            .then((data) => {
                this.users = data.Info
            })
            .catch((error) => console.log(error))
    }

    constructor() {

    }
}

decorate(staffNewAchievementsStore, {
    users: observable
});

export default new staffNewAchievementsStore();