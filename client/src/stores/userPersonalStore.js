import {computed, decorate, observable} from 'mobx';
import {fetchGet} from "../services/fetchService";
import store from "./criteriasStore";

class UserPersonalStore {
    personal;
    Role;
    Rights;
    facultyRawName;

    async update() {
        try {
            let result = await fetchGet('/getProfile', {});
            this.personal = result;
            localStorage.setItem('personal', JSON.stringify(result));
            if (result)
                await fetchGet('/getRights', {id: result.id}).then((res2) => {
                    this.Role = res2.Role;
                    this.Rights = res2.Rights
                });
            return result
        }
        catch (e) {
            if (e.body && e.body.Error === 404)
            {
		return null;
            }
            console.log(e);
            throw new Error('Error with login')
        }
    }

    get fio() {
        return this.LastName + ' ' + this.FirstName + (this.Patronymic ? ' ' + this.Patronymic : '');
    }

    get LastName() {
        if (this.personal) return this.personal.LastName;
        else return ''
    }

    get SpbuId() {
        if (this.personal) return this.personal.SpbuId;
        else return ''
    }

    get FirstName() {
        if (this.personal) return this.personal.FirstName;
        else return ''
    }

    get Patronymic() {
        if (this.personal) return this.personal.Patronymic;
        else return ''
    }

    get Course() {
        if (this.personal) return this.personal.Course;
        else return ''
    }

    get Faculty() {
        if (this.personal) return this.personal.Faculty;
        else return ''
    }

    get Settings() {
        if (this.personal) return this.personal.Settings;
        else return null;
    }

    get Type() {
        if (this.personal) return this.personal.Type;
        else return ''
    }

    get Birthdate() {
        if (this.personal) return this.personal.Birthdate;
        else return ''
    }

    get Direction() {
        if (this.personal) return this.personal.Direction;
        else return ''
    }

    get IsInRating() {
        if (this.personal) return this.personal.IsInRating;
        else return false
    }

    constructor() {

    }
}

decorate(UserPersonalStore, {
    personal: observable,
    Role: observable,
    Rights: observable,
    facultyRawName: observable,
    fio: computed,
    LastName: computed,
    FirstName: computed,
    Patronymic: computed,
    Course: computed,
    Faculty: computed,
    Settings: computed,
    Type: computed,
    Birthdate: computed,
    Direction: computed,
    IsInRating: computed
});

const storage = new UserPersonalStore();

if (localStorage.getItem('personal') !== '') {
    try {
        store.personal = JSON.parse(localStorage.getItem('personal'));
    }  catch (e) {
        localStorage.removeItem('personal');
    }
}

export default storage;
