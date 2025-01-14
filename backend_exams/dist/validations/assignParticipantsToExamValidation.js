"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRemoveParticipants = exports.validateAssignParticipants = void 0;
const express_validator_1 = require("express-validator");
const uuid_1 = require("uuid");
const validateAssignParticipants = () => [
    (0, express_validator_1.param)('exam_id').isUUID().withMessage('Invalid exam ID format.'),
    (0, express_validator_1.body)('classes').optional().isArray().withMessage('Classes must be an array.'),
    (0, express_validator_1.body)('classes.*').isUUID().withMessage('Each class ID must be a valid UUID.'),
    (0, express_validator_1.body)('students').optional().isArray().withMessage('Students must be an array.'),
    (0, express_validator_1.body)('students.*').isUUID().withMessage('Each student ID must be a valid UUID.'),
];
exports.validateAssignParticipants = validateAssignParticipants;
const validateRemoveParticipants = () => {
    return [
        (0, express_validator_1.body)('classes')
            .optional()
            .isArray().withMessage('Classes must be an array.')
            .bail()
            .custom((classes) => classes.every(cls => (0, uuid_1.validate)(cls)))
            .withMessage('All class IDs must be valid UUIDs.'),
        (0, express_validator_1.body)('students')
            .optional()
            .isArray().withMessage('Students must be an array.')
            .bail()
            .custom((students) => students.every(student => (0, uuid_1.validate)(student)))
            .withMessage('All student IDs must be valid UUIDs.'),
    ];
};
exports.validateRemoveParticipants = validateRemoveParticipants;
