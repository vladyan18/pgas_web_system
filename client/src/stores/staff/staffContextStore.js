import {decorate, observable} from 'mobx';
import {fetchGet} from "../../services/fetchService";

class StaffContextStore {
    faculty;
    criterias;
    schema;
    annotations;

    constructor() {

    }

    async changeFaculty(newFaculty) {
        let result = await fetchGet('/api/getCriterias', {faculty: newFaculty});
        this.criterias = result;
        this.faculty = newFaculty;
        this.schema = undefined;
        this.annotations = undefined;
    }

    async getAnnotations() {
        let result = await fetchGet('/api/getAnnotations', {faculty: this.faculty});
        this.annotations = result
    }

    async getCritsAndSchema() {
        let result = await fetchGet('/api/getCriteriasAndSchema', {faculty: this.faculty});
        this.criterias = JSON.parse(result.Crits);
        this.schema = JSON.parse(result.CritsSchema)
    }
}

decorate(StaffContextStore, {
    faculty: observable,
    criterias: observable,
    schema: observable,
    annotations: observable
});

export default new StaffContextStore();