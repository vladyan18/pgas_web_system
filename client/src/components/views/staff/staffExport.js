import React, { useState } from 'react';
import '../../../style/user_main.css';
import staffContextStore from "../../../stores/staff/staffContextStore";
import {withRouter} from "react-router-dom";
import {fetchGet} from "../../../services/fetchService";
import {makeExportUsersTable} from "../../../services/exportXLSX";
/** @jsx jsx */
import {css, jsx} from '@emotion/core';
import styled from '@emotion/styled';
import MainPanel from "./components/mainPanel";
import {observer} from "mobx-react";
import CriteriasForm from "../user/userAddAchievement/criteriasForm";



async function exportExcel(filters) {
    if (!staffContextStore.faculty) return null;

    const users = await fetchGet('/api/checked', {faculty: staffContextStore.faculty});

    await makeExportUsersTable(users.Info, staffContextStore.faculty, filters);
}

function AddFilter(props) {
    const [filter, setFilter] = useState({});
    return <div>
        <CriteriasForm crits={staffContextStore.criterias}
                       valuesCallback={(chars) => setFilter(chars)}
                       supressDescription={true}
                       forceEnabled={true}/>
        <button className="btn btn-info" onClick={() => props.setFilters(filter)}> Сохранить </button>
    </div>
}

function StaffExport(props) {
    const [filters, setFilters] = useState([]);
    const [changingFilter, setChangingFilter] = useState();

    return <MainPanel heading={"Экспорт"}>
        <div css={css`margin-bottom: 2rem;`}>
            {filters && filters.map(x => <p>{x.toString()}</p>)}
            <div>
            {!changingFilter && <button className="btn btn-outline-info" onClick={() => setChangingFilter(true)}>Добавить правило фильтра</button>}
            </div>

            {changingFilter && <AddFilter setFilters={(newFilter) => {
                setFilters([...filters, newFilter]);
                setChangingFilter(false);
            }}/>}
        </div>

       <button className="btn btn-success" onClick={() => exportExcel(filters)}> Сформировать Excel-таблицу </button>
    </MainPanel>
}

export default observer(withRouter(StaffExport))