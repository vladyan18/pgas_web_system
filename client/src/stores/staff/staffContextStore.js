import {decorate, observable} from 'mobx';
import {fetchGet} from "../../services/fetchService";

class StaffContextStore {
    faculty;
    criterias;
    schema;
    limits;
    annotations;
    learningProfile;
    directions;

    constructor() {

    }

    async changeFaculty(newFaculty) {
        this.faculty = newFaculty;
        this.schema = undefined;
        this.limits = undefined;
        this.annotations = undefined;
        this.learningProfile = undefined;
        let Faculty = await fetchGet('/api/getFaculty', {name: newFaculty});
        this.directions = Faculty.Directions;
        let criterias = await fetchGet('/api/getCriterias', {faculty: newFaculty});
        if (criterias) {
            this.criterias = JSON.parse(criterias.Crits);
            this.limits = criterias.Limits;
        }
    }

    async getAnnotations() {
        let result = await fetchGet('/api/getAnnotations', {faculty: this.faculty});
        if (result) {
            this.annotations = result.annotations;
            this.learningProfile = result.learningProfile;
        } else console.log('ANN NOT FOUND', this.faculty)
    }

    async getCritsAndSchema() {
        let result = await fetchGet('/api/getCriteriasAndSchema', {faculty: this.faculty});
        if (result) {
            this.criterias = JSON.parse(result.Crits);
            this.schema = JSON.parse(result.CritsSchema);
            this.limits = result.Limits;
        }
    }
}

decorate(StaffContextStore, {
    faculty: observable,
    criterias: observable,
    schema: observable,
    limits: observable,
    annotations: observable,
    learningProfile: observable,
    directions: observable,
});

export default new StaffContextStore();
