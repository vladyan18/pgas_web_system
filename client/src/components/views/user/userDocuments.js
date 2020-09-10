import React from 'react';
import '../../../style/commonInfo.css';
import {css, jsx} from '@emotion/core';
/** @jsx jsx */
import styled from '@emotion/styled';
import {Panel, HorizontalLine} from "./style";
import BootstrapTable from "react-bootstrap-table-next";
import {ConfirmationColumns} from "./userConfirmation/ConfirmationColumns";


function UserDocuments(props) {
  console.log('PROPS', props.confirmations)
  return (<Panel className="col-md-9">
    <div>
      <p className="headline"> Мои документы</p>
      <HorizontalLine/>
      <div>
          {props.confirmations && <BootstrapTable keyField='_id' data={props.confirmations}
                            columns={ConfirmationColumns}
                            bordered={false}/>}
      </div>
    </div>
  </Panel>);
}

export default UserDocuments;
