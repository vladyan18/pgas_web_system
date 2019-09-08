import React, {Component} from 'react';
import '../../../../style/add_portfolio.css';
import DescriptionToCriteria from "./DescriptionToCriteria";
import DescriptionToTermin from "./DescriptionToTermin";

export default class CriteriasForm extends Component {

    constructor(props) {
        super(props);
        this.handleSelect = this.handleSelect.bind(this);
        if (!this.props.values) {
            this.state = {selects: [], length: 1, crit: '1 (7а)', values: []};
            this.props.valuesCallback(['1 (7а)'])
        } else {
            let sel = [];
            for (let i = 1; i < this.props.values.length; i++) {
                let crit = this.props.crits;
                let id = '';
                for (let j = 0; j < i; j++) {
                    id += this.props.values[j];
                    crit = crit[this.props.values[j]]
                }

                sel.push({id: id, num: i + 1, value: this.props.values[i], options: Object.keys(crit)});
            }
            this.state = {
                selects: sel,
                length: this.props.values.length,
                crit: this.props.values[0],
                values: this.props.values
            };
            this.props.valuesCallback(this.state.values);

        }

        //this.state = {selects: [{value:'', options: []}]}
    }

    handleSelect(e) {
        let state = this.state;
        let key = Number(e.target.id);
        console.log(key, state.length, state.values.length);
        if (key == state.length && key == state.values.length) {
            state.values.pop();
        }

        if (key < state.length) {
            let d = state.length - key + 1;
            for (let i = 0; i < d; i++) {
                state.values.pop();
                state.selects.pop();
                state.length -= 1;
            }

        }

        if (key == 1) {
            state.crit = e.target.value;
            state.length = 1
        }

        state.values.push(e.target.value);

        let crit = this.props.crits;
        let id = '';
        for (let i = 0; i < state.length; i++) {
            id += state.values[i];
            crit = crit[state.values[i]]
        }
        let keys = Object.keys(crit);
        console.log('S: ' + state.values);
        if (isNaN(Number(crit[keys[0]]))) {
            this.props.valuesCallback(null);
            state.selects.push({id: id, num: state.length + 1, value: '', options: Object.keys(crit)});
            state.length += 1

        } else
            this.props.valuesCallback(state.values);


        this.setState(state)
    }

    render() {
        return (<form id="critForm">
            <label htmlFor="check2" className="label_direction">Критерий:</label>
            <br/>
            <select id='1' className="form-control selectors firstCourse unique7a" required name="check2"
                    onChange={this.handleSelect} defaultValue={this.state.crit}>
                <option disabled>Критерий</option>
                <option value="1 (7а)" id="7a">
                    7а (оценки)
                </option>
                <option value="2 (7б)">
                    7б (проекты)
                </option>
                <option value="3 (7в)">
                    7в (олимпиады)
                </option>
                <option value="4 (8а)">
                    8а (призы за науку, гранты)
                </option>
                <option value="5 (8б)">
                    8б (статьи)
                </option>
                <option value="6 (9а)">
                    9а (обществ. деят. в СПбГУ)
                </option>
                <option value="7 (9б)">
                    9б (информационная деят.)
                </option>
                <option value="8 (10а)">
                    10а (награды за творч. деят.)
                </option>
                <option value="9 (10б)">
                    10б (произв. искусства)
                </option>
                <option value="10 (10в)">
                    10в (обществ. деят.)
                </option>
                <option value="11 (11а)">
                    11а (призы в спорте)
                </option>
                <option value="12 (11б)">
                    11б (участие в спорте)
                </option>
                <option value="13 (11в)">
                    11в (ГТО)
                </option>
            </select>
            <DescriptionToCriteria crit={this.state.crit}/>
            {this.state.selects.map((item) => (
                <div>
                    <DescriptionToTermin values={item.options}/>
                    <select className="form-control selectors" required key={item.id} id={item.num.toString()}
                            defaultValue={item.value} f onChange={this.handleSelect}>
                        <option disabled value="">Выберите характеристику</option>
                        {item.options.map((option) => (
                            <option value={option}>
                                {option}
                            </option>
                        ))}
                    </select>
                </div>
            ))}
        </form>)
    }
}

