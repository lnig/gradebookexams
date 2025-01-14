"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNameValidation = exports.passwordConfirmValidation = exports.phoneNumberValidation = exports.peselValidation = exports.passwordValidation = exports.emailValidation = exports.createBooleanValidation = exports.createTimeValidation = exports.createIntValidation = exports.createArrayValidation = exports.createNotEmptyValidation = exports.createDateValidation = exports.createVersionValidation = void 0;
const express_validator_1 = require("express-validator");
const createVersionValidation = (field) => {
    return (0, express_validator_1.body)(field).matches(/^\d+\.\d+\.\d+$/).withMessage(`${field} must be in MAJOR.MINOR.PATCH format.`);
};
exports.createVersionValidation = createVersionValidation;
const createDateValidation = (field, location = 'body') => {
    const validator = location === 'body' ? (0, express_validator_1.body)(field) : (0, express_validator_1.param)(field);
    return validator.isDate().withMessage(`${field} must be a valid date in YYYY-MM-DD format.`);
};
exports.createDateValidation = createDateValidation;
const createNotEmptyValidation = (field, location = 'body') => {
    const validator = location === 'body' ? (0, express_validator_1.body)(field) : (0, express_validator_1.param)(field);
    return validator.not().isEmpty({ ignore_whitespace: true }).withMessage(`${field} is required.`);
};
exports.createNotEmptyValidation = createNotEmptyValidation;
const createArrayValidation = (field) => (0, express_validator_1.body)(field)
    .isArray({ min: 1 })
    .withMessage(`${field} must be a non-empty array.`);
exports.createArrayValidation = createArrayValidation;
const createIntValidation = (field, location = 'body', min, max) => {
    const validator = location === 'body' ? (0, express_validator_1.body)(field) : (0, express_validator_1.param)(field);
    const options = {};
    const intValidator = validator.isInt(options);
    if (min !== undefined)
        options.min = min;
    if (max !== undefined)
        options.max = max;
    return intValidator.withMessage(`${field} must be an integer${min !== undefined ? ` between ${min}` : ''}${max !== undefined ? ` and ${max}` : ''}.`);
};
exports.createIntValidation = createIntValidation;
const createTimeValidation = (field) => (0, express_validator_1.body)(field)
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .withMessage(`${field} must be in HH:MM format.`);
exports.createTimeValidation = createTimeValidation;
const createBooleanValidation = (field) => (0, express_validator_1.body)(field)
    .isBoolean()
    .withMessage(`${field} must be a boolean.`);
exports.createBooleanValidation = createBooleanValidation;
exports.emailValidation = (0, express_validator_1.body)('email')
    .isEmail()
    .withMessage('Invalid email.');
exports.passwordValidation = (0, express_validator_1.body)('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters.');
exports.peselValidation = (0, express_validator_1.body)('pesel')
    .isLength({ min: 11, max: 11 })
    .withMessage('PESEL must be 11 digits.')
    .isNumeric({ no_symbols: true })
    .withMessage('PESEL must contain only numeric characters.');
exports.phoneNumberValidation = (0, express_validator_1.body)('phoneNumber')
    .isMobilePhone('pl-PL')
    .withMessage('Invalid phone number.');
exports.passwordConfirmValidation = (0, express_validator_1.body)('passwordConfirm')
    .custom((value, { req }) => value === req.body.password)
    .withMessage('Passwords do not match.');
const createNameValidation = (field) => [
    (0, express_validator_1.body)(field)
        .isLength({ min: 2, max: 50 }).withMessage(`${field} must be 2-50 characters.`)
        .isAlpha().withMessage(`${field} must contain only letters.`)
];
exports.createNameValidation = createNameValidation;
