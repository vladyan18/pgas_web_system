import React, {Component} from 'react';
import '../style/user_main.css';
import MaskedInput from 'react-text-mask';

class DateInput extends Component {
  constructor(props) {
    super(props);
    this.state = {isValid: true, value: ''};
    if (props.defaultValue) this.state.value = props.defaultValue;
    this.handleDateChange = this.handleDateChange.bind(this);
  };

  handleDateChangeLeg(e) {
    const st = this.state;
    st.value = e.target.value;
    this.setState(st);
  }

  handleDateChange(e) {
    const value = e.target.value ? e.target.value : '';

    const st = this.state;
    st.value = value;

    this.props.updater(st.value);
    this.setState(st);
  }

  render() {
    return (
      <MaskedInput style={{
        'maxWidth': '10rem',
        'marginRight': '0.5rem',
        'textAlign': 'center',
        'marginTop': 'auto',
        'marginBottom': 'auto',
      }} guide={true} keepCharPositions={true}
      mask={[/[0-3]/, /\d/, '.', /[0-1]/, /\d/, '.', /\d/, /\d/, /\d/, /\d/]}
      className={'form-control date achDate' + (this.props.isValid === false ? ' is-invalid' : '') +
      (this.props.isValid ? ' is-valid' : '')} type="text"
      placeholder='дд.мм.гггг' inputmode="numeric" onChange={this.handleDateChange} value={this.state.value}
                   ref={this.props.dateRef}
      disabled={this.props.disabled}/>

    );
  }
}

function formatDate(input) {
  if (/\D\/$/.test(input)) input = input.substr(0, input.length - 3);
  const values = input.split('.').map(function(v) {
    return v.replace(/\D/g, '');
  });
  if (values[0]) values[0] = checkValue(values[0], 31);
  if (values[1]) values[1] = checkValue(values[1], 12);
  const output = values.map(function(v, i) {
    return v.length == 2 && i < 2 ? v + '.' : v;
  });
  return output.join('').substr(0, 10);
}

// for data input formating
function checkValue(str, max) {
  if (str.charAt(0) !== '0' || str == '00') {
    let num = parseInt(str);
    if (isNaN(num) || num <= 0 || num > max) num = 1;
    str = num > parseInt(max.toString().charAt(0)) && num.toString().length == 1 ? '0' + num : num.toString();
  }
  return str;
}

export default DateInput;
