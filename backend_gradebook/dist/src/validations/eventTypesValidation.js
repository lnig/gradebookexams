"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateEventTypeUpdate = exports.validateEventTypeId = exports.validateEventTypeName = void 0;
const validationHelpers_1 = require("../utils/validationHelpers");
const validateEventTypeName = () => [
    (0, validationHelpers_1.createNotEmptyValidation)('name'),
];
exports.validateEventTypeName = validateEventTypeName;
const validateEventTypeId = () => [
    (0, validationHelpers_1.createNotEmptyValidation)('eventTypeId', 'param'),
];
exports.validateEventTypeId = validateEventTypeId;
const validateEventTypeUpdate = () => [
    (0, validationHelpers_1.createNotEmptyValidation)('eventTypeId', 'param'),
    (0, validationHelpers_1.createNotEmptyValidation)('name')
];
exports.validateEventTypeUpdate = validateEventTypeUpdate;
