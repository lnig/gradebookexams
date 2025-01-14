"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateClassId = exports.validateClassUpdate = exports.validateAssignStudent = exports.validateCreateClass = void 0;
const express_validator_1 = require("express-validator");
const validationUtils_js_1 = require("./validationUtils.js");
const classIdValidation = (0, validationUtils_js_1.createIntValidation)('classId', 'param');
const studentIdValidation = (0, validationUtils_js_1.createIntValidation)('studentId');
const teacherIdValidation = (0, validationUtils_js_1.createIntValidation)('teacherId');
const nameValidation = (0, validationUtils_js_1.createNotEmptyValidation)('name');
const yearbookValidation = (0, validationUtils_js_1.createNotEmptyValidation)('yearbook');
const atLeastOneFieldValidation = () => {
    return (0, express_validator_1.body)().custom((value, { req }) => {
        const name = req.body.name;
        const yearbook = req.body.yearbook;
        const teacherId = Number(req.body.teacherId);
        if (!name && !yearbook && !teacherId)
            throw new Error('At least one field must be provided.');
        if (name)
            nameValidation.run(req);
        if (yearbook)
            yearbookValidation.run(req);
        if (teacherId)
            teacherIdValidation.run(req);
        const result = (0, express_validator_1.validationResult)(req);
        if (!result.isEmpty())
            return false;
        return true;
    });
};
const validateCreateClass = () => [
    nameValidation,
    yearbookValidation
];
exports.validateCreateClass = validateCreateClass;
const validateAssignStudent = () => [
    classIdValidation,
    studentIdValidation
];
exports.validateAssignStudent = validateAssignStudent;
const validateClassUpdate = () => [
    classIdValidation,
    atLeastOneFieldValidation(),
];
exports.validateClassUpdate = validateClassUpdate;
const validateClassId = () => [
    classIdValidation
];
exports.validateClassId = validateClassId;
