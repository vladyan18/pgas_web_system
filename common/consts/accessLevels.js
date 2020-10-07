const Roles = require('./roles');

module.exports = {
    SUPERADMIN: [Roles.SUPERADMIN],
    ADMIN: [Roles.ADMIN, Roles.SUPERADMIN],
    MODERATOR: [Roles.MODERATOR, Roles.ADMIN, Roles.SUPERADMIN],
    OBSERVER: [Roles.OBSERVER, Roles.MODERATOR, Roles.ADMIN, Roles.SUPERADMIN]
}