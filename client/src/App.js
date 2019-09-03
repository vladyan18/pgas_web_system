import './style/bootstrap.min.css';
import './style/user_main.css';
import React, {Component} from 'react';
import User from "./components/user";
import Auth from "./modules/Auth";
import Login from "./components/login";


class App extends Component {
    componentWillMount(nextProps, nextState, nextContext) {
        Auth.fetchAuth().then(() => {
            if (!Auth.isUserAuthenticated()) window.location.assign('/api/login')
        })
    }

    render() {
        return (
            Auth.isUserAuthenticated() ?
                <User/> : <Login/>
        );
    }
}

export default App;
