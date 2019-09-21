import {decorate, observable} from 'mobx';
import {fetchGet} from "../services/fetchService";

export * from '../services/fetchService'

class CriteriasStore {
    criterias;
    annotations;
    schema;
    learningProfile;

    async getAnnotations(facultyName) {
        let result = await fetchGet('/api/getAnnotations', {faculty: facultyName});
        if (result) {
            this.annotations = result.annotations
            this.learningProfile = result.learningProfile
        }
    }

    getCriteriasForFaculty(facultyName) {
        fetchGet('/api/getCriterias', {faculty: facultyName}).then((result) => {
            if (result) {
                console.log('RECEIVED CRITS', result);
                this.criterias = result;
            }
        })
    }

    constructor() {

    }
}

decorate(CriteriasStore, {
    criterias: observable,
    annotations: observable,
    schema: observable,
    learningProfile: observable
});

export default new CriteriasStore();