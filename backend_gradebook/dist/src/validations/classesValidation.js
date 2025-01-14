"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateStudentId = exports.validateClassId = exports.validateUpdateClass = exports.validateAssignUnassignStudent = exports.validateCreateClass = void 0;
const express_validator_1 = require("express-validator");
const validationHelpers_1 = require("../utils/validationHelpers");
const atLeastOneFieldValidation = () => {
    return (0, express_validator_1.body)().custom((value, { req }) => {
        const classNameId = req.body.classNameId;
        const schoolYearId = req.body.schoolYearId;
        const teacherId = req.body.teacherId;
        if (!classNameId && !schoolYearId && !teacherId)
            throw new Error('At least one field must be provided.');
        if (classNameId)
            (0, validationHelpers_1.createNotEmptyValidation)('classNameId').run(req);
        if (schoolYearId)
            (0, validationHelpers_1.createNotEmptyValidation)('schoolYearId').run(req);
        if (teacherId)
            (0, validationHelpers_1.createNotEmptyValidation)('teacherId').run(req);
        const result = (0, express_validator_1.validationResult)(req);
        if (!result.isEmpty())
            return false;
        return true;
    });
};
const validateCreateClass = () => [
    (0, validationHelpers_1.createNotEmptyValidation)('classNameId'),
    (0, validationHelpers_1.createNotEmptyValidation)('schoolYearId')
];
exports.validateCreateClass = validateCreateClass;
const validateAssignUnassignStudent = () => [
    (0, validationHelpers_1.createNotEmptyValidation)('classId', 'param'),
    (0, validationHelpers_1.createNotEmptyValidation)('studentId')
];
exports.validateAssignUnassignStudent = validateAssignUnassignStudent;
const validateUpdateClass = () => [
    (0, validationHelpers_1.createNotEmptyValidation)('classId', 'param'),
    atLeastOneFieldValidation(),
];
exports.validateUpdateClass = validateUpdateClass;
const validateClassId = () => [
    (0, validationHelpers_1.createNotEmptyValidation)('classId', 'param')
];
exports.validateClassId = validateClassId;
const validateStudentId = () => [
    (0, validationHelpers_1.createNotEmptyValidation)('studentId', 'param')
];
exports.validateStudentId = validateStudentId;
