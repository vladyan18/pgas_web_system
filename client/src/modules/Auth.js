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
            console.log('CUR ROLE: ' + userPersonalStore.Role, x)
        });
        return resp.status === 200
    }

    /**
     * Check if a user is authenticated - check if a token is saved in Local Storage
     *
     * @returns {boolean}
     */
    static async isUserAuthenticated() {
        let res = await this.fetchAuth()

        console.log('AUTH', res)
        return res;


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