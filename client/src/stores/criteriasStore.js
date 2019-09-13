import {decorate, observable} from 'mobx';
import {fetchGet} from "../services/fetchService";

export * from '../services/fetchService'

class CriteriasStore {
    criterias;
    annotations;
    schema;

    async getAnnotations(facultyName) {
        let result = await fetchGet('/api/getAnnotations', {faculty: facultyName});
        this.annotations = result
    }

    getCriteriasForFaculty(facultyName) {
        fetchGet('/api/getCriterias', {faculty: facultyName}).then((result) => {
            console.log('RECEIVED CRITS', result);
            this.criterias = result;
        })
    }

    constructor() {

    }
}

decorate(CriteriasStore, {
    criterias: observable,
    annotations: observable,
    schema: observable
});

export default new CriteriasStore();