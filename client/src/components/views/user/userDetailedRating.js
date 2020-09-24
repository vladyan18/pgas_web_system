import React, {Component} from 'react';
import logo from '../../../img/gerb.png';
import '../../../style/user_main.css';
import userPersonalStore from '../../../stores/userPersonalStore';
import {observer} from 'mobx-react';
import {withRouter} from 'react-router-dom';
/** @jsx jsx */
import {css, jsx} from '@emotion/core';
import styled from '@emotion/styled';
import staffContextStore from "../../../stores/staff/staffContextStore";
import BootstrapTable from "react-bootstrap-table-next";
import criteriasStore from "../../../stores/criteriasStore";

const Panel = styled.div`
    background-color: white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, .2);
    padding: 0 2rem;
    @media only screen and (max-device-width: 480px) {
        padding: 0 1rem;
    }
`;

const criteriasTable = css `
    @media only screen and (max-device-width: 480px) {
    display: none;
  }
`;

class UserDetailedRating extends Component {
    constructor(props) {
        super(props);
        this.toggleDetailedMode = this.toggleDetailedMode.bind(this);
    };

    toggleDetailedMode() {
        if (this.props.toggleModeCallback) {
            this.props.toggleModeCallback();
        }
    }
    render() {
        const props = this.props;
        let filtered = this.props.data;
        let sorted = [];
        if (filtered) {
                sorted = filtered.sort(function (obj1, obj2) {
                let diff = obj2.Ball - obj1.Ball;
                if (diff != 0)
                    return obj2.Ball - obj1.Ball;
                else {
                    for (let crit of Object.keys(obj1.Crits)) {
                        diff = obj2.Crits[crit] - obj1.Crits[crit];
                        if (diff !== 0) return diff
                    }
                    return 0
                }
            });
        }

        function getAreaNum(critName) {
            const critNum = Object.keys(criteriasStore.criterias).indexOf(critName);
            if (critNum === -1) return undefined;
            const shift = Object.keys(criteriasStore.criterias).length === 12 ? 0 : 1;

            if (critNum < 3) return 0;
            if (critNum < 5) return 1;
            if (critNum < 7) return 2;
            if (critNum < 9 + shift) return 3;
            return 4;
        }

        for (const user of sorted) {
            user.sums = [0, 0, 0, 0, 0];
            if (user.Achievements)
            for (const ach of user.Achievements) {
                user.sums[getAreaNum(ach.crit)] += ach.ball;
            }
        }

        function hasOverhead(user, crit) {
            return limits && user.Crits[crit] > 0 &&
                (user.sums[getAreaNum(crit)] > limits[getAreaNum(crit)])
        }

        const limits = criteriasStore.limits;
        return <Panel className="col-md-9">
            <div className="profile" style={{"display": "flex", "justify-content": "space-between", margin: "0"}} >
                <div className="centered_ver">
                    <p className="headline">
                        Рейтинг студентов
                    </p>
                </div>
                <div className="centered_ver" style={{"display": "flex"}}>
                    {   this.props.toggleModeCallback &&
                        <button id="DeleteButton" style={{marginRight: '1rem'}} className="btn btn-outline-info"
                                value="Кратко" onClick={this.toggleDetailedMode}>Кратко </button>
                    }
                    <button id="DeleteButton" className="btn btn-secondary"
                            value="Назад" onClick={() => {
                        this.props.history.goBack()
                    }}>Назад
                    </button>
                    {!this.props.userMode && <form action="/api/getResultTable">
                        <input type="hidden" name="faculty" value={staffContextStore.faculty} />
                        <input type="submit" id="download" className="btn btn-primary" value="Скачать"/>
                    </form>}
                </div>

            </div>
            {this.props.faculty == 'ВШЖиМК' && this.props.directions && this.props.directions.length > 0
            && <select id='1' className="form-control selectors" onChange={this.handleDirectionSelect}>
                {this.props.directions.map(dir =>
                    <option value={dir}>{dir}</option> )}
            </select>}
            <hr className="hr_blue" style={{marginTop: '0'}}/>
            {sorted.length === 0 && <div id="floatingCirclesG">
                <div className="f_circleG" id="frotateG_01"></div>
                <div className="f_circleG" id="frotateG_02"></div>
                <div className="f_circleG" id="frotateG_03"></div>
                <div className="f_circleG" id="frotateG_04"></div>
                <div className="f_circleG" id="frotateG_05"></div>
                <div className="f_circleG" id="frotateG_06"></div>
                <div className="f_circleG" id="frotateG_07"></div>
                <div className="f_circleG" id="frotateG_08"></div>
            </div>}
            { sorted.map((user, index) =>
                <div style={{marginBottom: '2rem'}}>
                    <h4 style={{display: 'flex',
                        justifyContent: 'space-between',
                        backgroundColor: user.Achievements ? '#42996c' : '#595959'
                    }}><div>{(index + 1) + '. ' + user.Name}</div><div>{user.Ball}</div></h4>
                    <table className="table table-bordered" css={criteriasTable} id='users'>
                        <thead>
                        <tr style={{fontSize: 'small'}}>
                            {Object.keys(criteriasStore.criterias).map((crit) =>
                                <td style={{textAlign: 'center', padding: '5px'
                                }}><b>{crit}</b></td>)}
                        </tr>
                        </thead>
                        <tbody id="usersTable">
                        <tr style={{fontSize: 'small'}}>
                            {Object.keys(user.Crits).map((crit) =>
                                <td style={{textAlign: 'center', padding: '5px',
                                    color: hasOverhead(user, crit) ? 'red' : 'black',
                                    }
                                } title={hasOverhead(user, crit) ?
                                    'Суммарный балл за область превышает установленное ограничение, поэтому \n при итоговом суммировании он будет считаться с ограничением.'
                                    : null
                                }><span style={{borderBottom: hasOverhead(user, crit) ? '1px dashed red' : null}}>{user.Crits[crit]}</span></td>)}
                        </tr>
                        </tbody>
                    </table>
                    {user.Achievements && user.Achievements.length > 0 &&
                    <table className="table table-bordered" id='users'>
                    <thead>
                    <tr>
                        <td style={{textAlign: 'center'}}>Крит.</td>
                        <td>Достижение</td>
                        <td>Дата</td>
                        <td>Хар-ки</td>
                        <td style={{textAlign: 'center'}}>Балл</td>
                    </tr>
                    </thead>
                    <tbody id="usersTable">
                    {
                        user.Achievements.map((ach) => (ach.status === 'Принято' || ach.status === 'Принято с изменениями') && <tr>
                            <td style={{textAlign: 'center', width:'5%', verticalAlign: 'middle'}}>{ach.crit}</td>
                            <td style={{verticalAlign: 'middle'}}>{ach.achievement}</td>
                            <td style={{fontSize: 'small', width:'10%', verticalAlign: 'middle'}}>{getDate(ach.achDate)}</td>
                            <td style={{fontSize: 'xx-small', width:'20%', verticalAlign: 'middle'}}>{ach.chars.slice(1).toString().replace(/,/g, ', ')}</td>
                            <td style={{textAlign: 'center', width:'5%', verticalAlign: 'middle'}}>{ach.ball}</td>
                        </tr>)
                    }
                    </tbody>
                    </table> }

                    { user.Achievements === null && <div style={{width: '100%', textAlign:'center'}}>Пользователь не дал разрешение на просмотр его достижений.</div>}
                </div>
            )
            }

        </Panel>
    }
}

function getDate(d) {
    if (!d) return undefined;
    d = new Date(d);
    return (d.getDate() > 9 ? d.getDate() : '0' + d.getDate()) + '.' + ((d.getMonth() + 1) > 9 ? (d.getMonth() + 1) : '0' + (d.getMonth() + 1)) + '.' + d.getFullYear();
}

export default withRouter(observer(UserDetailedRating));
