import React from 'react';
import {Panel, HorizontalLine} from './style';
import {css, jsx} from '@emotion/core';
/** @jsx jsx */

function UserMainPanel({children, title, ...props}) {
    return <Panel className="col-md-9" css={props.panelCSS}>
        <div className="profile" style={{'display': 'flex', 'justify-content': 'space-between', 'margin': '0'}}>
            <p className="headline" style={{'margin-bottom': 'auto'}}>
                {title}
            </p>
            <div style={{'margin-top': 'auto'}}>
                {props.buttons && props.buttons}
            </div>
        </div>


        <HorizontalLine/>
        <div>
            {children}
        </div>
    </Panel>;
}

export default UserMainPanel;
