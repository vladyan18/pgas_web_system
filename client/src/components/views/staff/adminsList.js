import React from "react";
import {Panel, HorizontalLine} from "../user/style";
import {css} from "@emotion/core";
import withRouter from "react-router/modules/withRouter";

const dictionary = {
    'Admin': 'Администратор',
    'Moderator': 'Проверяющий'
};

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
                    props.admins.map((x) => <tr><td css={css`padding-right: 2rem; text-align: center;`}>{x.Name}</td><td>{dictionary[x.Role]}</td></tr>)
                }
                </tbody>
            </table>
            </div>
    </Panel>
    </main>
}

export default AdminsList