import React, {Component} from 'react';
import '../../../../style/add_portfolio.css';
import DescriptionToTermin from './DescriptionToTermin';
import ReactMarkdown from 'react-markdown';
import criteriasStore from '../../../../stores/criteriasStore';

export default class CriteriasForm extends Component {
  constructor(props) {
    super(props);
    this.handleSelect = this.handleSelect.bind(this);
    this.checkValidity = this.checkValidity.bind(this);

    this.critsTitles = Object.keys(this.props.crits);
    this.critsOffset = this.critsTitles.length == 13 ? 1 : 0;
    if (!this.props.values) {
      if (this.critsTitles[0] === '7а') {
        this.state = {selects: [{id: '7a', num: 2, value: '', options: Object.keys(this.props.crits['7а'])}], length: 1, crit: this.critsTitles[0], values: ['7а']};
      } else {
        this.state = {selects: [], length: 1, crit: this.critsTitles[0], values: []};
      }
      this.props.valuesCallback([this.critsTitles[0]]);
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
      //this.props.valuesCallback(this.state.values, true);
    }

    // this.state = {selects: [{value:'', options: []}]}
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    console.log('UPDATE', this.props.values, prevProps.values)
    if (this.props.values && this.props.values.length > 1
        && prevProps.values !== this.props.values && this.props.values !== this.state.values) {
      console.log(this.props.values, prevProps.values)
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

      this.setState({
        selects: sel,
        length: this.props.values.length,
        crit: this.props.values[0],
        values: this.props.values.slice(),
      }, () => this.checkValidity());
    }
  }

  checkValidity() {
    console.log('CHECK', this.state.values);
    const state = {...this.state};
    let crit = this.props.crits;
    let id = '';
    const val = {...state.values};
    for (let i = 0; i < state.length; i++) {
      id += state.values[i];
      crit = crit[state.values[i]];
    }
    const keys = Object.keys(crit);
    const critsTitles = Object.keys(this.props.crits);
    if (isNaN(Number(keys[0])) || (critsTitles[0] === '7а' && isNaN(Number(crit[0])))) {
      //state.selects.push({id: id + 'new', num: state.length + 1, value: '', options: keys});
      this.props.valuesCallback(state.values, false);
    } else {
      this.props.valuesCallback(state.values, true);
    }
    this.setState(state);
  }

  handleSelect(e) {
    e.preventDefault();
    e.stopPropagation();

    const state = {...this.state};
    const key = Number(e.target.id);
    if (key === state.length && key === (state.values.length)) {
      state.values.pop();
      state.length -= 1;
    }


    if (key < state.length) {
      let criterion = this.props.crits;
      for (let i = 0; i < key - 1; i++) {
        criterion = criterion[state.values[i]];
      }
      criterion = criterion[e.target.value];

      for (let i = key; i < state.values.length; i++) {
        if (!criterion) break;
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
        this.setState(state);
        return;
      }

      const d = state.values.length - key;
      for (let i = 0; i < d; i++) {
        state.values.pop();
        state.selects.pop();
        state.length -= 1;
      }

      state.values.pop();
      state.length -= 1;
    }

    if (key == 1) {
      state.crit = e.target.value;
      state.length = 1;
    } else state.length += 1;
    // this.setState(state)

    state.values.push(e.target.value);
    while (state.selects.length >= state.values.length) {
      state.selects.pop();
    }

    // state.length += 1;

    let crit = this.props.crits;
    let id = '';
    const val = {...state.values};
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

    this.setState(state);
  }

  render() {
    const getSelectColorClass = (item) => {
      if (this.props.isInvalid && (item.num === this.state.length + 1)) return ' is-invalid';
      if (this.props.isInvalid === false) return ' is-valid';
      if (item.num === this.state.length + 1) return ' is-focused';
      return '';
    };
    return (<form id="critForm">
      <select id='1'
        className={'form-control selectors firstCourse unique7a' + +(this.props.critError ? ' is-invalid' : '') +
        (this.props.isInvalid === false ? ' is-valid' : '')}
        required name="check2" style={{marginTop: '0', cursor: 'pointer'}}
        onChange={this.handleSelect} value={this.state.crit} disabled={this.props.disabled}>
        <option disabled>Критерий</option>
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
      </select>
      {(this.props.critError && this.props.critErrorMessage) &&
            <span className="redText">{this.props.critErrorMessage}</span>}
      {(!this.props.supressDescription && criteriasStore.annotations && criteriasStore.annotations[this.state.crit]) &&
            <div id="critDescr" className="desc_selectors blue_bg" style={{width: '100%', paddingTop: '0.4rem'}}>
              <div style={{marginLeft: 'auto', marginRight: '-0.5rem', width: '1rem', paddingTop: '0', cursor: 'pointer', color: 'darkcyan'}}
              onClick={() => this.setState({critDescrHidden: !this.state.critDescrHidden})}>
                <i className={"fa " + (this.state.critDescrHidden ? "fa-expand" : "fa-compress")} title="свернуть"/>
              </div>
              <p style={ this.state.critDescrHidden ?
                {paddingTop: '0', maxHeight: '1.5rem', overflow: 'hidden', textOverflow: 'ellipse', marginBottom: '0px'} :
                  {paddingTop: '0'}
              }  id="desc_criterion_first">
                <ReactMarkdown source={criteriasStore.annotations[this.state.crit]} linkTarget={() => '_blank'}/>
              </p>
              {this.state.critDescrHidden && <div style={{textAlign: 'center', fontSize:'large', color:'darkcyan', cursor: 'pointer'}}
                                                  onClick={() => this.setState({critDescrHidden: !this.state.critDescrHidden})}
              ><b>...</b></div>}
            </div>}
      {this.state.selects.map((item, index) => {
        return (
          <div key={item.id}>
            <DescriptionToTermin values={item.options}/>
            <select className={'form-control selectors' + getSelectColorClass(item)} required
              id={item.num.toString()} key={item.uniq}
              defaultValue={item.value || ''} onChange={this.handleSelect} disabled={this.props.disabled}
              style={{cursor: 'pointer'}} placeholder='Выберите характеристику'>
              <option disabled value="">Выберите характеристику</option>
              {item.options.map((option) => (
                <option key={option + item.id} value={option} style={{wordWrap: 'break-word', cursor: 'pointer'}}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        );
      })}
    </form>);
  }
}


