"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateResetPassword = exports.validateForgotPassword = exports.validateSignUp = exports.validateSignIn = void 0;
const validationHelpers_1 = require("../utils/validationHelpers");
const validateSignIn = () => [
    validationHelpers_1.emailValidation,
    validationHelpers_1.passwordValidation
];
exports.validateSignIn = validateSignIn;
const validateSignUp = () => [
    validationHelpers_1.peselValidation,
    validationHelpers_1.emailValidation,
    validationHelpers_1.phoneNumberValidation,
    validationHelpers_1.passwordValidation,
    validationHelpers_1.passwordConfirmValidation,
    ...(0, validationHelpers_1.createNameValidation)('firstName'),
    ...(0, validationHelpers_1.createNameValidation)('lastName')
];
exports.validateSignUp = validateSignUp;
const validateForgotPassword = () => [
    validationHelpers_1.emailValidation
];
exports.validateForgotPassword = validateForgotPassword;
const validateResetPassword = () => [
    validationHelpers_1.passwordValidation
];
exports.validateResetPassword = validateResetPassword;
