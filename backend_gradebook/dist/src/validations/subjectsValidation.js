"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateUpdateSubject = exports.validateDeleteSubject = exports.validateCreateSubject = void 0;
const validationHelpers_1 = require("../utils/validationHelpers");
const validateCreateSubject = () => [
    (0, validationHelpers_1.createNotEmptyValidation)('name')
];
exports.validateCreateSubject = validateCreateSubject;
const validateDeleteSubject = () => [
    (0, validationHelpers_1.createNotEmptyValidation)('subjectId', 'param')
];
exports.validateDeleteSubject = validateDeleteSubject;
const validateUpdateSubject = () => [
    (0, validationHelpers_1.createNotEmptyValidation)('subjectId', 'param'),
    (0, validationHelpers_1.createNotEmptyValidation)('name')
];
exports.validateUpdateSubject = validateUpdateSubject;
