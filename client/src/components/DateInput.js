import React, {Component} from 'react';
import '../style/user_main.css';

class DateInput extends Component {
    constructor(props) {
        super(props);
        this.state = {isValid: true, value: ''};
        this.handleDateChange = this.handleDateChange.bind(this);
        this.handleDateKeyUp = this.handleDateKeyUp.bind(this)
    };

    handleDateChange(e) {
        let st = this.state;
        st.value = e.target.value;
        this.setState(st)
    }

    handleDateKeyUp(e) {
        let value = e.target.value ? e.target.value : '';
        if (/\d/.test(e.key))
            value += e.key;
        if (e.keyCode == 8 && value.length > 0) value = value.substr(0, value.length - 1);
        let st = this.state;

        if (e.keyCode != 8) {

            let formattedData = formatDate(value);
            if (formattedData != value) {
                st.value = formattedData
            } else st.value = value
        } else st.value = value;

        this.setState(st);
        this.props.updater(st.value)
    }

    render() {
        return (
            <input style={{
                "width": "8rem",
                "margin-right": "0.5rem",
                "text-align": "center",
                "marginTop": "auto",
                "marginBottom": "auto"
            }}
                   className={"form-control date achDate" + (!this.props.isValid ? " is-invalid" : "")} type="text"
                   placeholder='дд.мм.гггг' onKeyDown={this.handleDateKeyUp} value={this.state.value}/>

        )
    }
}

function formatDate(input) {

    if (/\D\/$/.test(input)) input = input.substr(0, input.length - 3);
    var values = input.split('.').map(function (v) {
        return v.replace(/\D/g, '')
    });
    if (values[0]) values[0] = checkValue(values[0], 31);
    if (values[1]) values[1] = checkValue(values[1], 12);
    var output = values.map(function (v, i) {
        return v.length == 2 && i < 2 ? v + '.' : v;
    });
    return output.join('').substr(0, 10)
}

//for data input formating
function checkValue(str, max) {
    if (str.charAt(0) !== '0' || str == '00') {
        var num = parseInt(str);
        if (isNaN(num) || num <= 0 || num > max) num = 1;
        str = num > parseInt(max.toString().charAt(0)) && num.toString().length == 1 ? '0' + num : num.toString();
    }
    return str;
}

export default DateInput