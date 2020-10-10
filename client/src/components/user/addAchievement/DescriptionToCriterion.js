import React, {useState} from 'react';
import {css, jsx} from '@emotion/core';
import criteriasStore from '../../../stores/criteriasStore';
import ReactMarkdown from 'react-markdown';
/** @jsx jsx */

const descrStyle = css`
    @media only screen and (max-device-width: 768px) {
        font-size: small;
    }
`;

function DescriptionToCriterion(props) {
    const [isHidden, setHidden] = useState(localStorage.getItem('descriptionsHidden'));
    const switchHidden = () => {
        if (isHidden) localStorage.removeItem('descriptionsHidden');
        if (!isHidden) localStorage.setItem('descriptionsHidden', 'true');
        setHidden(!isHidden);
    };

    if (!props.crit || props.supressDescription || !criteriasStore.annotations || !criteriasStore.annotations[props.crit]) {
return null;
}

    return (
        <div id="critDescr" className="desc_selectors blue_bg" style={{width: '100%', paddingTop: '0.4rem'}} css={descrStyle}>
            <div style={{marginLeft: 'auto', marginRight: '-0.5rem', width: '1rem', paddingTop: '0', cursor: 'pointer', color: 'darkcyan'}}
                 onClick={switchHidden}>
                <i className={'fa ' + (isHidden ? 'fa-expand' : 'fa-compress')} title="свернуть"/>
            </div>
            <p style={ isHidden ?
                {paddingTop: '0', maxHeight: '1.5rem', overflow: 'hidden', textOverflow: 'ellipse', marginBottom: '0px'} :
                {paddingTop: '0'}
            } id="desc_criterion_first">
                <ReactMarkdown source={criteriasStore.annotations[props.crit]} linkTarget={() => '_blank'}/>
            </p>
            {isHidden && <div style={{textAlign: 'center', fontSize: 'large', color: 'darkcyan', cursor: 'pointer'}}
                                                onClick={switchHidden}
            ><b>...</b></div>}
        </div>
    );
}

export default DescriptionToCriterion;


