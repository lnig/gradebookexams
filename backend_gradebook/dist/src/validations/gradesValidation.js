"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateDeleteGrade = exports.validateUpdateFinalGrade = exports.validateUpdateGrade = exports.validateStudentId = exports.validateGetGrades = exports.validateCreateFinalGrade = exports.validateCreateGrade = void 0;
const express_validator_1 = require("express-validator");
const validationHelpers_1 = require("../utils/validationHelpers");
const atLeastOneFieldValidation = () => {
    return (0, express_validator_1.body)().custom((value, { req }) => {
        const description = req.body.description;
        const grade = req.body.grade;
        const weight = req.body.weight;
        if (!description && !grade && !weight)
            throw new Error('At least one field must be provided.');
        if (description)
            (0, validationHelpers_1.createNotEmptyValidation)('description').run(req);
        if (grade)
            (0, validationHelpers_1.createIntValidation)('grade', 'body', 1, 6).run(req);
        if (weight)
            (0, validationHelpers_1.createIntValidation)('weight', 'body', 1, 3).run(req);
        const result = (0, express_validator_1.validationResult)(req);
        if (!result.isEmpty())
            return false;
        return true;
    });
};
const validateCreateGrade = () => [
    (0, validationHelpers_1.createNotEmptyValidation)('description'),
    (0, validationHelpers_1.createIntValidation)('grade', 'body', 1, 6),
    (0, validationHelpers_1.createIntValidation)('weight', 'body', 1, 3),
    (0, validationHelpers_1.createNotEmptyValidation)('studentId'),
    (0, validationHelpers_1.createNotEmptyValidation)('subjectId'),
    (0, validationHelpers_1.createNotEmptyValidation)('teacherId')
];
exports.validateCreateGrade = validateCreateGrade;
const validateCreateFinalGrade = () => [
    (0, validationHelpers_1.createIntValidation)('grade', 'body', 1, 6),
    (0, validationHelpers_1.createNotEmptyValidation)('studentId'),
    (0, validationHelpers_1.createNotEmptyValidation)('subjectId'),
    (0, validationHelpers_1.createNotEmptyValidation)('teacherId'),
    (0, validationHelpers_1.createNotEmptyValidation)('semesterId'),
];
exports.validateCreateFinalGrade = validateCreateFinalGrade;
const validateGetGrades = () => [
    (0, validationHelpers_1.createNotEmptyValidation)('studentId', 'param'),
    (0, validationHelpers_1.createNotEmptyValidation)('subjectId', 'param')
];
exports.validateGetGrades = validateGetGrades;
const validateStudentId = () => [
    (0, validationHelpers_1.createNotEmptyValidation)('studentId', 'param')
];
exports.validateStudentId = validateStudentId;
const validateUpdateGrade = () => [
    (0, validationHelpers_1.createNotEmptyValidation)('gradeId', 'param'),
    atLeastOneFieldValidation()
];
exports.validateUpdateGrade = validateUpdateGrade;
const validateUpdateFinalGrade = () => [
    (0, validationHelpers_1.createNotEmptyValidation)('gradeId', 'param'),
    (0, validationHelpers_1.createIntValidation)('grade', 'body', 1, 6),
];
exports.validateUpdateFinalGrade = validateUpdateFinalGrade;
const validateDeleteGrade = () => [
    (0, validationHelpers_1.createNotEmptyValidation)('gradeId', 'param')
];
exports.validateDeleteGrade = validateDeleteGrade;
