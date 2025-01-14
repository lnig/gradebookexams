"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateUpdateAttendance = exports.validateGetAttendancesByDate = exports.validateGetClassAttendances = exports.validateStudentId = exports.validateGetAttendances = exports.validateCreateAttendances = void 0;
const validationHelpers_1 = require("../utils/validationHelpers");
const validateCreateAttendances = () => [
    (0, validationHelpers_1.createArrayValidation)('attendances'),
    (0, validationHelpers_1.createNotEmptyValidation)('lessonId'),
    (0, validationHelpers_1.createBooleanValidation)('attendances.*.wasPresent'),
    (0, validationHelpers_1.createBooleanValidation)('attendances.*.wasLate'),
    (0, validationHelpers_1.createBooleanValidation)('attendances.*.wasExcused'),
    (0, validationHelpers_1.createNotEmptyValidation)('attendances.*.studentId'),
];
exports.validateCreateAttendances = validateCreateAttendances;
const validateGetAttendances = () => [
    (0, validationHelpers_1.createNotEmptyValidation)('lessonId', 'param')
];
exports.validateGetAttendances = validateGetAttendances;
const validateStudentId = () => [
    (0, validationHelpers_1.createNotEmptyValidation)('studentId', 'param')
];
exports.validateStudentId = validateStudentId;
const validateGetClassAttendances = () => [
    (0, validationHelpers_1.createNotEmptyValidation)('classId', 'param')
];
exports.validateGetClassAttendances = validateGetClassAttendances;
const validateGetAttendancesByDate = () => [
    (0, validationHelpers_1.createNotEmptyValidation)('studentId', 'param'),
    (0, validationHelpers_1.createDateValidation)('date', 'param')
];
exports.validateGetAttendancesByDate = validateGetAttendancesByDate;
const validateUpdateAttendance = () => [
    (0, validationHelpers_1.createNotEmptyValidation)('attendanceId', 'param'),
    (0, validationHelpers_1.createBooleanValidation)('wasPresent'),
    (0, validationHelpers_1.createBooleanValidation)('wasLate'),
    (0, validationHelpers_1.createBooleanValidation)('wasExcused')
];
exports.validateUpdateAttendance = validateUpdateAttendance;
