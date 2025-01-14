"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateDeleteProblem = exports.validateUpdateProblem = exports.validateGetProblemsByType = exports.validateCreateProblem = void 0;
const validationHelpers_1 = require("../utils/validationHelpers");
const validateCreateProblem = () => [
    (0, validationHelpers_1.createNotEmptyValidation)('description'),
    (0, validationHelpers_1.createNotEmptyValidation)('problemTypeId'),
    (0, validationHelpers_1.createNotEmptyValidation)('reporterId'),
    (0, validationHelpers_1.createNotEmptyValidation)('userTypeId')
];
exports.validateCreateProblem = validateCreateProblem;
const validateGetProblemsByType = () => [
    (0, validationHelpers_1.createNotEmptyValidation)('problemTypeId', 'param'),
];
exports.validateGetProblemsByType = validateGetProblemsByType;
const validateUpdateProblem = () => [
    (0, validationHelpers_1.createNotEmptyValidation)('problemId', 'param'),
    (0, validationHelpers_1.createNotEmptyValidation)('statusId')
];
exports.validateUpdateProblem = validateUpdateProblem;
const validateDeleteProblem = () => [
    (0, validationHelpers_1.createNotEmptyValidation)('problemId', 'param')
];
exports.validateDeleteProblem = validateDeleteProblem;
