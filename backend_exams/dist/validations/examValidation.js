"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateShowAllOpenAnswersToGrade = exports.validateShowOpenAnswersToGrade = exports.validateGetExamResults = exports.validateUpdateExam = exports.validateStartExamAttempt = exports.validateDeleteExam = exports.validateGetExam = exports.validateCreateExam = void 0;
const express_validator_1 = require("express-validator");
const uuid_1 = require("uuid");
const validateCreateExam = () => [
    (0, express_validator_1.body)('start_date_time')
        .exists().withMessage('Start date and time is required.')
        .isISO8601().withMessage('Start date and time must be a valid ISO 8601 date.'),
    (0, express_validator_1.body)('end_date_time')
        .exists().withMessage('End date and time is required.')
        .isISO8601().withMessage('End date and time must be a valid ISO 8601 date.')
        .custom((value, { req }) => {
        if (new Date(value) <= new Date(req.body.start_date_time)) {
            throw new Error('End date and time must be after start date and time.');
        }
        return true;
    }),
    (0, express_validator_1.body)('visibility')
        .optional()
        .isBoolean().withMessage('Visibility must be a boolean.'),
    (0, express_validator_1.body)('duration')
        .exists().withMessage('Duration is required.')
        .isInt({ min: 1 }).withMessage('Duration must be a positive integer.'),
    (0, express_validator_1.body)('description')
        .optional()
        .isString().withMessage('Description must be a string.')
        .isLength({ max: 255 }).withMessage('Description cannot exceed 255 characters.'),
    (0, express_validator_1.body)('multiple_tries')
        .optional()
        .isBoolean().withMessage('Multiple tries must be a boolean.'),
    (0, express_validator_1.body)('hide_results')
        .optional()
        .isBoolean().withMessage('Hide results must be a boolean.'),
    (0, express_validator_1.body)('display_points_per_question')
        .optional()
        .isBoolean().withMessage('Display points per question must be a boolean.'),
    (0, express_validator_1.body)('show_correct_answers')
        .optional()
        .isBoolean().withMessage('Show correct answers must be a boolean.'),
    (0, express_validator_1.body)('allow_navigation')
        .optional()
        .isBoolean().withMessage('Allow navigation must be a boolean.'),
    (0, express_validator_1.body)('allow_review')
        .optional()
        .isBoolean().withMessage('Allow review must be a boolean.'),
    (0, express_validator_1.body)('number_of_questions')
        .exists().withMessage('number_of_questions is required.')
        .isInt({ min: 1 }).withMessage('number_of_questions must be a positive integer.'),
];
exports.validateCreateExam = validateCreateExam;
const validateGetExam = () => [
    (0, express_validator_1.param)('exam_id')
        .exists().withMessage('Exam ID is required.')
        .isUUID().withMessage('Exam ID must be a valid UUID.'),
];
exports.validateGetExam = validateGetExam;
const validateDeleteExam = () => [
    (0, express_validator_1.param)('exam_id')
        .exists().withMessage('Exam ID is required.')
        .isUUID().withMessage('Exam ID must be a valid UUID.'),
];
exports.validateDeleteExam = validateDeleteExam;
const validateStartExamAttempt = () => {
    return [
        (0, express_validator_1.param)('exam_id')
            .exists().withMessage('exam_id is required.')
            .bail()
            .custom((value) => (0, uuid_1.validate)(value))
            .withMessage('exam_id must be a valid UUID.'),
    ];
};
exports.validateStartExamAttempt = validateStartExamAttempt;
const validateUpdateExam = () => {
    return [
        (0, express_validator_1.param)('exam_id')
            .exists().withMessage('exam_id is required.')
            .bail()
            .custom((value) => (0, uuid_1.validate)(value))
            .withMessage('exam_id must be a valid UUID.'),
        // All fields are required
        (0, express_validator_1.body)('start_date_time')
            .exists().withMessage('start_date_time is required.')
            .bail()
            .isISO8601().withMessage('start_date_time must be a valid ISO8601 date.'),
        (0, express_validator_1.body)('end_date_time')
            .exists().withMessage('end_date_time is required.')
            .bail()
            .isISO8601().withMessage('end_date_time must be a valid ISO8601 date.'),
        (0, express_validator_1.body)('visibility')
            .exists().withMessage('visibility is required.')
            .bail()
            .isBoolean().withMessage('visibility must be a boolean.'),
        (0, express_validator_1.body)('number_of_questions')
            .exists().withMessage('number_of_questions is required.')
            .bail()
            .isInt({ min: 1 }).withMessage('number_of_questions must be an integer greater than 0.'),
        (0, express_validator_1.body)('duration')
            .exists().withMessage('duration is required.')
            .bail()
            .isInt({ min: 1 }).withMessage('duration must be an integer greater than 0.'),
        (0, express_validator_1.body)('description')
            .exists().withMessage('description is required.')
            .bail()
            .isString().withMessage('description must be a string.'),
        (0, express_validator_1.body)('number_of_tries')
            .exists().withMessage('number_of_tries is required.')
            .bail()
            .isInt({ min: 1 }).withMessage('number_of_tries must be an integer greater than 0.'),
        (0, express_validator_1.body)('multiple_tries')
            .exists().withMessage('multiple_tries is required.')
            .bail()
            .isBoolean().withMessage('multiple_tries must be a boolean.'),
        (0, express_validator_1.body)('randomise_answers')
            .exists().withMessage('randomise_answers is required.')
            .bail()
            .isBoolean().withMessage('randomise_answers must be a boolean.'),
        (0, express_validator_1.body)('latest_attempt_counts')
            .exists().withMessage('latest_attempt_counts is required.')
            .bail()
            .isBoolean().withMessage('latest_attempt_counts must be a boolean.'),
        (0, express_validator_1.body)('best_attempt_counts')
            .exists().withMessage('best_attempt_counts is required.')
            .bail()
            .isBoolean().withMessage('best_attempt_counts must be a boolean.'),
        (0, express_validator_1.body)('hide_results')
            .exists().withMessage('hide_results is required.')
            .bail()
            .isBoolean().withMessage('hide_results must be a boolean.'),
        (0, express_validator_1.body)('display_points_per_question')
            .exists().withMessage('display_points_per_question is required.')
            .bail()
            .isBoolean().withMessage('display_points_per_question must be a boolean.'),
        (0, express_validator_1.body)('show_correct_answers')
            .exists().withMessage('show_correct_answers is required.')
            .bail()
            .isBoolean().withMessage('show_correct_answers must be a boolean.'),
        (0, express_validator_1.body)('allow_navigation')
            .exists().withMessage('allow_navigation is required.')
            .bail()
            .isBoolean().withMessage('allow_navigation must be a boolean.'),
        (0, express_validator_1.body)('allow_review')
            .exists().withMessage('allow_review is required.')
            .bail()
            .isBoolean().withMessage('allow_review must be a boolean.'),
    ];
};
exports.validateUpdateExam = validateUpdateExam;
const validateGetExamResults = () => {
    return [
        (0, express_validator_1.param)('exam_id')
            .isUUID().withMessage('exam_id must be a valid UUID.'),
    ];
};
exports.validateGetExamResults = validateGetExamResults;
const validateShowOpenAnswersToGrade = () => {
    return [
        (0, express_validator_1.param)('attempt_id')
            .isUUID().withMessage('attempt_id must be a valid UUID.'),
    ];
};
exports.validateShowOpenAnswersToGrade = validateShowOpenAnswersToGrade;
const validateShowAllOpenAnswersToGrade = () => {
    return [
        (0, express_validator_1.param)('exam_id')
            .isUUID().withMessage('exam_id must be a valid UUID.'),
    ];
};
exports.validateShowAllOpenAnswersToGrade = validateShowAllOpenAnswersToGrade;
