"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateDeleteUserType = exports.validateCreateUserType = void 0;
const validationHelpers_1 = require("../utils/validationHelpers");
const validateCreateUserType = () => [
    (0, validationHelpers_1.createNotEmptyValidation)('name')
];
exports.validateCreateUserType = validateCreateUserType;
const validateDeleteUserType = () => [
    (0, validationHelpers_1.createNotEmptyValidation)('userTypeId', 'param')
];
exports.validateDeleteUserType = validateDeleteUserType;
