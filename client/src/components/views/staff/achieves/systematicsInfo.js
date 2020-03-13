import React, {Component} from 'react';
import {fetchSendWithoutRes} from "../../../../services/fetchService";
import AchievesGroup from "./achievesGroup";
import staffContextStore from "../../../../stores/staff/staffContextStore";
import {observer} from "mobx-react";


class SystematicsInfo extends Component {
    constructor(props) {
        super(props);
        this.state = {collapsed: true};
        this.getSystConflicts = this.getSystConflicts.bind(this);
        this.toggleCollapse = this.toggleCollapse.bind(this);
        this.toggleCrit = this.toggleCrit.bind(this);
        this.getCritsElements = this.getCritsElements.bind(this);
    };

    toggleCollapse() {
        this.setState({collapsed: !this.state.collapsed, openedCrits: {}});
    }

    toggleCrit(crit) {
        const openedCrits = this.state.openedCrits;
        openedCrits[crit] = !openedCrits[crit];
        this.setState({openedCrits: openedCrits});
    }

    getSystConflicts(criterias) {
        if (!criterias) return [];
        const shift = Object.keys(criterias).length === 12 ? 0 : 1;
        const users = this.props.users;
        const systematicsConflicts = [];
        const critNames = Object.keys(criterias);
        for (const user of users) {
            const counts = [];
            for (let i = 0; i < critNames.length; i++) counts.push(0);
            if (user.Achievements) {
                for (const ach of user.Achievements) {
                    console.log(ach.status);
                    if (ach.status === 'Принято' || ach.status === 'Принято с изменениями') {
                        counts[critNames.indexOf(ach.crit)] += 1;
                    }
                }
            }

            console.log(counts);
            for (let i = 0; i < counts.length; i++) {
                if ([5, 10 + shift].includes(i) && counts[i] === 1) { //TODO
                    systematicsConflicts.push({crit: critNames[i], username: user.user, id: user.Id});
                } else if (i === 6 && counts[i] > 0 && counts[i] < 3) {
                    systematicsConflicts.push({crit: critNames[i], username: user.user, id: user.Id});
                }
            }

            if (this.props.updateSystematicsCallback) {
                this.props.updateSystematicsCallback(systematicsConflicts);
            }
            return systematicsConflicts;
        }
    }

    getCritsElements(conflicts) {
        const critNames = Object.keys(staffContextStore.criterias).filter((crit) => conflicts.some((y) => y.crit === crit));


        return critNames.map((crit) => <div style={{marginBottom: this.state.openedCrits[crit] ? '1rem' : null}}>
            <div style={{maxWidth: '20rem', marginLeft: 'auto', marginRight: 'auto', textAlign: 'left'}}>
            <span onClick={() => this.toggleCrit(crit)}
            style={{cursor: 'pointer', color: 'red'}}>
                {crit + (this.state.openedCrits[crit] ? ' ▶' : ' ▼')}
            </span>
            {this.state.openedCrits[crit] &&
                <div style={{marginLeft: '2rem'}}>
                    {conflicts.filter((x) => x.crit === crit).map((conflict) => <a href={'#' + conflict.id}>{conflict.username}</a>)}
                </div>
            }
            </div>
        </div>)
    }

    render () {
        const conflicts = this.getSystConflicts(staffContextStore.criterias);
        if (!conflicts) return null;
        return  <>{ conflicts.length > 0 &&
                <div style={{width:'100%', textAlign: 'center'}}>
                      <span style={{color:'red', borderBottom: '1px dashed red', fontSize:'medium', cursor: 'pointer', height: '1rem;'}}
                      onClick={this.toggleCollapse}>
                      Систематика!
                      </span>
                    {!this.state.collapsed &&
                        <div>
                            {
                                this.getCritsElements(conflicts)
                            }
                        </div>
                    }
                </div>
        }</>
    }
}

export default observer(SystematicsInfo);