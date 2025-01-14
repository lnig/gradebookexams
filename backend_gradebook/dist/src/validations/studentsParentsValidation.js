"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateDeleteStudentParentRelationship = exports.validateCreateStudentParentRelationship = void 0;
const validationHelpers_1 = require("../utils/validationHelpers");
const validateCreateStudentParentRelationship = () => {
    return [
        (0, validationHelpers_1.createNotEmptyValidation)('studentId'),
        (0, validationHelpers_1.createNotEmptyValidation)('parentId')
    ];
};
exports.validateCreateStudentParentRelationship = validateCreateStudentParentRelationship;
const validateDeleteStudentParentRelationship = () => {
    return [
        (0, validationHelpers_1.createNotEmptyValidation)('studentId', 'param'),
        (0, validationHelpers_1.createNotEmptyValidation)('parentId', 'param'),
    ];
};
exports.validateDeleteStudentParentRelationship = validateDeleteStudentParentRelationship;
