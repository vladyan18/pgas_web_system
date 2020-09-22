import React, {useEffect, useState} from 'react';
import {css, jsx} from '@emotion/core';
import criteriasStore, {fetchSendObj} from "../../../../stores/criteriasStore";
import ReactMarkdown from "react-markdown";
import HelpButton from "../helpButton";
import {Popover} from "react-bootstrap";
import userPersonalStore from "../../../../stores/userPersonalStore";
import AchievementDateInput from "../../../AchievementDateInput";
/** @jsx jsx */

const getLineColor = function(isInvalid) {
    if (isInvalid === false) return '#19b319';
    if (isInvalid === true) return '#dc3545';
    return undefined;
};

function getValidityClass(val) {
    if  (val) {
        return ' is-invalid';
    }
    if (val === false) {
        return ' is-valid';
    }
    return '';
}

function DateFieldLabel(props) {
    const mainColor = '#595959';
    return <div style={{display: 'flex'}}>
        <div>
            <label style={{'marginTop': 'auto', width: '10rem'}} className="form-check-label">
                <b>Дата достижения:</b>
            </label>
            <label style={{cursor: 'pointer', color: '#595959', marginLeft: 0, marginBottom: 0}}>
                <input type="checkbox" id="defaultCheck1" onChange={(e) => props.switchDiapasone()}
                       style={{cursor: 'pointer', color: mainColor}} checked={props.hasDiapasone}
                       disabled={props.disabled}
                />
                <span style={{marginLeft: '0.5rem', color: mainColor,
                    fontWeight: '350',
                    fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol"'
                }}>диапазон</span>
            </label>
        </div>
    </div>
}

function makeDate(d) {
    if (!d) return undefined;
    const date = d.split('.');
    return new Date(date[2] + '-' + date[1] + '-' + date[0]);
}

function DateField({defaultValue, onValidityChange, onDateChange, dateRef, disabled}) {
    const [hasDiapasone, setDiapasone] = useState(defaultValue && !!defaultValue.endDate);
    const [isDiapasoneValid, setDiapasoneValid] = useState(defaultValue ? !!defaultValue : undefined);

    const validityDefaultValues = defaultValue ? [!!defaultValue.startDate, !!defaultValue.endDate] : [undefined, undefined];
    const [validity, setValidity] = useState(validityDefaultValues);

    const [startDate, setStartDate] = useState(defaultValue ? defaultValue.startDate : undefined);
    const [endDate, setEndDate] = useState(defaultValue ? defaultValue.endDate : undefined);
    const [formInvalidity, setFormInvalidity] = useState(defaultValue ? false : undefined);

    const onDateChangeFactory = (type) => {
        return (isValid, value) => {
            const newValidity = [...validity];
            if (type && type === 'end') {
                newValidity[1] = isValid;
                setEndDate(value);
            } else {
                newValidity[0] = isValid;
                setStartDate(value);
            }
            setValidity(newValidity);
        }
    };

    useEffect(() => {
        validateDiapasone();
        onDateChange(hasDiapasone, {startDate, endDate});
    }, [startDate, endDate, hasDiapasone]);

    useEffect(() => {
        let newFormInValidity = undefined;
        if (validity[0] === false || validity[1] === false || (hasDiapasone && isDiapasoneValid === false)) newFormInValidity = true;
        if (validity[0] === true) newFormInValidity = false;
        if (hasDiapasone && (validity[0] !== undefined || validity[1] !== undefined)) {
            newFormInValidity = newFormInValidity || validity[1] !== true || isDiapasoneValid !== true
        }
        setFormInvalidity(newFormInValidity);
        onValidityChange(newFormInValidity === false);
    }, [validity, isDiapasoneValid]);

    const dateChangeCb = onDateChangeFactory();
    const startDateChangeCb = onDateChangeFactory('start');
    const endDateChangeCb = onDateChangeFactory('end');

    function validateDiapasone() {
        if (validity[0] === undefined || validity[1] === undefined)  {
            setDiapasoneValid(undefined);
            return;
        }

        if (hasDiapasone && validity[0] && validity[1]) {
            console.log('DP', endDate, startDate,  makeDate(endDate) > makeDate(startDate))
            setDiapasoneValid(makeDate(endDate) > makeDate(startDate));
        }
    }


    return <div className="form-group form_elem_with_left_border" style={{'marginTop': '1rem',
        'borderColor': getLineColor(formInvalidity)
    }}>

        <DateFieldLabel
            hasDiapasone={hasDiapasone}
            disabled={disabled}
            switchDiapasone={() => {
                    setDiapasone(!hasDiapasone);
                    setValidity([validity[0], undefined]);
                    setDiapasoneValid(undefined);
                }
            }
        />


        {(hasDiapasone && isDiapasoneValid === false) &&
        <span className="redText">Начальная дата не может быть после конечной</span>}
        <div id="Date" style={{
            'display': 'flex',
            'alignItems': 'center',
            margin: '0.7rem 0 0.2rem 0'
        }}>
            {!hasDiapasone &&
            <AchievementDateInput dateRef={dateRef} className="form-control" isValid={validity[0]}
                                  updater={dateChangeCb}
                                  defaultValue={startDate}
                                  disabled={disabled}
            />}
            {hasDiapasone && <table>
                <tbody>
                <tr>
                    <td >С: </td>
                    <td style={{paddingLeft: '1rem'}}><AchievementDateInput dateRef={dateRef} className="form-control"
                                              isValid={validity[0]}
                                              updater={startDateChangeCb}
                                              defaultValue={startDate}
                                              disabled={disabled}
                    /></td>
                </tr>
                <tr>
                    <td>По: </td>
                    <td style={{paddingLeft: '1rem'}}><AchievementDateInput className="form-control"
                                              isValid={validity[1]}
                                              updater={endDateChangeCb}
                                              defaultValue={endDate}
                                              disabled={disabled}
                    /></td>
                </tr>
                </tbody>
            </table>}
        </div>
        <div style={{fontSize: 'small', color: 'grey', textAlign: 'center', width: '10rem'}}>01.09.2019 — 31.08.2020</div>
    </div>
}

export default DateField;


