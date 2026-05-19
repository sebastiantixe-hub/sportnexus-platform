"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AUTH0_RBAC_ROLE_NAMES = exports.ROLE_HOME_PATH = exports.PRISMA_TO_SELECTED_ROLE = exports.SELECTED_ROLE_TO_PRISMA = exports.AUTH0_NAMESPACE = void 0;
exports.resolveRoleFromAuth0Claims = resolveRoleFromAuth0Claims;
exports.isSelectedRoleAllowed = isSelectedRoleAllowed;
const client_1 = require("@prisma/client");
exports.AUTH0_NAMESPACE = 'https://hercix.com';
exports.SELECTED_ROLE_TO_PRISMA = {
    super_admin: client_1.UserRole.ADMIN,
    owner: client_1.UserRole.GYM_OWNER,
    coach: client_1.UserRole.TRAINER,
    athlete: client_1.UserRole.USER,
};
exports.PRISMA_TO_SELECTED_ROLE = {
    [client_1.UserRole.ADMIN]: 'super_admin',
    [client_1.UserRole.GYM_OWNER]: 'owner',
    [client_1.UserRole.TRAINER]: 'coach',
    [client_1.UserRole.USER]: 'athlete',
};
exports.ROLE_HOME_PATH = {
    super_admin: '/super-admin',
    owner: '/owner',
    coach: '/coach',
    athlete: '/athlete',
};
exports.AUTH0_RBAC_ROLE_NAMES = {
    super_admin: ['super_admin', 'ADMIN', 'Super Admin'],
    owner: ['owner', 'GYM_OWNER', 'Owners'],
    coach: ['coach', 'TRAINER', 'Coaches'],
    athlete: ['athlete', 'USER', 'Atletas'],
};
function resolveRoleFromAuth0Claims(customRoles) {
    const roles = customRoles ?? [];
    if (roles.some((r) => exports.AUTH0_RBAC_ROLE_NAMES.super_admin.includes(r))) {
        return client_1.UserRole.ADMIN;
    }
    if (roles.some((r) => exports.AUTH0_RBAC_ROLE_NAMES.owner.includes(r))) {
        return client_1.UserRole.GYM_OWNER;
    }
    if (roles.some((r) => exports.AUTH0_RBAC_ROLE_NAMES.coach.includes(r))) {
        return client_1.UserRole.TRAINER;
    }
    return client_1.UserRole.USER;
}
function isSelectedRoleAllowed(selected, actual) {
    return exports.SELECTED_ROLE_TO_PRISMA[selected] === actual;
}
//# sourceMappingURL=roles.js.map