import { body, param, ValidationChain  } from 'express-validator';
import { validate as isUUID, } from 'uuid';

export const validateAssignParticipants = () => [
    param('exam_id').isUUID().withMessage('Invalid exam ID format.'),
    body('classes').optional().isArray().withMessage('Classes must be an array.'),
    body('classes.*').isUUID().withMessage('Each class ID must be a valid UUID.'),
    body('students').optional().isArray().withMessage('Students must be an array.'),
    body('students.*').isUUID().withMessage('Each student ID must be a valid UUID.'),
];

export const validateRemoveParticipants = (): ValidationChain[] => {
    return [
        body('classes')
            .optional()
            .isArray().withMessage('Classes must be an array.')
            .bail()
            .custom((classes: any[]) => classes.every(cls => isUUID(cls)))
            .withMessage('All class IDs must be valid UUIDs.'),
        body('students')
            .optional()
            .isArray().withMessage('Students must be an array.')
            .bail()
            .custom((students: any[]) => students.every(student => isUUID(student)))
            .withMessage('All student IDs must be valid UUIDs.'),
    ];
};