"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_js_1 = require("../modules/auth.js");
const surveys_js_1 = require("../handlers/surveys.js");
const surveysValidation_js_1 = require("../validations/surveysValidation.js");
const middleware_js_1 = require("../modules/middleware.js");
const userTypes_js_1 = require("../enums/userTypes.js");
const surveysRouter = (0, express_1.Router)();
surveysRouter.post('', auth_js_1.authenticate, (0, auth_js_1.authorize)([userTypes_js_1.UserType.Administrator, userTypes_js_1.UserType.Teacher]), (0, surveysValidation_js_1.validateCreateSurvey)(), middleware_js_1.handleInputErrors, surveys_js_1.createSurvey);
surveysRouter.post('/submit', auth_js_1.authenticate, (0, auth_js_1.authorize)([userTypes_js_1.UserType.Administrator, userTypes_js_1.UserType.Teacher, userTypes_js_1.UserType.Student, userTypes_js_1.UserType.Parent]), surveys_js_1.sendSurvey);
surveysRouter.get('', auth_js_1.authenticate, (0, auth_js_1.authorize)([userTypes_js_1.UserType.Administrator, userTypes_js_1.UserType.Teacher, userTypes_js_1.UserType.Parent, userTypes_js_1.UserType.Student]), surveys_js_1.getSurveys);
surveysRouter.get('/details/:surveyId', auth_js_1.authenticate, (0, auth_js_1.authorize)([userTypes_js_1.UserType.Administrator, userTypes_js_1.UserType.Teacher, userTypes_js_1.UserType.Parent, userTypes_js_1.UserType.Student]), surveys_js_1.getSurveyFullDetails);
surveysRouter.get('/:surveyId', auth_js_1.authenticate, (0, auth_js_1.authorize)([userTypes_js_1.UserType.Administrator, userTypes_js_1.UserType.Teacher, userTypes_js_1.UserType.Parent, userTypes_js_1.UserType.Student]), (0, surveysValidation_js_1.validateGetSurvey)(), middleware_js_1.handleInputErrors, surveys_js_1.getSurvey);
surveysRouter.patch('/:surveyId', auth_js_1.authenticate, (0, auth_js_1.authorize)([userTypes_js_1.UserType.Administrator, userTypes_js_1.UserType.Teacher]), (0, surveysValidation_js_1.validateUpdateSurvey)(), middleware_js_1.handleInputErrors, surveys_js_1.updateSurvey);
surveysRouter.delete('/:surveyId', auth_js_1.authenticate, (0, auth_js_1.authorize)([userTypes_js_1.UserType.Administrator, userTypes_js_1.UserType.Teacher]), (0, surveysValidation_js_1.validateDeleteSurvey)(), middleware_js_1.handleInputErrors, surveys_js_1.deleteSurvey);
exports.default = surveysRouter;
