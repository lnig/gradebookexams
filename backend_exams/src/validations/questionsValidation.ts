import { body } from 'express-validator';

export const validateAddQuestions = () => [
    body('open_questions').optional().isArray().withMessage('Open questions must be an array.'),
    body('open_questions.*.description').isString().withMessage('Open question description must be a string.'),
    body('open_questions.*.score').isInt().withMessage('Open question score must be an integer.'),
    body('open_questions.*.auto_check').isBoolean().withMessage('Open question auto_check must be a boolean.'),
    body('closed_questions').optional().isArray().withMessage('Closed questions must be an array.'),
    body('closed_questions.*.description').isString().withMessage('Closed question description must be a string.'),
    body('closed_questions.*.score').isInt().withMessage('Closed question score must be an integer.'),
    body('closed_questions.*.answers').isArray().withMessage('Closed question answers must be an array.'),
    body('closed_questions.*.answers.*.description').isString().withMessage('Answer description must be a string.'),
    body('closed_questions.*.answers.*.is_correct').isBoolean().withMessage('Answer is_correct must be a boolean.'),
];
