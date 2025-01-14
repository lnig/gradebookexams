"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateDeleteSemester = exports.validateUpdateSemester = exports.validateGetSemesters = exports.validateCreateSemester = void 0;
const express_validator_1 = require("express-validator");
const validationHelpers_1 = require("../utils/validationHelpers");
const atLeastOneFieldValidation = () => {
    return (0, express_validator_1.body)().custom(async (value, { req }) => {
        const semester = req.body.semester;
        const startDate = req.body.startDate;
        const endDate = req.body.endDate;
        if (!semester && !startDate && !endDate) {
            throw new Error('At least one field must be provided.');
        }
        const validations = [];
        if (semester)
            validations.push((0, validationHelpers_1.createNotEmptyValidation)('semester').run(req));
        if (startDate)
            validations.push((0, validationHelpers_1.createDateValidation)('startDate').run(req));
        if (endDate)
            validations.push((0, validationHelpers_1.createDateValidation)('endDate').run(req));
        await Promise.all(validations);
        const result = (0, express_validator_1.validationResult)(req);
        if (!result.isEmpty())
            return false;
        return true;
    });
};
const validateCreateSemester = () => [
    (0, validationHelpers_1.createIntValidation)('semester'),
    (0, validationHelpers_1.createDateValidation)('startDate'),
    (0, validationHelpers_1.createDateValidation)('endDate'),
    (0, validationHelpers_1.createNotEmptyValidation)('schoolYearId'),
];
exports.validateCreateSemester = validateCreateSemester;
const validateGetSemesters = () => [
    (0, validationHelpers_1.createNotEmptyValidation)('schoolYearId', 'param'),
];
exports.validateGetSemesters = validateGetSemesters;
const validateUpdateSemester = () => [
    (0, validationHelpers_1.createNotEmptyValidation)('semesterId', 'param'),
    atLeastOneFieldValidation()
];
exports.validateUpdateSemester = validateUpdateSemester;
const validateDeleteSemester = () => [
    (0, validationHelpers_1.createNotEmptyValidation)('semesterId', 'param'),
];
exports.validateDeleteSemester = validateDeleteSemester;
