"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidEmail = isValidEmail;
exports.isValidDni = isValidDni;
exports.isValidPhonePeru = isValidPhonePeru;
exports.isStrongPassword = isStrongPassword;
exports.normalizePhone = normalizePhone;
const DNI_REGEX = /^\d{8}$/;
const PHONE_PE_REGEX = /^(\+51)?9\d{8}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
function isValidEmail(email) {
    return EMAIL_REGEX.test(email.trim());
}
function isValidDni(dni) {
    return DNI_REGEX.test(dni.replace(/\s/g, ''));
}
function isValidPhonePeru(phone) {
    const normalized = phone.replace(/[\s-]/g, '');
    return PHONE_PE_REGEX.test(normalized);
}
function isStrongPassword(password) {
    if (password.length < 8)
        return false;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSymbol = /[^A-Za-z0-9]/.test(password);
    return hasUpper && hasLower && hasNumber && hasSymbol;
}
function normalizePhone(phone) {
    const digits = phone.replace(/\D/g, '');
    if (digits.startsWith('51') && digits.length === 11) {
        return `+${digits}`;
    }
    if (digits.length === 9) {
        return `+51${digits}`;
    }
    return phone.trim();
}
//# sourceMappingURL=validators.js.map