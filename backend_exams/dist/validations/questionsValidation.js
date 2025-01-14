"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateAddQuestions = void 0;
const express_validator_1 = require("express-validator");
const validateAddQuestions = () => [
    (0, express_validator_1.body)('open_questions').optional().isArray().withMessage('Open questions must be an array.'),
    (0, express_validator_1.body)('open_questions.*.description').isString().withMessage('Open question description must be a string.'),
    (0, express_validator_1.body)('open_questions.*.score').isInt().withMessage('Open question score must be an integer.'),
    (0, express_validator_1.body)('open_questions.*.auto_check').isBoolean().withMessage('Open question auto_check must be a boolean.'),
    (0, express_validator_1.body)('closed_questions').optional().isArray().withMessage('Closed questions must be an array.'),
    (0, express_validator_1.body)('closed_questions.*.description').isString().withMessage('Closed question description must be a string.'),
    (0, express_validator_1.body)('closed_questions.*.score').isInt().withMessage('Closed question score must be an integer.'),
    (0, express_validator_1.body)('closed_questions.*.answers').isArray().withMessage('Closed question answers must be an array.'),
    (0, express_validator_1.body)('closed_questions.*.answers.*.description').isString().withMessage('Answer description must be a string.'),
    (0, express_validator_1.body)('closed_questions.*.answers.*.is_correct').isBoolean().withMessage('Answer is_correct must be a boolean.'),
];
exports.validateAddQuestions = validateAddQuestions;
