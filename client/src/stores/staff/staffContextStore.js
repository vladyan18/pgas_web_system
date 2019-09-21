import {decorate, observable} from 'mobx';
import {fetchGet} from "../../services/fetchService";

class StaffContextStore {
    faculty;
    criterias;
    schema;
    annotations;
    learningProfile;

    constructor() {

    }

    async changeFaculty(newFaculty) {
        let result = await fetchGet('/api/getCriterias', {faculty: newFaculty});
        this.criterias = result;
        this.faculty = newFaculty;
        this.schema = undefined;
        this.annotations = undefined;
        this.learningProfile = undefined;
    }

    async getAnnotations() {
        let result = await fetchGet('/api/getAnnotations', {faculty: this.faculty});
        if (result) {
            this.annotations = result.annotations
            this.learningProfile = result.learningProfile
        }
        else {
            this.annotations = undefined
            this.learningProfile = undefined
        }
    }

    async getCritsAndSchema() {
        let result = await fetchGet('/api/getCriteriasAndSchema', {faculty: this.faculty});
        if (result) {
            this.criterias = JSON.parse(result.Crits);
            this.schema = JSON.parse(result.CritsSchema)
        }
        else
        {
            this.criterias = undefined
            this.schema = undefined
        }
    }
}

decorate(StaffContextStore, {
    faculty: observable,
    criterias: observable,
    schema: observable,
    annotations: observable,
    learningProfile: observable
});

export default new StaffContextStore();