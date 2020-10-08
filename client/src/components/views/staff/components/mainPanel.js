import {withRouter} from "react-router";
import styled from "@emotion/styled";
import React from "react";
import staffContextStore from "../../../../stores/staff/staffContextStore";

const Panel = styled.div`
    background-color: white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, .2);
    padding: 0 2rem 1rem;
    @media only screen and (max-device-width: 480px) {
        padding: 0 1rem;
    }
`;

function MainPanel({ heading, ...props }) {
    return <main>
        <div id="panel" className="row justify_center">
            <Panel className="col-md-9">
                <div className="profile" style={{"display": "flex", "justify-content": "space-between", margin: "0"}} >
                    <div className="centered_ver">
                        <p className="headline">
                            { heading }
                        </p>
                    </div>
                    <div className="centered_ver" style={{"display": "flex"}}>
                        <button id="DeleteButton" className="btn btn-secondary"
                                value="Назад" onClick={() => {
                            props.history.goBack()
                        }}>Назад
                        </button>
                    </div>
                </div>
                <hr className="hr_blue" style={{marginTop: '0', marginBottom: '1rem'}}/>
                <div>
                    {props.children && props.children}
                </div>
            </Panel>
        </div>
    </main>
}


export default withRouter(MainPanel)