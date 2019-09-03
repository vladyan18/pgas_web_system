import React, {Component} from 'react'
import {Link, withRouter} from 'react-router-dom'


class UserNavItem extends Component {
    render() {
        console.log(this.props);
        const {location} = this.props;
        const {index, to, children, ...props} = this.props;

        let isActive = location.pathname == to;
        const LinkComponent = index ? Link : Link;

        return (
            <li className={'element ' + (isActive ? 'element_active' : '')}>
                <LinkComponent className="a_element" to={to} {...props}>{children}</LinkComponent>
            </li>
        )
    }
}

UserNavItem = withRouter(UserNavItem);

export default UserNavItem