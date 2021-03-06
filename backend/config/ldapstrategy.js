'use strict';

function _interopDefault(ex) {
  return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex;
}

const util = _interopDefault(require('util'));
const passport = _interopDefault(require('passport'));
const ActiveDirectory = _interopDefault(require('activedirectory'));

/*
 * modified version of passport-windowsauth (https://github.com/auth0/passport-windowsauth)
 * using activedirectory (https://github.com/gheeres/node-activedirectory)
 *
 * Additional features are that the ad connection is passed to the verify function so that
 * the user can take advantage of the query functions provided by activedirectory
 * when using ldap authentication
 *
 * Signature: verify ( [req], profile, [adClient], done)
 *
 */

const DEFAULT_USERNAME_FIELD = 'username';
const DEFAULT_PASSWORD_FIELD = 'password';
const DEFAULT_ATTRS = ['dn', 'displayName', 'givenName', 'middleName', 'sAMAccountName'];

/**
 * @return {string}
 */
const DEFAULT_FILTER = function DEFAULT_FILTER(username) {
  return '(&(objectclass=user)(|(sAMAccountName=' + username + ')(UserPrincipalName=' + username + ')))';
};

function getUserNameFromHeader(req) {
  if (!req.headers['x-iisnode-logon_user']) return null;
  return req.headers['x-iisnode-logon_user'].split('\\')[1];
}

function Strategy(options, verify) {
  if (typeof options === 'function') {
    verify = options;
    options = {};
  }
  if (!verify) throw new Error('windows authentication strategy requires a verify function');

  passport.Strategy.call(this);

  this.name = 'ActiveDirectory';
  this._verify = verify;

  this._options = options;
  this._passReqToCallback = options.passReqToCallback;
  this._integrated = options.integrated === false ? options.integrated : true;
  this._getUserNameFromHeader = options.getUserNameFromHeader || getUserNameFromHeader;

  if (!this._integrated) {
    this._usernameField = options.usernameField || DEFAULT_USERNAME_FIELD;
    this._passwordField = options.passwordField || DEFAULT_PASSWORD_FIELD;
  }

  this._ad = options.ldap instanceof ActiveDirectory ? options.ldap : new ActiveDirectory(options.ldap);
}

util.inherits(Strategy, passport.Strategy);

Strategy.prototype.mapProfile = function(i) {
  if (!i) return i;

  // allow custom profile mapper
  if (typeof this._options.mapProfile === 'function') {
    const userProfile = this._options.mapProfile(i);
    userProfile._json = i;
    return userProfile;
  }

  // default profile mapper
  return {
    id: i.objectGUID || i.uid,
    displayName: i.displayName,
    name: {
      lastName: i.sn || i.surName,
      firstName: i.gn || i.givenName,
      middleName: i.mn || i.middleName,
    },
    emails: i.mail ? [{value: i.mail}] : undefined,
    _json: i,
  };
};

Strategy.prototype.authenticate = function(req) {
  const _this = this;

  // eslint-disable-next-line prefer-rest-params
  const options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
  let username = null;
  let password = null;

  // get username and password

  if (this._integrated) {
    username = this._getUserNameFromHeader(req);
    if (!username) {
      return this.fail();
    }
  } else {
    username = req.body[this._usernameField] || req.query[this._usernameField];
    password = req.body[this._passwordField] || req.query[this._passwordField];
  }

  // helper functions
  const verified = function verified(err, user, info) {
    if (err) {
      return _this.error(err);
    }
    if (!user) {
      return _this.fail(info);
    }
    _this.success(user, info);
  };

  const verify = function verify(userProfile) {
    if (_this._passReqToCallback) {
      if (_this._ad) return _this._verify(req, userProfile, _this._ad, verified); else return _this._verify(req, userProfile, verified);
    } else {
      if (_this._ad) return _this._verify(userProfile, _this._ad, verified); else return _this._verify(userProfile, verified);
    }
  };

  const auth = function auth(userProfile) {
    return _this._ad.authenticate(userProfile._json.dn, password, function(err, auth) {
      if (err) return _this.error(err);
      if (!auth) return _this.fail('Authentication failed for ' + username);
      return verify(userProfile);
    });
  };

  // look for the user if using ldap auth
  if (this._ad) {
    let ldap; let ad;
    if (options.ldap) {
      ldap = new ActiveDirectory(options.ldap);
      ad = ldap;
    } else {
      ldap = this._options.ldap;
      ad = this._ad;
    }
    // eslint-disable-next-line new-cap
    const filter = typeof ldap.filter === 'function' ? ldap.filter(username) : DEFAULT_FILTER(username);
    let attributes = ldap.attributes || DEFAULT_ATTRS;
    attributes = Array.isArray(attributes) ? attributes : [attributes];

    // require the dn attribute which will be used during authentication
    if (attributes.indexOf('dn') === -1) attributes.push('dn');

    return ad.find({filter: filter, attributes: attributes}, function(err, results) {
      if (err) return _this.error(err);
      if (!results || !results.users || !Array.isArray(results.users) || !results.users.length) {
        return _this.fail('The user "' + username + '" was not found');
      }
      const userProfile = _this.mapProfile(results.users[0]);
      return _this._integrated ? verify(userProfile) : auth(userProfile);
    });
  }

  // non-ldap auth
  return verify({name: username, id: username});
};

module.exports = Strategy;
