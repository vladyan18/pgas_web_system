import {decorate, observable} from 'mobx';

class CurrentContestRatingStore {
    users = [];

    update() {
        fetch("/api/getRating", {
            method: "GET"
        }).then((resp) => {
            return resp.json()
        })
            .then((data) => {
                this.users = data.Users;
                console.log('USERS ' + JSON.stringify(data.Users))
            })
            .catch((error) => console.log(error))
    }

    constructor() {

    }
}

decorate(CurrentContestRatingStore, {
    users: observable
});

export default new CurrentContestRatingStore();