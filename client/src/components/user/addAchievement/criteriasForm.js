import React, {Component} from 'react';
import '../../../style/add_portfolio.css';
import DescriptionToTermin from './DescriptionToTermin';
import ReactMarkdown from 'react-markdown';
import criteriasStore from '../../../stores/criteriasStore';
import DescriptionToCriterion from './DescriptionToCriterion';
import {css, jsx} from '@emotion/core';
import CriteriasOptionsSelector from './criteriasOptionSelector';
/** @jsx jsx */

const selectorCss = css`
        :focus {
        box-shadow: unset;
        }
        > * {
            width: 50px !important;
        }
  `;

const animateFadeIn = css`
animation: fade-in .2s ease;
`;

const charsDictionary = {
  'ДСПО': 'Соответствует профилю обучения',
  'ДнСПО': 'Не соответствует профилю обучения',
  'БДнК': 'Без доклада на конференции',
  'СДнК': 'С докладом на конференции',
  'УД': 'Устный доклад',
  'СД': 'Стендовый доклад',
  'Заочн. уч.': 'Заочное участие',
  'Очн. уч.': 'Очное участие',
  'Заруб. изд.': 'Зарубежное издание',
  'Росс. изд.': 'Российское издание',
  'ММК': 'Материалы международной конференции',
};
function getCharacteristicName(char) {
  if (charsDictionary[char]) return charsDictionary[char];
  return char;
}

export default class CriteriasForm extends Component {
  constructor(props) {
    super(props);
    this.handleSelect = this.handleSelect.bind(this);
    this.checkValidity = this.checkValidity.bind(this);

    this.critsTitles = Object.keys(this.props.crits);
    this.critsOffset = this.critsTitles.length == 13 ? 1 : 0;
    if (!this.props.values) {
      if (this.critsTitles[0] === '7а') {
        this.state = {selects: [{id: '7a', num: 2, value: '', options: Object.keys(this.props.crits['7а'])}], length: 1, crit: undefined, values: []};
      } else {
        this.state = {selects: [], length: 1, crit: undefined, values: []};
      }
      // this.props.valuesCallback([this.critsTitles[0]]);
    } else {
      const sel = [];
      let globalCrit = this.props.crits;
      for (let i = 1; i < this.props.values.length; i++) {
        let crit = this.props.crits;
        globalCrit = globalCrit[this.props.values[i-1]];
        let id = '';
        for (let j = 0; j < i; j++) {
          id += this.props.values[j];
          crit = crit[this.props.values[j]];
        }

        sel.push({id: id, num: i + 1, value: this.props.values[i], options: Object.keys(crit)});
      }
      globalCrit = globalCrit[this.props.values[this.props.values.length-1]];
      if (globalCrit && isNaN(globalCrit[Object.keys(globalCrit)[0]])) {
        sel.push({id: 'new', num: this.props.values.length + 1, value: '', options: Object.keys(globalCrit)});
      } else if (globalCrit && this.critsTitles[0] === '7а') {
        if (isNaN(globalCrit[0])) {
          sel.push({id: 'new', num: this.props.values.length + 1, value: '', options: Object.keys(globalCrit)});
        }
      }

      this.state = {
        selects: sel,
        length: this.props.values.length,
        crit: this.props.values[0],
        values: this.props.values.slice(),
      };
      this.checkValidity();
      // this.props.valuesCallback(this.state.values, true);
    }

    // this.state = {selects: [{value:'', options: []}]}
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
      if (!this.props.values && prevProps.values !== this.props.values) {
        if (this.state) {
          this.setState({
            length: 0,
            crit: undefined,
            values: [],
          }, () => {
            this.checkValidity();
          });
        }
      }
    if (this.props.values &&
        prevProps.values !== this.props.values && this.props.values !== this.state.values) {
      const sel = [];
      let globalCrit = this.props.crits;
      for (let i = 1; i < this.props.values.length; i++) {
        let crit = this.props.crits;
        globalCrit = globalCrit[this.props.values[i-1]];
        let id = '';
        for (let j = 0; j < i; j++) {
          id += this.props.values[j];
          crit = crit[this.props.values[j]];
        }

        sel.push({id: id, num: i + 1, value: this.props.values[i], options: Object.keys(crit)});
      }
      if (this.props.values.length > 0) {
          globalCrit = globalCrit[this.props.values[this.props.values.length - 1]];
          if (globalCrit && isNaN(globalCrit[Object.keys(globalCrit)[0]])) {
              sel.push({id: 'new', num: this.props.values.length + 1, value: '', options: Object.keys(globalCrit)});
          } else if (globalCrit && this.critsTitles[0] === '7а') {
              if (isNaN(globalCrit[0])) {
                  sel.push({id: 'new', num: this.props.values.length + 1, value: '', options: Object.keys(globalCrit)});
              }
          }
      }

      const newState = {
        selects: sel,
        length: this.props.values.length,
        crit: this.props.values[0],
        values: this.props.values.slice(),
      };
      if (this.state) {
        this.setState(newState, () => {
          // this.lastSelectRef.focus();
          this.checkValidity();
        });
      } else {
        this.state = newState;
        const keys = Object.keys(globalCrit);
        if (isNaN(Number(keys[0])) && keys.length === 1) {
          this.handleSelect({target: {value: keys[0], id: this.props.values.length}});
        }
        // this.lastSelectRef.focus();
        this.checkValidity();
      }
    }
  }

