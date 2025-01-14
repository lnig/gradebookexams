"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateGradeAttempt = void 0;
const express_validator_1 = require("express-validator");
const validateGradeAttempt = () => {
    return [
        (0, express_validator_1.body)('*.student_open_answer_id')
            .exists().withMessage('student_open_answer_id is required')
            .isUUID().withMessage('student_open_answer_id must be valid UUID'),
        (0, express_validator_1.body)('*.score')
            .exists().withMessage('score is required')
            .isInt({ min: 0 }).withMessage('score must be a non-negative integer.'),
    ];
};
exports.validateGradeAttempt = validateGradeAttempt;
