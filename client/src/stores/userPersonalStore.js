import {computed, decorate, observable} from 'mobx';

class UserPersonalStore {
    personal;
    Role;
    Rights;

    get fio() {
        return this.LastName + ' ' + this.FirstName + ' ' + this.Patronymic
    }

    get LastName() {
        if (this.personal) return this.personal.LastName;
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

    get Type() {
        if (this.personal) return this.personal.Type;
        else return ''
    }

    get Birthdate() {
        if (this.personal) return this.personal.Birthdate;
        else return ''
    }

    constructor() {

    }
}

decorate(UserPersonalStore, {
    personal: observable,
    Role: observable,
    fio: computed,
    LastName: computed,
    FirstName: computed,
    Patronymic: computed,
    Course: computed,
    Faculty: computed,
    Type: computed,
    Birthdate: computed
});

export default new UserPersonalStore();