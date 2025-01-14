"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_js_1 = require("../modules/auth.js");
const userTypes_js_1 = require("../enums/userTypes.js");
const teachers_js_1 = require("../handlers/teachers.js");
const teachersRouter = (0, express_1.Router)();
teachersRouter.get('', auth_js_1.authenticate, (0, auth_js_1.authorize)([userTypes_js_1.UserType.Administrator, userTypes_js_1.UserType.Teacher, userTypes_js_1.UserType.Parent, userTypes_js_1.UserType.Student]), teachers_js_1.getTeachers);
exports.default = teachersRouter;
