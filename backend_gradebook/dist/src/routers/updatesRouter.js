"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_js_1 = require("../modules/auth.js");
const updates_js_1 = require("../handlers/updates.js");
const updatesValidation_js_1 = require("../validations/updatesValidation.js");
const middleware_js_1 = require("../modules/middleware.js");
const userTypes_js_1 = require("../enums/userTypes.js");
const updatesRouter = (0, express_1.Router)();
updatesRouter.post('', auth_js_1.authenticate, (0, auth_js_1.authorize)([userTypes_js_1.UserType.Administrator, userTypes_js_1.UserType.Teacher]), (0, updatesValidation_js_1.validateCreateUpdate)(), middleware_js_1.handleInputErrors, updates_js_1.createUpdate);
updatesRouter.get('', auth_js_1.authenticate, (0, auth_js_1.authorize)([userTypes_js_1.UserType.Administrator, userTypes_js_1.UserType.Teacher, userTypes_js_1.UserType.Parent, userTypes_js_1.UserType.Student]), updates_js_1.getUpdates);
updatesRouter.patch('/:updateId', auth_js_1.authenticate, (0, auth_js_1.authorize)([userTypes_js_1.UserType.Administrator, userTypes_js_1.UserType.Teacher]), (0, updatesValidation_js_1.validateUpdateUpdate)(), middleware_js_1.handleInputErrors, updates_js_1.updateUpdate);
updatesRouter.delete('/:updateId', auth_js_1.authenticate, (0, auth_js_1.authorize)([userTypes_js_1.UserType.Administrator, userTypes_js_1.UserType.Teacher]), (0, updatesValidation_js_1.validateDeleteUpdate)(), middleware_js_1.handleInputErrors, updates_js_1.deleteUpdate);
exports.default = updatesRouter;
