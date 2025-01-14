import { createNotEmptyValidation, createIntValidation } from './validationUtils.js';

export const validateSubjectName = () => [
    createNotEmptyValidation('name')
];

export const validateSubjectId = () => [
    createIntValidation('subjectId', 'param')
];