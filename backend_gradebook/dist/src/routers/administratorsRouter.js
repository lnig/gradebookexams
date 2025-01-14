"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_js_1 = require("../modules/auth.js");
const userTypes_js_1 = require("../enums/userTypes.js");
const administrators_js_1 = require("../handlers/administrators.js");
const administratorsRouter = (0, express_1.Router)();
administratorsRouter.get('', auth_js_1.authenticate, (0, auth_js_1.authorize)([userTypes_js_1.UserType.Administrator, userTypes_js_1.UserType.Teacher, userTypes_js_1.UserType.Parent, userTypes_js_1.UserType.Student]), administrators_js_1.getAdministrators);
exports.default = administratorsRouter;
