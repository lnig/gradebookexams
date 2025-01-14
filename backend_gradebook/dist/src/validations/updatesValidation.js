"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateDeleteUpdate = exports.validateUpdateUpdate = exports.validateCreateUpdate = void 0;
const express_validator_1 = require("express-validator");
const validationHelpers_1 = require("../utils/validationHelpers");
const atLeastOneFieldValidation = () => {
    return (0, express_validator_1.body)().custom((value, { req }) => {
        const description = req.body.description;
        const version = req.body.version;
        if (!description && !version)
            throw new Error('At least one field must be provided.');
        if (description)
            (0, validationHelpers_1.createNotEmptyValidation)('description').run(req);
        if (version)
            (0, validationHelpers_1.createVersionValidation)('version').run(req);
        const result = (0, express_validator_1.validationResult)(req);
        if (!result.isEmpty())
            return false;
        return true;
    });
};
const validateCreateUpdate = () => [
    (0, validationHelpers_1.createNotEmptyValidation)('description'),
    (0, validationHelpers_1.createVersionValidation)('version')
];
exports.validateCreateUpdate = validateCreateUpdate;
const validateUpdateUpdate = () => [
    (0, validationHelpers_1.createNotEmptyValidation)('updateId', 'param'),
    atLeastOneFieldValidation()
];
exports.validateUpdateUpdate = validateUpdateUpdate;
const validateDeleteUpdate = () => [
    (0, validationHelpers_1.createNotEmptyValidation)('updateId', 'param')
];
exports.validateDeleteUpdate = validateDeleteUpdate;
