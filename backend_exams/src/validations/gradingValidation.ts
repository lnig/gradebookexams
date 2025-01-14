import { body } from 'express-validator';

export const validateGradeAttempt = () => {
    return [
        body('*.student_open_answer_id')
            .exists().withMessage('student_open_answer_id is required')
            .isUUID().withMessage('student_open_answer_id must be valid UUID'),
        body('*.score')
            .exists().withMessage('score is required')
            .isInt({ min: 0 }).withMessage('score must be a non-negative integer.'),
    ];
};