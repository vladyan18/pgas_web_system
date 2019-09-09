import {decorate, observable} from 'mobx';
import {fetchGet} from "../services/fetchService";

export * from '../services/fetchService'

class CriteriasStore {
    criterias;

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
    criterias: observable
});

export default new CriteriasStore();