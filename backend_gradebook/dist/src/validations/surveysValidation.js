"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateDeleteSurvey = exports.validateUpdateSurvey = exports.validateGetSurvey = exports.validateSendSurvey = exports.validateCreateSurvey = void 0;
const express_validator_1 = require("express-validator");
const validationHelpers_1 = require("../utils/validationHelpers");
const atLeastOneFieldValidation = () => {
    return (0, express_validator_1.body)().custom((value, { req }) => {
        const name = req.body.name;
        const description = req.body.description;
        const startDate = req.body.startDate;
        const endDate = req.body.endDate;
        const startTime = req.body.startTime;
        const endTime = req.body.endTime;
        const questionsToAdd = req.body.questionsToAdd;
        const questionsIdsToRemove = req.body.questionsIdsToRemove;
        if (!name && !description && !startDate && !endDate && !startTime && !endTime && !questionsToAdd && !questionsIdsToRemove)
            throw new Error('At least one field must be provided.');
        if (startDate || endDate || startTime || endTime)
            if (!startDate || !endDate || !startTime || !endTime)
                throw new Error('If any of these fields: startDate, endDate, startTime, endTime is provided then all of them must be.');
        if (name)
            (0, validationHelpers_1.createNotEmptyValidation)('name').run(req);
        if (description)
            (0, validationHelpers_1.createNotEmptyValidation)('description').run(req);
        if (startDate)
            (0, validationHelpers_1.createDateValidation)('startDate').run(req);
        if (endDate)
            (0, validationHelpers_1.createDateValidation)('endDate').run(req);
        if (startTime)
            (0, validationHelpers_1.createTimeValidation)('startTime').run(req);
        if (endTime)
            (0, validationHelpers_1.createTimeValidation)('endTime').run(req);
        if (questionsToAdd) {
            (0, validationHelpers_1.createArrayValidation)('questionsToAdd').run(req);
            (0, validationHelpers_1.createNotEmptyValidation)('questionsToAdd.*.content').run(req);
            (0, validationHelpers_1.createNotEmptyValidation)('questionsToAdd.*.questionTypeId').run(req);
            (0, express_validator_1.body)('questionsToAdd.*.responses')
                .optional()
                .isArray({ min: 1 })
                .withMessage('responses must be a non-empty array.')
                .run(req);
            (0, express_validator_1.body)('questionsToAdd.*.responses.*.content')
                .notEmpty()
                .withMessage('content field is required.')
                .run(req);
        }
        if (questionsIdsToRemove) {
            (0, express_validator_1.body)('questionsIdsToRemove')
                .optional()
                .isArray({ min: 1 })
                .withMessage('responses must be a non-empty array.')
                .run(req);
            (0, express_validator_1.body)('questionsIdsToRemove.*')
                .notEmpty()
                .withMessage('question to remove ID is required.')
                .run(req);
        }
        return true;
    });
};
const questionsValidation = () => {
    return (0, express_validator_1.body)().custom((value, { req }) => {
        (0, validationHelpers_1.createArrayValidation)('questions').run(req);
        (0, validationHelpers_1.createNotEmptyValidation)('questions.*.content').run(req);
        (0, validationHelpers_1.createNotEmptyValidation)('questions.*.questionTypeId').run(req);
        (0, express_validator_1.body)('questions.*.responses')
            .optional()
            .isArray({ min: 1 })
            .withMessage('responses must be a non-empty array.')
            .run(req);
        (0, express_validator_1.body)('questions.*.responses.*.content')
            .notEmpty()
            .withMessage('content field is required.')
            .run(req);
        return true;
    });
};
const validateCreateSurvey = () => [
    (0, validationHelpers_1.createNotEmptyValidation)('name'),
    (0, validationHelpers_1.createNotEmptyValidation)('description'),
    (0, validationHelpers_1.createDateValidation)('startDate'),
    (0, validationHelpers_1.createDateValidation)('endDate'),
    (0, validationHelpers_1.createTimeValidation)('startTime'),
    (0, validationHelpers_1.createTimeValidation)('endTime'),
    questionsValidation()
];
exports.validateCreateSurvey = validateCreateSurvey;
const validateSendSurvey = () => [
    (0, validationHelpers_1.createNotEmptyValidation)('studentId'),
    (0, validationHelpers_1.createNotEmptyValidation)('surveyId'),
    (0, validationHelpers_1.createArrayValidation)('responses'),
    (0, validationHelpers_1.createNotEmptyValidation)('questions.*.content'),
    (0, validationHelpers_1.createNotEmptyValidation)('questions.*.questionId')
];
exports.validateSendSurvey = validateSendSurvey;
const validateGetSurvey = () => [
    (0, validationHelpers_1.createNotEmptyValidation)('surveyId', 'param')
];
exports.validateGetSurvey = validateGetSurvey;
const validateUpdateSurvey = () => [
    (0, validationHelpers_1.createNotEmptyValidation)('surveyId', 'param'),
    atLeastOneFieldValidation()
];
exports.validateUpdateSurvey = validateUpdateSurvey;
const validateDeleteSurvey = () => [
    (0, validationHelpers_1.createNotEmptyValidation)('surveyId', 'param')
];
exports.validateDeleteSurvey = validateDeleteSurvey;
