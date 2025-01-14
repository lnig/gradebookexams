"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateDeleteQuestion = exports.validateUpdateQuestion = void 0;
const validationHelpers_1 = require("../utils/validationHelpers");
const validateUpdateQuestion = () => [
    (0, validationHelpers_1.createNotEmptyValidation)('questionId'),
    (0, validationHelpers_1.createNotEmptyValidation)('content')
];
exports.validateUpdateQuestion = validateUpdateQuestion;
const validateDeleteQuestion = () => [
    (0, validationHelpers_1.createNotEmptyValidation)('questionId', 'param')
];
exports.validateDeleteQuestion = validateDeleteQuestion;
