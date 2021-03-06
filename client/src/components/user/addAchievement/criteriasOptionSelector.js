import React, {useState, useEffect} from 'react';
import criteriasStore from '../../../stores/criteriasStore';
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
    'ММК': 'Материалы международной конференции',
    'Документ, удостоверяющий исключительное право студента на достигнутый им научный (научно-методический, научно-технический, научно-творческий) результат интеллектуальной деятельности (патент, свидетельство)': 'Исключительное право на достигнутый научный результат интеллектуальной деятельности (патент, свидетельство)',
};

function getCharacteristicName(char) {
    if (charsDictionary[char]) return charsDictionary[char];
    return char;
}

const CriteriasOptionsSelector = React.memo(({options, value, disabled, onChange, id}) => {
    const [selected, setSelected] = useState(value);

    function onCheck(e, obj) {
        e.preventDefault();
        e.stopPropagation();
        console.log('ONCHECK', obj.target.value, obj.target.id);
        if (disabled) return;
        const value = obj.target.value;
        const result = {target: {value, id}};
        result.preventDefault = () => {};
        result.stopPropagation = () => {};
        onChange(result);
        setSelected(value);
    }
    return <><div>
        {options.map((option) => <div className='form_radio' style={{display: 'flex', paddingBottom: '0.4rem', paddingTop: '0.4rem', cursor: !disabled && 'pointer'}} css={css`:hover {color: #42c042;};`} onClick={(e) => onCheck(e, {target: { value: option }})}>
            <input type='radio' disabled={disabled} id={option} value={option}
                   style={{cursor: !disabled && 'pointer', display: 'block', margin: 'auto 0 auto 0', minWidth: '1rem'}}
                   checked={selected === option}/>
            <label htmlFor={option} style={{margin: '0 0 0 1rem', display: 'block', cursor: !disabled && 'pointer',
            color: (selected === option) ? 'green' : (selected ? '#999' : 'inherit')}}>{getCharacteristicName(option)}</label>
            </div>)}
    </div>

    </>;
}, (prevProps, nextProps) => {
    return prevProps.options === nextProps.options && prevProps.value === nextProps.value && prevProps.disabled === nextProps.disabled;
});

export default CriteriasOptionsSelector;
