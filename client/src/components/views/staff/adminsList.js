import React from "react";
import {Panel, HorizontalLine} from "../user/style";
import {css} from "@emotion/core";
import withRouter from "react-router/modules/withRouter";
import {fetchGet, fetchSendWithoutRes} from "../../../services/fetchService";
import {useState} from 'react';
import Modal from "react-modal";
import EditConfirmation from "../user/userConfirmation/editConfirmation";
import staffContextStore from "../../../stores/staff/staffContextStore";


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

        fetchSendWithoutRes('/setUserRole', {id: props.id, newRole, faculty: staffContextStore.faculty}).then((res) => {
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

function AddNewAdmin(props) {
    const [user, setUser] = useState();
    const [st, setSt] = useState();
    async function handleStChange(e) {
        let newSt = e.target.value;
        if (!newSt) {
            return setSt(undefined);
        }
        newSt = newSt.toLowerCase();
        if (newSt.indexOf('@') !== -1) {
            newSt = newSt.substr(0, newSt.indexOf('@'));
        }
        if (newSt !== st) {
            setSt(newSt);
            if (newSt && newSt.length === 8) {
                const findResult = await fetchGet('/userForAdmin', {id: e.target.value});
                if (findResult) {
                    setUser(findResult);
                } else setUser(undefined);
            } else setUser(undefined);
        }
    }

    return <div className="modalContentWrapper" style={{display: "flex", justifyContent: "center"}}>
        <div className="block"
             style={{maxHeight: "inherit", width: "60rem", overflow: "auto"}}>
            <div style={{ display: 'flex', justifyContent: 'space-between'}}>
                <p className="headline">Добавление проверяющего</p>
                <div>
                    <button className="btn btn-secondary" onClick={props.closeCb}>
                    Закрыть
                    </button>
                </div>
            </div>
            <HorizontalLine/>
            <form >
                <label htmlFor="st">St для поиска:</label>
                <input id="st" className="form-control" type="text" required
                       onChange={handleStChange}/>
            </form>
            {
                user && <div>
                    <p>Результат: </p>
                    <div style={{textAlign: 'center'}}>
                        <b><span>{user.LastName} {user.FirstName} {user.Patronymic}</span></b>
                        <span style={{marginLeft: '1rem'}}>{user.Faculty} {user.Type} {user.Course} </span></div>
                    <div style={{marginTop: '2rem', display: 'flex', justifyContent: 'center'}}>
                        <button className="btn btn-success" onClick={() => props.addCb(user)}>
                            Сделать проверяющим
                        </button>
                    </div>
                </div>
            }
        </div>
    </div>
}

function AdminsList(props) {
    const [modalOpened, setModal] = useState(false);
    if (!props.admins) return null;

    function setModerator(user) {
        fetchSendWithoutRes('/setUserRole', {id: user.id, newRole: 'Moderator', faculty: staffContextStore.faculty}).then((res) => {
            props.refreshCb();
            setModal(false);
        });
    }

    return <main className="row" style={{'justifyContent': 'center', 'display': 'flex'}}>
        <Panel className="col-md-9" >
            <div className="profile" style={{'display': 'flex', 'justify-content': 'space-between'}}>
                <div className="centered_ver">
                    <p className="headline">
                        Администраторы
                    </p>
                </div>
                <div style={{display: 'flex'}}>
                <div className="centered_ver">
                    <button id="DeleteButton" className="btn btn-secondary"
                            value="Назад" onClick={() => {
                        props.history && props.history.goBack();
                    }}>Назад
                    </button>
                </div>
                <div className="centered_ver">
                    <button id="DeleteButton" className="btn btn-primary"
                            value="Назад" onClick={() => {
                        setModal(true);
                    }}>Добавить
                    </button>
                </div>
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
        <Modal className="Modal" style={{content: {"z-index": "111"}, overlay: {"z-index": "110"}}}
               isOpen={modalOpened}
               onRequestClose={() => setModal(false)}
               shouldCloseOnOverlayClick={true}
               contentLabel="Example Modal"
               overlayClassName="Overlay">
            <AddNewAdmin closeCb={() => setModal(false)} addCb={setModerator}/>
        </Modal>
    </main>
}

export default AdminsList