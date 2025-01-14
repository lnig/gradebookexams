"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateUnassignParentFromStudent = exports.validateAssignParentToStudent = void 0;
const validationUtils_js_1 = require("./validationUtils.js");
const validateAssignParentToStudent = () => {
    return [
        (0, validationUtils_js_1.createIntValidation)('studentId'),
        (0, validationUtils_js_1.createIntValidation)('parentId')
    ];
};
exports.validateAssignParentToStudent = validateAssignParentToStudent;
const validateUnassignParentFromStudent = () => {
    return [
        (0, validationUtils_js_1.createIntValidation)('studentId', 'param'),
        (0, validationUtils_js_1.createIntValidation)('studentId', 'param'),
    ];
};
exports.validateUnassignParentFromStudent = validateUnassignParentFromStudent;
