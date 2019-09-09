import {decorate, observable} from 'mobx';
import {fetchGet} from "../../services/fetchService";

class StaffContextStore {
    faculty;
    criterias;

    constructor() {

    }

    async changeFaculty(newFaculty) {
        let result = await fetchGet('/api/getCriterias', {faculty: newFaculty});
        console.log('CRITERIAS', result);
        this.criterias = result;
        this.faculty = newFaculty
    }
}

decorate(StaffContextStore, {
    faculty: observable,
    criterias: observable
});

export default new StaffContextStore();