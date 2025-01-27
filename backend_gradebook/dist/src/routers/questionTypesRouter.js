"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_js_1 = require("../modules/auth.js");
const questionTypes_js_1 = require("../handlers/questionTypes.js");
const questionTypesValidation_js_1 = require("../validations/questionTypesValidation.js");
const middleware_js_1 = require("../modules/middleware.js");
const userTypes_js_1 = require("../enums/userTypes.js");
const questionTypesRouter = (0, express_1.Router)();
questionTypesRouter.post('', auth_js_1.authenticate, (0, auth_js_1.authorize)([userTypes_js_1.UserType.Administrator, userTypes_js_1.UserType.Teacher]), (0, questionTypesValidation_js_1.validateCreateQuestionType)(), middleware_js_1.handleInputErrors, questionTypes_js_1.createQuestionType);
questionTypesRouter.get('', auth_js_1.authenticate, (0, auth_js_1.authorize)([userTypes_js_1.UserType.Administrator, userTypes_js_1.UserType.Teacher]), questionTypes_js_1.getQuestionTypes);
questionTypesRouter.delete('/:questionTypeId', auth_js_1.authenticate, (0, auth_js_1.authorize)([userTypes_js_1.UserType.Administrator, userTypes_js_1.UserType.Teacher]), (0, questionTypesValidation_js_1.validateDeleteQuestionType)(), middleware_js_1.handleInputErrors, questionTypes_js_1.deleteQuestionType);
exports.default = questionTypesRouter;
