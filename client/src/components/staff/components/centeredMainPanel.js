import React from 'react';
import MainPanel from './mainPanel';

function CenteredMainPanel(props) {
    return <main className="row" style={{'justifyContent': 'center', 'display': 'flex'}}>
        <MainPanel {...props} />
    </main>;
}

export default CenteredMainPanel;
