"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateDeleteStatus = exports.validateCreateStatus = void 0;
const validationHelpers_1 = require("../utils/validationHelpers");
const validateCreateStatus = () => [
    (0, validationHelpers_1.createNotEmptyValidation)('name'),
];
exports.validateCreateStatus = validateCreateStatus;
const validateDeleteStatus = () => [
    (0, validationHelpers_1.createNotEmptyValidation)('statusId', 'param')
];
exports.validateDeleteStatus = validateDeleteStatus;
