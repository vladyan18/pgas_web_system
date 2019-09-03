import './style/bootstrap.min.css';
import './style/user_main.css';
import React, {Component} from 'react';
import User from "./components/user";


class App extends Component {
    render() {
        return (
            <User/>
        );
    }
}

export default App;
