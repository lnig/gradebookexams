"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_js_1 = require("../modules/auth.js");
const users_js_1 = require("../handlers/users.js");
const students_js_1 = require("../handlers/students.js");
const teachers_js_1 = require("../handlers/teachers.js");
const parents_js_1 = require("../handlers/parents.js");
const administrators_js_1 = require("../handlers/administrators.js");
const authValidation_js_1 = require("../validations/authValidation.js");
const middleware_js_1 = require("../modules/middleware.js");
const userTypes_js_1 = require("../enums/userTypes.js");
const authRouter = (0, express_1.Router)();
authRouter.post('/signin', (0, authValidation_js_1.validateSignIn)(), middleware_js_1.handleInputErrors, users_js_1.signIn);
authRouter.post('/signup/student', auth_js_1.authenticate, (0, auth_js_1.authorize)([userTypes_js_1.UserType.Administrator]), (0, authValidation_js_1.validateSignUp)(), middleware_js_1.handleInputErrors, students_js_1.signUpStudent);
authRouter.post('/signup/teacher', auth_js_1.authenticate, (0, auth_js_1.authorize)([userTypes_js_1.UserType.Administrator]), (0, authValidation_js_1.validateSignUp)(), middleware_js_1.handleInputErrors, teachers_js_1.signUpTeacher);
authRouter.post('/signup/parent', auth_js_1.authenticate, (0, auth_js_1.authorize)([userTypes_js_1.UserType.Administrator]), (0, authValidation_js_1.validateSignUp)(), middleware_js_1.handleInputErrors, parents_js_1.signUpParent);
authRouter.post('/signup/administrator', 
//authenticate,
//authorize([UserType.Administrator]),
(0, authValidation_js_1.validateSignUp)(), middleware_js_1.handleInputErrors, administrators_js_1.signUpAdministrator);
authRouter.post('/forgot-password', (0, authValidation_js_1.validateForgotPassword)(), middleware_js_1.handleInputErrors, users_js_1.forgotPassword);
authRouter.post('/reset-password', auth_js_1.authenticate, (0, authValidation_js_1.validateResetPassword)(), middleware_js_1.handleInputErrors, users_js_1.resetPassword);
exports.default = authRouter;
