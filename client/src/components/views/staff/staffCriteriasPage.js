import React, {Component} from 'react';
import '../../../style/user_main.css';
import {observer} from 'mobx-react';
import CriteriasTableViewer from './criteriasManagePage/criteriasTableViewer';
import staffContextStore from '../../../stores/staff/staffContextStore';
import userPersonalStore from '../../../stores/userPersonalStore';
/** @jsx jsx */
import {css, jsx} from '@emotion/core';
import styled from '@emotion/styled';
import CenteredMainPanel from "./components/centeredMainPanel";

class StaffCriteriasPage extends Component {
  constructor(props) {
    super(props);
  };

  componentWillMount() {
    if (!staffContextStore.criterias || !staffContextStore.schema) {
      staffContextStore.getCritsAndSchema().then();
    }
  }

  render() {
    return (
        <CenteredMainPanel heading={"Критерии"}
        buttons={
          <>
            {userPersonalStore.Role !== 'Observer' && <button id="DeleteButton" className="btn btn-primary"
                                                              value="Примечания" onClick={() => {
              this.props.history.push('/staff/manageAnnotations');
            }}>Примечания
            </button>}
          </>
        }>

            <div style={{'width': '100%', 'height': '100%'}}>
              {(staffContextStore.criterias && staffContextStore.schema) &&
                            <CriteriasTableViewer criterias={staffContextStore.criterias}
                              schema={staffContextStore.schema} limits={staffContextStore.limits}/>}
            </div>

        </CenteredMainPanel>);
  }
}

export default observer(StaffCriteriasPage);
