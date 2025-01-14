"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateDeleteClassName = exports.validateUpdateClassName = exports.validateCreateClassName = void 0;
const validationHelpers_1 = require("../utils/validationHelpers");
const validateCreateClassName = () => [
    (0, validationHelpers_1.createNotEmptyValidation)('name')
];
exports.validateCreateClassName = validateCreateClassName;
const validateUpdateClassName = () => [
    (0, validationHelpers_1.createNotEmptyValidation)('classNameId', 'param'),
    (0, validationHelpers_1.createNotEmptyValidation)('name')
];
exports.validateUpdateClassName = validateUpdateClassName;
const validateDeleteClassName = () => [
    (0, validationHelpers_1.createNotEmptyValidation)('classNameId', 'param')
];
exports.validateDeleteClassName = validateDeleteClassName;
