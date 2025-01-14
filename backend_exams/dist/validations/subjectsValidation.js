"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateSubjectId = exports.validateSubjectName = void 0;
const validationUtils_js_1 = require("./validationUtils.js");
const validateSubjectName = () => [
    (0, validationUtils_js_1.createNotEmptyValidation)('name')
];
exports.validateSubjectName = validateSubjectName;
const validateSubjectId = () => [
    (0, validationUtils_js_1.createIntValidation)('subjectId', 'param')
];
exports.validateSubjectId = validateSubjectId;
