import React, {useEffect} from 'react';
import criteriasStore from '../../../../stores/criteriasStore';
import {css, jsx} from '@emotion/core';
/** @jsx jsx */

const tableStyle = css`
    @media only screen and (max-device-width: 480px) {
        font-size: small;
        > tr > td {
            padding: 0rem 1rem 1rem 0;
            text-align: center;
        }
    }
    `
const specialStyle = css`
    font-weight: 600 !important;
`

const cellStyle = css`
        height: 2rem;
        color: #963126;
    `;

const cellActiveStyle = css`
        cursor: pointer;
        :hover {
            color: #c3918c;
        }
`;

const critNumberStyle = css`
        width: 2rem;
        display: inline-block;
        font-weight: 500;
        @media only screen and (max-device-width: 480px) {
            width: auto;
            display: block;
        }
    `;
const critDescriptionStyle = css`
        font-weight: 350;
    `;

const critsNames = [
    ['7а', 'оценки'],
    ['7б', 'проекты'],
    ['7в', 'олимпиады'],
    ['8а', 'призы за науку, гранты'],
    ['8б', 'статьи / тезисы / конференции'],
    ['9а', 'активизм и организация'],
    ['9б', 'информирование'],
    ['10а', 'награды за творчество'],
    ['10б', 'искусство и литература'],
    //['10в', 'обществ. деят. не в СПбГУ'],
    ['11а', 'призы в спорте'],
    ['11б', 'участие в спорте'],
    ['11в', 'ГТО']
];

const critsCellFactory = (outputFormatter, isDisabled, isSelected, callback) => {
    return (num) => {
        if (!critsNames[num]) return null;
        return <td key={num} css={[cellStyle, !isDisabled ? cellActiveStyle : '']} onClick={() => {
            if (!isDisabled) {
                callback(outputFormatter(num));
            }
        }}>
            <div css={[critNumberStyle, isSelected ? css`display: inline-block !important; width: 2rem !important; font-weight: 600;` : '']}>{critsNames[num][0]}</div>
            <span css={[critDescriptionStyle, isSelected ? specialStyle : '']}>{critsNames[num][1]}</span>
        </td>
    }
}

const CriterionSelector = React.memo((props) => {
    const cb = (val) => {
        props.updateCharsCb(val);
        if (localStorage.getItem('descriptionsHidden')) {
            const ref = props.descriptionRef();
            if (ref) ref.focus();
        }
    };
    useEffect(() => {
        if (criteriasStore.criterias && Object.keys(criteriasStore.criterias).length === 13 && critsNames.length === 12) {
            critsNames[5][1] = 'активизм и организация в СПбГУ';
            critsNames.splice(9, 0, ['10в', 'обществ. деят. не в СПбГУ'])
        }
    }, []);

    const critsCell = critsCellFactory((num) => ({chars: [props.crits[num]]}), props.disabled, false, cb);
    const selectedCell = critsCellFactory(() => ({}), props.disabled, true, () => props.updateCharsCb({chars: undefined}));

    console.log(props.chars);
    return ((!props.chars) || props.chars.length === 0) && <div>
        <table style={{width: '100%'}} css={tableStyle}>
            <tr>{critsCell(0)}{critsCell(4)}{critsCell(8)}</tr>
            <tr>{critsCell(1)}{critsCell(5)}{critsCell(9)}</tr>
            <tr>{critsCell(2)}{critsCell(6)}{critsCell(10)}</tr>
            <tr>{critsCell(3)}{critsCell(7)}{critsCell(11)}</tr>
            {Object.keys(criteriasStore.criterias).length === 13 &&
            <tr><td></td><td></td>{critsCell(12)}</tr>}
        </table>
    </div> ||
        <div css={
            !props.disabled ? css`
            td {
            :before { display: inline; margin-right: 1rem; font-family: 'Font Awesome 5 Free'; font-weight: 900; content: '\\f0c9' }
            :hover {
                    color: grey;
                    :before  { display: inline; margin-right: 1rem; font-family: 'Font Awesome 5 Free'; font-weight: 900; content: '\\f00d' }
                }
            }
            ` : ''
        }><table style={{width: '100%'}}>{selectedCell(props.crits.indexOf(props.chars[0]))}</table></div>;
}, (prevProps, nextProps) => {
    return false; //prevProps.chars === nextProps.chars && prevProps.updateCharsCb === nextProps.updateCharsCb && prevProps.crits === nextProps.crits;
})

export default CriterionSelector;