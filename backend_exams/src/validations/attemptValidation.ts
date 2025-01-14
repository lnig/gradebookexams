import { body, param, ValidationChain } from 'express-validator';
import { validate as isUUID } from 'uuid';

export const validateSaveAttempt = (): ValidationChain[] => {
    return [
        param('attempt_id')
            .exists().withMessage('attempt_id is required.')
            .bail()
            .custom((value: string) => isUUID(value))
            .withMessage('attempt_id must be a valid UUID.'),

        body('closed_answers.*.closed_question_id')
            .exists().withMessage('closed_question_id is required for each closed answer.')
            .bail()
            .custom((value: string) => isUUID(value))
            .withMessage('closed_question_id must be a valid UUID.'),
        body('closed_answers.*.closed_answer_id')
            .exists().withMessage('closed_answer_id is required for each closed answer.')
            .bail()
            .custom((value: string) => isUUID(value))
            .withMessage('closed_answer_id must be a valid UUID.'),

        body('open_answers')
            .isArray().withMessage('open_answers must be an array.'),
        body('open_answers.*.open_question_id')
            .exists().withMessage('open_question_id is required for each open answer.')
            .bail()
            .custom((value: string) => isUUID(value))
            .withMessage('open_question_id must be a valid UUID.'),
        body('open_answers.*.description')
            .exists().withMessage('description is required for each open answer.')
            .bail()
            .isString().withMessage('description must be a string.'),
    ];
};

export const validateGetAttemptDetails = () => {
    return [
        param('attemptId')
            .isUUID().withMessage('attemptId must be a valid UUID.'),
    ];
};