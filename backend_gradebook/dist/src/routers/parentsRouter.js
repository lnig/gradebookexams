"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_js_1 = require("../modules/auth.js");
const userTypes_js_1 = require("../enums/userTypes.js");
const parents_js_1 = require("../handlers/parents.js");
const parentsRouter = (0, express_1.Router)();
parentsRouter.get('', auth_js_1.authenticate, (0, auth_js_1.authorize)([userTypes_js_1.UserType.Administrator, userTypes_js_1.UserType.Teacher, userTypes_js_1.UserType.Parent, userTypes_js_1.UserType.Student]), parents_js_1.getParents);
parentsRouter.get('/available-parents', auth_js_1.authenticate, (0, auth_js_1.authorize)([userTypes_js_1.UserType.Administrator, userTypes_js_1.UserType.Teacher]), parents_js_1.getAvailableParents);
exports.default = parentsRouter;
