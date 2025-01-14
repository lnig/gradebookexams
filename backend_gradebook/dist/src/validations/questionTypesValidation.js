"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateDeleteQuestionType = exports.validateCreateQuestionType = void 0;
const validationHelpers_1 = require("../utils/validationHelpers");
const validateCreateQuestionType = () => [
    (0, validationHelpers_1.createNotEmptyValidation)('name'),
];
exports.validateCreateQuestionType = validateCreateQuestionType;
const validateDeleteQuestionType = () => [
    (0, validationHelpers_1.createNotEmptyValidation)('questionTypeId', 'param')
];
exports.validateDeleteQuestionType = validateDeleteQuestionType;
