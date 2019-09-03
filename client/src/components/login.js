import Auth from "../modules/Auth";
import React, {Component} from 'react';

class Login extends Component {
    constructor(props) {
        super(props);
        this.state = {
            authenticated: false
        }
    };

    componentWillMount() {
        Auth.fetchAuth().then(() => {
            if (Auth.isUserAuthenticated())
                window.location.assign('/home');
            else window.location.assign('/api/login')
        })
    }

    render() {
        return (<div className="container-fluid">
        </div>)
    }

}

export default Login