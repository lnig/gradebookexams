"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateDeleteSchoolYear = exports.validateUpdateSchoolYear = exports.validateCreateSchoolYear = void 0;
const express_validator_1 = require("express-validator");
const validationHelpers_1 = require("../utils/validationHelpers");
const atLeastOneFieldValidation = () => {
    return (0, express_validator_1.body)().custom(async (value, { req }) => {
        const name = req.body.name;
        const startDate = req.body.startDate;
        const endDate = req.body.endDate;
        if (!name && !startDate && !endDate) {
            throw new Error('At least one field must be provided.');
        }
        const validations = [];
        if (name)
            validations.push((0, validationHelpers_1.createNotEmptyValidation)('name').run(req));
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
const validateCreateSchoolYear = () => [
    (0, validationHelpers_1.createNotEmptyValidation)('name'),
    (0, validationHelpers_1.createDateValidation)('startDate'),
    (0, validationHelpers_1.createDateValidation)('endDate')
];
exports.validateCreateSchoolYear = validateCreateSchoolYear;
const validateUpdateSchoolYear = () => [
    (0, validationHelpers_1.createNotEmptyValidation)('schoolYearId', 'param'),
    atLeastOneFieldValidation()
];
exports.validateUpdateSchoolYear = validateUpdateSchoolYear;
const validateDeleteSchoolYear = () => [
    (0, validationHelpers_1.createNotEmptyValidation)('schoolYearId', 'param'),
];
exports.validateDeleteSchoolYear = validateDeleteSchoolYear;
