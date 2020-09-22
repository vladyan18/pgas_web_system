import React, {useState} from 'react';
import criteriasStore from '../../../../stores/criteriasStore';
import {css, jsx} from '@emotion/core';
/** @jsx jsx */

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
    'ММК': 'Материалы международной конференции'
};

function getCharacteristicName(char) {
    if (charsDictionary[char]) return charsDictionary[char];
    return char;
}

const CriteriasOptionsSelector = React.memo(({options, value, disabled, onChange, id}) => {
    const [selected, setSelected] = useState(value);
    function onCheck(e) {
        if (disabled) return;
        const value = e.target.value;
        setSelected(value);
        const result = {target: {value, id}};
        result.preventDefault = () => {};
        result.stopPropagation = () => {};
        onChange(result);
    }
    return <div style={{marginBottom: '2.5rem'}}>
        {options.map((option) => <div style={{display: 'flex', marginBottom: '0.6rem', cursor: !disabled && 'pointer'}} css={css`:hover {color: #90c290 !important;};`} onClick={() => onCheck({target: { value: option }})}>
            <input type='radio' disabled={disabled} id={option} value={option} style={{cursor: !disabled && 'pointer', display: 'block', margin: 'auto 0 auto 0'}} checked={selected === option} onChange={onCheck}/>
            <label htmlFor={option} style={{margin: '0 0 0 1rem', display: 'block', cursor: !disabled && 'pointer',
            color: (selected === option) ? 'green' : (selected ? 'grey' : 'inherit')}}>{getCharacteristicName(option)}</label>
            </div>)}
    </div>
}, (prevProps, nextProps) => {
    return prevProps.options === nextProps.options && prevProps.value === nextProps.value && prevProps.disabled === nextProps.disabled;
})

export default CriteriasOptionsSelector;