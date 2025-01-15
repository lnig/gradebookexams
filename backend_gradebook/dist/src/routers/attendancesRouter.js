"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const middleware_js_1 = require("../modules/middleware.js");
const attendances_js_1 = require("../handlers/attendances.js");
const auth_js_1 = require("../modules/auth.js");
const attendancesValidation_js_1 = require("../validations/attendancesValidation.js");
const userTypes_js_1 = require("../enums/userTypes.js");
const attendancesRouter = (0, express_1.Router)();
attendancesRouter.get('/student/:studentId/by-date/:date', auth_js_1.authenticate, (0, auth_js_1.authorize)([userTypes_js_1.UserType.Administrator, userTypes_js_1.UserType.Teacher, userTypes_js_1.UserType.Parent, userTypes_js_1.UserType.Student]), (0, attendancesValidation_js_1.validateGetAttendancesByDate)(), middleware_js_1.handleInputErrors, attendances_js_1.getStudentAttendancesByDate);
attendancesRouter.get('/student/:studentId', auth_js_1.authenticate, (0, auth_js_1.authorize)([userTypes_js_1.UserType.Administrator, userTypes_js_1.UserType.Teacher, userTypes_js_1.UserType.Parent, userTypes_js_1.UserType.Student]), (0, attendancesValidation_js_1.validateStudentId)(), middleware_js_1.handleInputErrors, attendances_js_1.getStudentAttendances);
attendancesRouter.patch('/excuse/:studentId/by-date/:date', auth_js_1.authenticate, (0, auth_js_1.authorize)([userTypes_js_1.UserType.Administrator, userTypes_js_1.UserType.Teacher, userTypes_js_1.UserType.Parent]), (0, attendancesValidation_js_1.validateUpdateAttendance)(), attendances_js_1.excuseAbsencesForStudentByDate);
attendancesRouter.patch('/excuse/:studentId', auth_js_1.authenticate, (0, auth_js_1.authorize)([userTypes_js_1.UserType.Administrator, userTypes_js_1.UserType.Teacher, userTypes_js_1.UserType.Parent]), (0, attendancesValidation_js_1.validateUpdateAttendance)(), attendances_js_1.excuseAbsencesForStudent);
attendancesRouter.patch('/:attendanceId', auth_js_1.authenticate, (0, auth_js_1.authorize)([userTypes_js_1.UserType.Administrator, userTypes_js_1.UserType.Teacher]), (0, attendancesValidation_js_1.validateUpdateAttendance)(), middleware_js_1.handleInputErrors, attendances_js_1.updateAttendance);
attendancesRouter.post('', auth_js_1.authenticate, (0, auth_js_1.authorize)([userTypes_js_1.UserType.Administrator, userTypes_js_1.UserType.Teacher]), (0, attendancesValidation_js_1.validateCreateAttendances)(), middleware_js_1.handleInputErrors, attendances_js_1.createAttendances);
attendancesRouter.get('/:lessonId', auth_js_1.authenticate, (0, auth_js_1.authorize)([userTypes_js_1.UserType.Administrator, userTypes_js_1.UserType.Teacher]), (0, attendancesValidation_js_1.validateGetAttendances)(), middleware_js_1.handleInputErrors, attendances_js_1.getLessonAttendances);
attendancesRouter.get('/statistics/:studentId', auth_js_1.authenticate, (0, auth_js_1.authorize)([userTypes_js_1.UserType.Administrator, userTypes_js_1.UserType.Teacher, userTypes_js_1.UserType.Parent, userTypes_js_1.UserType.Student]), (0, attendancesValidation_js_1.validateStudentId)(), middleware_js_1.handleInputErrors, attendances_js_1.getAttendancesStatistics);
attendancesRouter.get('/class/:classId', auth_js_1.authenticate, (0, auth_js_1.authorize)([userTypes_js_1.UserType.Administrator, userTypes_js_1.UserType.Teacher, userTypes_js_1.UserType.Student]), (0, attendancesValidation_js_1.validateGetClassAttendances)(), middleware_js_1.handleInputErrors, attendances_js_1.getClassAttendances);
exports.default = attendancesRouter;
