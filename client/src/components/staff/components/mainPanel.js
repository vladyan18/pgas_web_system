import {withRouter} from 'react-router';
import styled from '@emotion/styled';
import React from 'react';
import staffContextStore from '../../../stores/staff/staffContextStore';

const Panel = styled.div`
    background-color: white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, .2);
    padding: 0 2rem 1rem;
    @media only screen and (max-device-width: 480px) {
        padding: 0 1rem;
    }
`;

function MainPanel({ heading, panelClass, ...props }) {
    return <div className={panelClass || 'col-md-9'} style={{margin: 0, padding: 0}}>
            <Panel style={{width: '100%', paddingTop: '1rem'}}>
                <div className="profile" style={{'display': 'flex', 'justify-content': 'space-between', 'margin': '0 0 1rem 0'}} >
                    <p className="headline" style={{marginBottom: 0}}>
                        { heading }
                    </p>
                    <div className="centered_ver" style={{'display': 'flex'}}>
                        <button id="DeleteButton" className="btn btn-secondary"
                                value="Назад" onClick={() => {
                            props.history.goBack();
                        }}>Назад
                        </button>
                        {
                            props.buttons && props.buttons
                        }
                    </div>
                </div>
                <hr className="hr_blue" style={{marginTop: '0', marginBottom: '1rem'}}/>
                <div>
                    {props.children && props.children}
                </div>
            </Panel>
    </div>;
}


export default withRouter(MainPanel);