  checkValidity() {
    const state = {...this.state};
    let crit = this.props.crits;
    let id = '';
    for (let i = 0; i < state.length; i++) {
      id += state.values[i];
      crit = crit[state.values[i]];
    }
    const keys = Object.keys(crit);
    const critsTitles = Object.keys(this.props.crits);
    if (isNaN(Number(keys[0])) || (critsTitles[0] === '7а' && isNaN(Number(crit[0])))) {
      // state.selects.push({id: id + 'new', num: state.length + 1, value: '', options: keys});
      this.props.valuesCallback(state.values, false);
    } else {
      this.props.valuesCallback(state.values, true);
    }
    // this.setState(state);
  }

  componentDidMount() {
    let crits = this.props.crits;
    if (this.state.values && crits) {
      for (let i = 0; i < this.state.values.length; i++) {
        crits = crits[this.state.values[i]];
        if (!crits) return;
      }
      const keys = Object.keys(crits);
      if (isNaN(Number(keys[0])) && Object.keys(crits).length === 1 && this.state.values[0] !== Object.keys(this.props.crits)[0]) {
        this.props.valuesCallback([...this.state.values, keys[0]]);
        // this.setState({values: [...this.state.values, keys[0]]}, () => this.props.valuesCallback(this.state.values, false));
        // this.handleSelect({target: {value: keys[0], id: this.state.values.length}})
      }
    }
  }

  handleSelect(e) {
    e.preventDefault();
    e.stopPropagation();
    try {
      e.target.blur();
    } catch (error) {}

    const state = {...this.state};
    let key = Number(e.target.id);
    if (key === state.length && key === (state.values.length)) {
      state.values.pop();
      state.length -= 1;
    }

    let deep = 0;
    if (key < state.length) {
      let criterion = this.props.crits;
      for (let i = 0; i < key - 1; i++) {
        criterion = criterion[state.values[i]];
      }
      criterion = criterion[e.target.value];


      for (let i = key; i < state.values.length; i++) {
        if (!criterion) break;
        deep += 1;
        criterion = criterion[state.values[i]];
      }
      if (criterion) {
        criterion = this.props.crits;
        state.values[key-1] = e.target.value;
        for (let i = 0; i < state.values.length; i++) {
          if (state.selects[i]) {
            criterion = criterion[state.values[i]];
            state.selects[i].options = Object.keys(criterion);
          }
        }
        this.setState(state, () => {
this.checkValidity();
});
        return;
      } else {
        if (deep > 1) {
          state.values[key - 1] = e.target.value;
          key += deep - 1;
        }
      }

      const d = state.values.length - key;
      for (let i = 0; i < d; i++) {
        const val = state.values.pop();
        state.selects.pop();
        state.length -= 1;
      }

      if (!deep || deep === 1) {
        const val = state.values.pop();
        state.length -= 1;
      }
    }

    if (key == 1) {
      state.crit = e.target.value;
      state.length = 1;
    } else if (!deep || deep === 1) {
      state.length += 1;
    }
    // this.setState(state)

    if (!deep || deep === 1) state.values.push(e.target.value);
    while (state.selects.length >= state.values.length) {
      state.selects.pop();
    }

    // state.length += 1;

    let crit = this.props.crits;
    let id = '';
    for (let i = 0; i < state.values.length; i++) {
      id += state.values[i];
      crit = crit[state.values[i]];
    }
    const keys = Object.keys(crit);
    const critsTitles = Object.keys(this.props.crits);
    if (isNaN(Number(keys[0])) || (critsTitles[0] === '7а' && isNaN(Number(crit[0])))) {
      this.props.valuesCallback(state.values, false);
      state.selects.push({id: id + e.target.value + key, num: state.length + 1, value: '', options: keys, uniq: Math.random()});
    } else {
      this.props.valuesCallback(state.values, true);
    }

    this.setState(state, () => {
      if (this.lastSelectRef) {
        try {
          this.lastSelectRef.scrollIntoView({ block: 'nearest'});
          if (isNaN(Number(keys[0])) && keys.length === 1) {
            this.lastSelectRef.value = keys[0];
            this.lastSelectRef.dispatchEvent(new Event('change'));
          }
          // this.lastSelectRef.focus();
        } catch (e) {}
      }
    });
  }

