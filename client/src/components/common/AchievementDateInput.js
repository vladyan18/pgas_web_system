import React, {Component} from 'react';
import '../../style/user_main.css';
import DateInput from './DateInput';

class AchievementDateInput extends Component {
  constructor(props) {
    super(props);
    this.state = {isValid: true, value: '', validMessage: ''};
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(value) {
    const st = this.state;
    let r = /\d{2}.\d{2}.\d{4}/.test(value);
    st.isValid = r;
    st.value = value;
    if (!r) {
      st.validMessage = 'Неверная дата';
      st.isValid = false;
    } else {
      const d = makeDate(value);
      r = (d >= new Date('2019-09-01') && d <= new Date('2020-08-31'));
      if (!r) {
        st.validMessage = 'Дата не входит в оцениваемый промежуток (01.09.2019 — 31.08.2020)';
        st.isValid = false;
      } else st.isValid = true;
    }
    this.setState(st);

    if (this.props.updater) this.props.updater(st.isValid, st.value);
  }

  render() {
    return (<>
      <DateInput dateRef={this.props.dateRef} isValid={(this.state.isValid === true) && this.props.isValid} updater={this.handleChange}
        defaultValue={this.props.defaultValue} disabled={this.props.disabled}/>
      {(!this.state.isValid || !this.props.isValid) &&
            <span className="redText">{this.state.validMessage}</span>}</>);
  }
}

function makeDate(d) {
  if (!d) return undefined;
  const date = d.split('.');
  return new Date(date[2] + '-' + date[1] + '-' + date[0]);
}

export default AchievementDateInput;
