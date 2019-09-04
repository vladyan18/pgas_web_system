import React, {Component} from 'react';
import '../../../../style/admin.css';
import AchievesGroup from "./achievesGroup";

class AchievesUserGroups extends Component {
    constructor(props) {
        super(props);
    };

    render() {
        return (
            <main>{this.props.users &&
            <div id="panel" className="col list" style={{"width": "100%"}}>

                {this.props.users.map((item) => (
                    <AchievesGroup item={item} updater={this.props.updater}/>
                ))}
            </div>}
            </main>
        )
    }
}

export default AchievesUserGroups