  render() {
    const getSelectColorClass = (item) => {
      if (this.props.isInvalid && (item.num === this.state.length + 1)) return ' is-invalid';
      if (this.props.isInvalid === false) return ' is-valid';
      if (item.num === this.state.length + 1) return ' is-focused';
      return '';
    };
    return (<form id="critForm">
      {this.props.forceEnabled && <select id='1' key="criterionSelector"
        className={'form-control selectors firstCourse unique7a' + (this.props.critError || this.props.isInvalid ? ' is-invalid' : '') +
        (this.props.isInvalid === false ? ' is-valid' : '')}
        required name="check2" style={{marginTop: '0', cursor: 'pointer'}}
        onChange={this.handleSelect} value={this.state.crit || null}
              disabled={!this.props.forceEnabled && (this.props.disabled || !!this.state.crit)}>
        <option disabled={this.state.crit} value={null}>Выберите критерий</option>
        <option value={this.critsTitles[0]} id="7a">
                    7а (оценки)
        </option>
        <option value={this.critsTitles[1]}>
                    7б (проекты)
        </option>
        <option value={this.critsTitles[2]}>
                    7в (олимпиады)
        </option>
        <option value={this.critsTitles[3]}>
                    8а (призы за науку, гранты)
        </option>
        <option value={this.critsTitles[4]}>
                    8б (статьи / тезисы / конференции)
        </option>
        <option value={this.critsTitles[5]}>
                    9а (обществ. деят. {this.critsOffset ? 'в СПбГУ' : ''})
        </option>
        <option value={this.critsTitles[6]}>
                    9б (информационная деят.)
        </option>
        <option value={this.critsTitles[7]}>
                    10а (награды за творч. деят.)
        </option>
        <option value={this.critsTitles[8]}>
                    10б (произв. искусства)
        </option>
        {this.critsOffset &&
                <option value={this.critsTitles[9]}>
                    10в (обществ. деят. не в СПбГУ)
                </option>
        }
        <option value={this.critsTitles[9 + this.critsOffset]}>
                    11а (призы в спорте)
        </option>
        <option value={this.critsTitles[10 + this.critsOffset]}>
                    11б (участие в спорте)
        </option>
        <option value={this.critsTitles[11 + this.critsOffset]}>
                    11в (ГТО)
        </option>
      </select>}
      {(this.props.critError && this.props.critErrorMessage) &&
            <span className="redText">{this.props.critErrorMessage}</span>}
      <DescriptionToCriterion supressDescription={this.props.supressDescription} crit={this.state.crit}/>
      {this.state.crit && this.state.selects.map((item, index) => {
        return (
          <><div key={item.id} css={animateFadeIn} style={this.props.experimental ? {marginTop: index !== 0 ? '1rem': 0, marginBottom: '1rem'} : {}}>
            <DescriptionToTermin values={item.options}/>
            {this.props.experimental &&
            <CriteriasOptionsSelector
                options={item.options}
                value={item.value}
                disabled={this.props.disabled}
                onChange={this.handleSelect}
                id={item.num.toString()}/>}
            {!this.props.experimental && <select
                ref={(x) => {
if (item.num === this.state.length + 1) this.lastSelectRef = x;
}}
                className={'form-control selectors' + getSelectColorClass(item)} required
              id={item.num.toString()} css={selectorCss} key={item.uniq}
              defaultValue={item.value || ''} onChange={this.handleSelect} disabled={this.props.disabled}
              style={{cursor: 'pointer', marginTop: item.num === 2 ? '0rem' : '0.5rem'}} placeholder='Выберите характеристику'>
              <option disabled value="">Выберите характеристику</option>
              {item.options.map((option) => (
                <option key={option + item.id} value={option} style={{wordWrap: 'break-word', cursor: 'pointer'}}>
                  {getCharacteristicName(option)}
                </option>
              ))}
            </select> }
          </div>
          {this.props.experimental && (item.num !== this.state.selects.length + 1) && <hr/>}
          </>
        );
      })}
    </form>);
  }
}


