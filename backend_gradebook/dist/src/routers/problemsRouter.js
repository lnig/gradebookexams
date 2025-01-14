"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_js_1 = require("../modules/auth.js");
const problems_js_1 = require("../handlers/problems.js");
const problemsValidation_js_1 = require("../validations/problemsValidation.js");
const middleware_js_1 = require("../modules/middleware.js");
const userTypes_js_1 = require("../enums/userTypes.js");
const problemsRouter = (0, express_1.Router)();
problemsRouter.post('', auth_js_1.authenticate, (0, auth_js_1.authorize)([userTypes_js_1.UserType.Administrator, userTypes_js_1.UserType.Teacher, userTypes_js_1.UserType.Parent, userTypes_js_1.UserType.Student]), (0, problemsValidation_js_1.validateCreateProblem)(), middleware_js_1.handleInputErrors, problems_js_1.createProblem);
problemsRouter.get('', auth_js_1.authenticate, (0, auth_js_1.authorize)([userTypes_js_1.UserType.Administrator, userTypes_js_1.UserType.Teacher]), problems_js_1.getProblems);
problemsRouter.get('/:problemTypeId', auth_js_1.authenticate, (0, auth_js_1.authorize)([userTypes_js_1.UserType.Administrator, userTypes_js_1.UserType.Teacher, userTypes_js_1.UserType.Parent, userTypes_js_1.UserType.Student]), (0, problemsValidation_js_1.validateGetProblemsByType)(), middleware_js_1.handleInputErrors, problems_js_1.getProblemsByType);
problemsRouter.patch('/:problemId', auth_js_1.authenticate, (0, auth_js_1.authorize)([userTypes_js_1.UserType.Administrator, userTypes_js_1.UserType.Teacher]), (0, problemsValidation_js_1.validateUpdateProblem)(), middleware_js_1.handleInputErrors, problems_js_1.updateProblem);
problemsRouter.delete('/:problemId', auth_js_1.authenticate, (0, auth_js_1.authorize)([userTypes_js_1.UserType.Administrator, userTypes_js_1.UserType.Teacher]), (0, problemsValidation_js_1.validateDeleteProblem)(), middleware_js_1.handleInputErrors, problems_js_1.deleteProblem);
exports.default = problemsRouter;
