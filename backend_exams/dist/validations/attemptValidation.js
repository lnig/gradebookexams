"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateGetAttemptDetails = exports.validateSaveAttempt = void 0;
const express_validator_1 = require("express-validator");
const uuid_1 = require("uuid");
const validateSaveAttempt = () => {
    return [
        (0, express_validator_1.param)('attempt_id')
            .exists().withMessage('attempt_id is required.')
            .bail()
            .custom((value) => (0, uuid_1.validate)(value))
            .withMessage('attempt_id must be a valid UUID.'),
        (0, express_validator_1.body)('closed_answers.*.closed_question_id')
            .exists().withMessage('closed_question_id is required for each closed answer.')
            .bail()
            .custom((value) => (0, uuid_1.validate)(value))
            .withMessage('closed_question_id must be a valid UUID.'),
        (0, express_validator_1.body)('closed_answers.*.closed_answer_id')
            .exists().withMessage('closed_answer_id is required for each closed answer.')
            .bail()
            .custom((value) => (0, uuid_1.validate)(value))
            .withMessage('closed_answer_id must be a valid UUID.'),
        (0, express_validator_1.body)('open_answers')
            .isArray().withMessage('open_answers must be an array.'),
        (0, express_validator_1.body)('open_answers.*.open_question_id')
            .exists().withMessage('open_question_id is required for each open answer.')
            .bail()
            .custom((value) => (0, uuid_1.validate)(value))
            .withMessage('open_question_id must be a valid UUID.'),
        (0, express_validator_1.body)('open_answers.*.description')
            .exists().withMessage('description is required for each open answer.')
            .bail()
            .isString().withMessage('description must be a string.'),
    ];
};
exports.validateSaveAttempt = validateSaveAttempt;
const validateGetAttemptDetails = () => {
    return [
        (0, express_validator_1.param)('attemptId')
            .isUUID().withMessage('attemptId must be a valid UUID.'),
    ];
};
exports.validateGetAttemptDetails = validateGetAttemptDetails;
