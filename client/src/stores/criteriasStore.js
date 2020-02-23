import {decorate, observable} from 'mobx';
import {fetchGet} from "../services/fetchService";

export * from '../services/fetchService'

class CriteriasStore {
    criterias;
    annotations;
    schema;
    learningProfile;
    facultyRawName;

    async getAnnotations(facultyName) {
        let result = await fetchGet('/api/getAnnotations', {faculty: facultyName});
        if (result) {
            this.annotations = result.annotations;
            this.learningProfile = result.learningProfile;
        }
    }

    async getCriteriasForFaculty(facultyName) {
        try {
            const result = await fetchGet('/api/getCriterias', {faculty: facultyName});
            if (result) {
                this.criterias = result;
            }
        } catch(error) {
                console.log(error)
        }
    }

    constructor() {

    }
}

decorate(CriteriasStore, {
    criterias: observable,
    annotations: observable,
    schema: observable,
    learningProfile: observable,
    facultyRawName: observable
});

export default new CriteriasStore();