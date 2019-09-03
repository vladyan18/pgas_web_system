import {decorate, observable} from 'mobx';

class CriteriasStore {
    criterias;

    constructor() {

    }
}

decorate(CriteriasStore, {
    criterias: observable
});

export default new CriteriasStore();