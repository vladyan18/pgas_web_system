import './style/bootstrap.min.css';
import './style/user_main.css';
import React, {Component} from 'react';
import User from "./components/user";
import Auth from "./modules/Auth";
import Route from "react-router-dom/Route";
import {Switch} from "react-router-dom";
import Staff from "./components/staff";
import Login from "./components/login";
import userPersonalStore from "./stores/userPersonalStore";


class App extends Component {
    constructor(props) {
        super(props);

        fetch("api/getProfile", {
            method: "GET"
        }).then((resp) => {
            return resp.json()
        })
            .then((profile) => userPersonalStore.personal = profile);
    }

    componentWillMount(nextProps, nextState, nextContext) {
        Auth.fetchAuth().then(() => {
            if (!Auth.isUserAuthenticated()) window.location.assign('/api/login')
        })
    }

    componentWillUpdate(nextProps, nextState, nextContext) {
        Auth.fetchAuth().then(() => {
            if (!Auth.isUserAuthenticated()) window.location.assign('/api/login')
        })
    }

    render() {
        return (
            Auth.isUserAuthenticated() ?
                <Switch>
                    <Route path="/staff/" component={Staff}/>
                    <Route path="/" component={User}/>
                </Switch>
                :
                <Login/>
        )
    }
}

export default App;
