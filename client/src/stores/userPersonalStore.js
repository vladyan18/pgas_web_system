import {computed, decorate, observable} from 'mobx';
import {fetchGet} from "../services/fetchService";

class UserPersonalStore {
    personal;
    Role;
    Rights;
    facultyRawName;

    async update() {
        try {
            let result = await fetchGet('/getProfile', {});
            console.log('GET PROFILE', result);
            this.personal = result;
            if (result)
                await fetchGet('/getRights', {id: result.id}).then((res2) => {
                    this.Role = res2.Role;
                    this.Rights = res2.Rights
                });
            return result
        }
        catch (e) {
            if (e.body && e.body.Error == 404 && e.body.facultyRawName)
            {
                this.facultyRawName = e.body.facultyRawName
                console.log(this.facultyRawName)
            }
            console.log(e);
            throw new Error('Error with login')
        }
    }

    get fio() {
        return this.LastName + ' ' + this.FirstName + ' ' + this.Patronymic
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
        console.log(this.personal)
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
    Type: computed,
    Birthdate: computed,
    Direction: computed,
    IsInRating: computed
});

export default new UserPersonalStore();