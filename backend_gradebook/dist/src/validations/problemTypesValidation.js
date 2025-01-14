"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateDeleteProblemType = exports.validateCreateProblemType = void 0;
const validationHelpers_1 = require("../utils/validationHelpers");
const validateCreateProblemType = () => [
    (0, validationHelpers_1.createNotEmptyValidation)('name'),
];
exports.validateCreateProblemType = validateCreateProblemType;
const validateDeleteProblemType = () => [
    (0, validationHelpers_1.createNotEmptyValidation)('problemTypeId', 'param')
];
exports.validateDeleteProblemType = validateDeleteProblemType;
