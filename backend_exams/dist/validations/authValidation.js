"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateResetPassword = exports.validateForgotPassword = exports.validateSignUp = exports.validateSignIn = void 0;
const validationUtils_js_1 = require("./validationUtils.js");
const validateSignIn = () => [
    validationUtils_js_1.emailValidation,
    validationUtils_js_1.passwordValidation
];
exports.validateSignIn = validateSignIn;
const validateSignUp = () => [
    validationUtils_js_1.peselValidation,
    validationUtils_js_1.emailValidation,
    validationUtils_js_1.phoneNumberValidation,
    validationUtils_js_1.passwordValidation,
    validationUtils_js_1.passwordConfirmValidation,
    ...(0, validationUtils_js_1.nameValidation)('firstName'),
    ...(0, validationUtils_js_1.nameValidation)('lastName')
];
exports.validateSignUp = validateSignUp;
const validateForgotPassword = () => [
    validationUtils_js_1.emailValidation
];
exports.validateForgotPassword = validateForgotPassword;
const validateResetPassword = () => [
    validationUtils_js_1.passwordValidation
];
exports.validateResetPassword = validateResetPassword;
