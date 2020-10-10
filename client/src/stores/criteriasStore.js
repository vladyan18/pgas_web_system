import {decorate, observable} from 'mobx';
import {fetchGet} from "../services/fetchService";

export * from '../services/fetchService' // TODO WTF

class CriteriasStore {
    criterias;
    annotations;
    schema;
    limits;
    learningProfile;
    languagesForPublications;
    facultyRawName;

    async getAnnotations(facultyName) {
        let result = await fetchGet('/api/getAnnotations', {faculty: facultyName});
        if (result) {
            this.annotations = result.annotations;
            localStorage.setItem('annotations', JSON.stringify(result.annotations));
            this.learningProfile = result.learningProfile;
            this.languagesForPublications = result.languagesForPublications;
        }
    }

    async getCriteriasForFaculty(facultyName) {
        try {
            const result = await fetchGet('/api/getCriterias', {faculty: facultyName});
            if (result) {
                this.criterias = JSON.parse(result.Crits);
                localStorage.setItem('annotations', result.Crits);
                this.limits = result.Limits;
            }
        } catch(error) {
                console.log(error)
        }
    }
}

decorate(CriteriasStore, {
    criterias: observable,
    annotations: observable,
    schema: observable,
    limits: observable,
    learningProfile: observable,
    languagesForPublications: observable,
    facultyRawName: observable
});

const store = new CriteriasStore()

if (localStorage.getItem('annotations') !== '') {
    try {
        store.annotations = JSON.parse(localStorage.getItem('annotations'));
    } catch (e) {
        localStorage.removeItem('annotations');
    }
}

if (localStorage.getItem('criterias') !== '') {
    try {
        store.criterias = JSON.parse(localStorage.getItem('criterias'));
    } catch (e) {
        localStorage.removeItem('criterias');
    }
}

export default store;