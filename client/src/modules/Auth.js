import userPersonalStore from "../stores/userPersonalStore";
import {BASE_URL} from "../common/constants";

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
        let resp = await fetch(BASE_URL + "/isAuth", {
            method: "GET"
        });
        if (resp.status === 200) {
            resp.json().then((x) => {
                userPersonalStore.Role = x.role;
            });
        }
        return resp.status === 200
    }

    /**
     * Check if a user is authenticated - check if a token is saved in Local Storage
     *
     * @returns {boolean}
     */
    static async isUserAuthenticated() {
        return await this.fetchAuth();
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