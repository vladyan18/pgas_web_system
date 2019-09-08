import userPersonalStore from "../stores/userPersonalStore";

class Auth {

    /**
     * Authenticate a user. Save a token string in Local Storage
     *
     * @param {string} token
     */
    static authenticateUser(token) {
        localStorage.setItem('token', token);
    }

    static async fetchAuth() {
        let resp = await fetch("api/isAuth", {
            method: "GET"
        });
        resp.json().then((x) => {
            userPersonalStore.Role = x.role;
            userPersonalStore.Rights = x.rights;
            console.log('CUR ROLE: ' + userPersonalStore.Role, x)
        });
        localStorage.setItem('auth', (resp.status === 200).toString());
    }

    /**
     * Check if a user is authenticated - check if a token is saved in Local Storage
     *
     * @returns {boolean}
     */
    static isUserAuthenticated() {
        return localStorage.getItem('auth') == 'true';
    }

    /**
     * Deauthenticate a user. Remove a token from Local Storage.
     *
     */
    static deauthenticateUser() {
        localStorage.removeItem('token');
    }

    /**
     * Get a token value.
     *
     * @returns {string}
     */

    static getToken() {
        return localStorage.getItem('token');
    }

}

export default Auth;