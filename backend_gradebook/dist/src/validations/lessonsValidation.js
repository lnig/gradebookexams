"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateClassId = exports.validateUserId = exports.validateDeleteLesson = exports.validateDeleteLessonsByClassIdAndDate = exports.validateClassAndSubjectIds = exports.validateUpdateLesson = exports.validateCreateLessons = void 0;
const validationHelpers_1 = require("../utils/validationHelpers");
const validateCreateLessons = () => [
    (0, validationHelpers_1.createDateValidation)('startDate'),
    (0, validationHelpers_1.createDateValidation)('endDate'),
    (0, validationHelpers_1.createNotEmptyValidation)('teacherId'),
    (0, validationHelpers_1.createNotEmptyValidation)('classId'),
    (0, validationHelpers_1.createNotEmptyValidation)('subjectId'),
    (0, validationHelpers_1.createArrayValidation)('lessonSchedules'),
    (0, validationHelpers_1.createIntValidation)('lessonSchedules.*.dayOfWeek', 'body', 0, 6),
    (0, validationHelpers_1.createTimeValidation)('lessonSchedules.*.startTime'),
    (0, validationHelpers_1.createTimeValidation)('lessonSchedules.*.endTime'),
    (0, validationHelpers_1.createIntValidation)('lessonSchedules.*.frequency', 'body', 1)
];
exports.validateCreateLessons = validateCreateLessons;
const validateUpdateLesson = () => [
    (0, validationHelpers_1.createNotEmptyValidation)('lessonId', 'param'),
    (0, validationHelpers_1.createNotEmptyValidation)('description')
];
exports.validateUpdateLesson = validateUpdateLesson;
const validateClassAndSubjectIds = () => [
    (0, validationHelpers_1.createNotEmptyValidation)('classId', 'param'),
    (0, validationHelpers_1.createNotEmptyValidation)('subjectId', 'param')
];
exports.validateClassAndSubjectIds = validateClassAndSubjectIds;
const validateDeleteLessonsByClassIdAndDate = () => [
    (0, validationHelpers_1.createNotEmptyValidation)('classId', 'param'),
    (0, validationHelpers_1.createDateValidation)('date', 'param')
];
exports.validateDeleteLessonsByClassIdAndDate = validateDeleteLessonsByClassIdAndDate;
const validateDeleteLesson = () => [
    (0, validationHelpers_1.createNotEmptyValidation)('lessonId', 'param'),
];
exports.validateDeleteLesson = validateDeleteLesson;
const validateUserId = () => [
    (0, validationHelpers_1.createNotEmptyValidation)('userId', 'param'),
];
exports.validateUserId = validateUserId;
const validateClassId = () => [
    (0, validationHelpers_1.createNotEmptyValidation)('classId', 'param'),
];
exports.validateClassId = validateClassId;
