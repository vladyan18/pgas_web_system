import React, {Component} from 'react';
import '../../../style/user_main.css';
import {observer} from "mobx-react";
import CriteriasTableViewer from "./criteriasManagePage/criteriasTableViewer";
import staffContextStore from "../../../stores/staff/staffContextStore";

class StaffCriteriasPage extends Component {
    constructor(props) {
        super(props);
    };

    componentWillMount() {
        if (!staffContextStore.criterias || !staffContextStore.schema) {
            staffContextStore.getCritsAndSchema().then()
        }
    }

    render() {
        return (
            <main>
                <div id="panel" className="row justify_center">
                    <div className="col-9 general">
                        <div className="profile" style={{"display": "flex", "justify-content": "space-between"}}>
                            <div className="centered_ver">
                                <p className="headline">
                                    Критерии
                                </p>
                            </div>
                            <div className="centered_ver">
                                <button id="DeleteButton" className="btn btn-primary"
                                        value="Примечания" onClick={() => {
                                    this.props.history.push('/staff/manageAnnotations')
                                }}>Примечания
                                </button>
                            </div>
                            <div className="centered_ver">
                                <button id="DeleteButton" className="btn btn-secondary"
                                        value="Назад" onClick={() => {
                                    this.props.history.goBack()
                                }}>Назад
                                </button>
                            </div>
                        </div>
                        <hr className="hr_blue"/>
                        <div style={{"width": "100%", "height": "100%"}}>
                            {(staffContextStore.criterias && staffContextStore.schema) &&
                            <CriteriasTableViewer criterias={staffContextStore.criterias}
                                                  schema={staffContextStore.schema}/>}
                        </div>
                    </div>
                </div>
            </main>)
    }
}

export default observer(StaffCriteriasPage)