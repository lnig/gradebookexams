"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateDeleteExam = exports.validateUpdateExam = exports.validateUserId = exports.validateCreateExam = void 0;
const express_validator_1 = require("express-validator");
const validationHelpers_1 = require("../utils/validationHelpers");
const atLeastOneFieldValidation = () => {
    return (0, express_validator_1.body)().custom((value, { req }) => {
        const topic = req.body.topic;
        const scope = req.body.scope;
        if (!topic && !scope)
            throw new Error('At least one field must be provided.');
        if (topic)
            (0, validationHelpers_1.createNotEmptyValidation)('topic').run(req);
        if (scope)
            (0, validationHelpers_1.createNotEmptyValidation)('scope').run(req);
        const result = (0, express_validator_1.validationResult)(req);
        if (!result.isEmpty())
            return false;
        return true;
    });
};
const validateCreateExam = () => [
    (0, validationHelpers_1.createNotEmptyValidation)('topic'),
    (0, validationHelpers_1.createNotEmptyValidation)('scope'),
    (0, validationHelpers_1.createNotEmptyValidation)('lessonId'),
];
exports.validateCreateExam = validateCreateExam;
const validateUserId = () => [
    (0, validationHelpers_1.createNotEmptyValidation)('userId', 'param'),
];
exports.validateUserId = validateUserId;
const validateUpdateExam = () => [
    (0, validationHelpers_1.createNotEmptyValidation)('examId', 'param'),
    atLeastOneFieldValidation()
];
exports.validateUpdateExam = validateUpdateExam;
const validateDeleteExam = () => [
    (0, validationHelpers_1.createNotEmptyValidation)('examId', 'param')
];
exports.validateDeleteExam = validateDeleteExam;
