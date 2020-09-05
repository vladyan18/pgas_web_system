import './style/user_main.css';
import React, {Component, Suspense} from 'react';
import User from "./components/user";
import Auth from "./modules/Auth";
import Route from "react-router-dom/Route";
import {Switch} from "react-router-dom";
import Login from "./components/login";
import userPersonalStore from "./stores/userPersonalStore";

const UserRegistrationContainer = React.lazy(() => import("./components/containers/user/UserRegistrationContainer"));
const UserEditProfileContainer = React.lazy(() => import("./components/containers/user/UserEditProfileContainer"));
const Staff = React.lazy(() => import('./components/staff'));

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {isRegistered: 'unknown', isLogged: false, authChecked: false};

        /*fetch("api/getProfile", {
            method: "GET"
        }).then((resp) => {
            return resp.json()
        })
            .then((profile) => {
                userPersonalStore.personal = profile
            });*/
    }

    componentDidMount() {
        fetch("api/getProfile", {
            method: "GET"
        }).then((resp) => {
            return resp.json()
        })
            .then((profile) => {
                userPersonalStore.personal = profile
            });

        Auth.isUserAuthenticated().then((status) => {
            this.setState({isLogged: status})
        })
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        Auth.isUserAuthenticated().then((status) => {
            if (status !== this.state.isLogged || !this.state.authChecked)
            this.setState({isLogged: status, authChecked: true})
        })
    }

    render() {
        if (!this.state.authChecked) return null;

        return (
            this.state.isLogged ?
                <Suspense fallback={
                    <div style={{backGroundColor: "#e2e2e2", padding: "3rem", marginTop:'auto', marginBottom:'auto'}}>
                    <div id="floatingCirclesG">
                        <div className="f_circleG" id="frotateG_01"></div>
                        <div className="f_circleG" id="frotateG_02"></div>
                        <div className="f_circleG" id="frotateG_03"></div>
                        <div className="f_circleG" id="frotateG_04"></div>
                        <div className="f_circleG" id="frotateG_05"></div>
                        <div className="f_circleG" id="frotateG_06"></div>
                        <div className="f_circleG" id="frotateG_07"></div>
                        <div className="f_circleG" id="frotateG_08"></div>
                    </div>
                </div>}>
                    <Switch>
                        <Route path="/register" component={UserRegistrationContainer}/>
                        <Route path="/edit_profile" component={UserEditProfileContainer}/>

                        <Route path="/staff/" component={Staff}/>

                        <Route path="/api/getConfirm/:id" component={(props) => {
                            let id = props.match.params.id;
                            window.location.href = 'http://localhost/getConfirm/' + id;
                            return null;
                        }}/>
                        <Route path="/" component={User}/>
                    </Switch>
                </Suspense>
                :
                <Login/>
        )
    }
}

export default App;
