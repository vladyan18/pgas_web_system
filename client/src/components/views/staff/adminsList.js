import React from "react";
import {Panel, HorizontalLine} from "../user/style";
import {css} from "@emotion/core";
import withRouter from "react-router/modules/withRouter";
import {fetchSendWithoutRes} from "../../../services/fetchService";
import {useState} from 'react';


const dictionary = {
    'Admin': 'Администратор',
    'Moderator': 'Проверяющий',
    'User': 'Пользователь'
};

const selectorStyle = css`
    cursor: pointer;
    margin: 0;
`

function RoleSelector(props) {
    const [role, setRole] = useState(props.role);
    const [result, setResult] = useState();
    function handleSelect(e) {
        e.preventDefault();
        e.stopPropagation();
        const newRole = e.target.value;

        fetchSendWithoutRes('/setUserRole', {id: props.id, newRole}).then((res) => {
            if (res) {
                setRole(newRole);
            }
            setResult(res);
            props.refreshCb();
        });
    }

    return <select onChange={handleSelect} onClick={() => setResult(undefined)} value={role} defaultValue={props.role}
                   className={'form-control selectors' + (result === undefined ? '' : (result ? ' is-valid' : ' is-invalid'))}
                   css={selectorStyle}>
        {
            Object.keys(dictionary).map((role) => <option key={role} value={role}>{dictionary[role]}</option>)
        }
    </select>
}

function AdminsList(props) {
    if (!props.admins) return null;

    return <main className="row" style={{'justifyContent': 'center', 'display': 'flex'}}>
        <Panel className="col-md-9" >
            <div className="profile" style={{'display': 'flex', 'justify-content': 'space-between'}}>
                <div className="centered_ver">
                    <p className="headline">
                        Администраторы
                    </p>
                </div>
                <div className="centered_ver">
                    <button id="DeleteButton" className="btn btn-secondary"
                            value="Назад" onClick={() => {
                        props.history && props.history.goBack();
                    }}>Назад
                    </button>
                </div>
            </div>
            <HorizontalLine/>
            <div style={{'justifyContent': 'center', 'display': 'flex', marginBottom: '2rem'}}>
            <table className="table table-light">
                <thead>
                <tr><th css={css`text-align: center;`}>ФИО</th><th>Роль</th></tr>
                </thead>
                <tbody>
                {
                    props.admins.map((x) => <tr>
                        <td css={css`padding-right: 2rem; text-align: center; vertical-align: middle !important;`}>{x.Name}</td>
                        <td><RoleSelector role={x.Role} id={x.id} refreshCb={props.refreshCb}/></td>
                    </tr>)
                }
                </tbody>
            </table>
            </div>
    </Panel>
    </main>
}

export default AdminsList