"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateDeleteHomework = exports.validateUpdateHomework = exports.validateGetLatestHomework = exports.validateGetHomework = exports.validateCreateHomework = void 0;
const express_validator_1 = require("express-validator");
const validationHelpers_1 = require("../utils/validationHelpers");
const atLeastOneFieldValidation = () => {
    return (0, express_validator_1.body)().custom((value, { req }) => {
        const description = req.body.description;
        const deadline = req.body.deadline;
        if (!description && !deadline)
            throw new Error('At least one field must be provided.');
        if (description)
            (0, validationHelpers_1.createNotEmptyValidation)('description').run(req);
        if (deadline)
            (0, validationHelpers_1.createDateValidation)('deadline').run(req);
        const result = (0, express_validator_1.validationResult)(req);
        if (!result.isEmpty())
            return false;
        return true;
    });
};
const validateCreateHomework = () => [
    (0, validationHelpers_1.createNotEmptyValidation)('description'),
    (0, validationHelpers_1.createDateValidation)('deadline'),
    (0, validationHelpers_1.createNotEmptyValidation)('lessonId'),
];
exports.validateCreateHomework = validateCreateHomework;
const validateGetHomework = () => [
    (0, validationHelpers_1.createNotEmptyValidation)('lessonId', 'param')
];
exports.validateGetHomework = validateGetHomework;
const validateGetLatestHomework = () => [
    (0, validationHelpers_1.createNotEmptyValidation)('studentId', 'param')
];
exports.validateGetLatestHomework = validateGetLatestHomework;
const validateUpdateHomework = () => [
    (0, validationHelpers_1.createNotEmptyValidation)('homeworkId', 'param'),
    atLeastOneFieldValidation()
];
exports.validateUpdateHomework = validateUpdateHomework;
const validateDeleteHomework = () => [
    (0, validationHelpers_1.createNotEmptyValidation)('homeworkId', 'param')
];
exports.validateDeleteHomework = validateDeleteHomework;
