"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const notifications_1 = require("../handlers/notifications");
const auth_js_1 = require("../modules/auth.js");
const middleware_1 = require("../modules/middleware");
const userTypes_1 = require("../enums/userTypes");
const notificationsRouter = express_1.default.Router();
notificationsRouter.get('/getNotifications', auth_js_1.authenticate, (0, auth_js_1.authorize)([userTypes_1.UserType.Student]), middleware_1.handleInputErrors, notifications_1.getNotifications);
notificationsRouter.post('/markAsRead', auth_js_1.authenticate, (0, auth_js_1.authorize)([userTypes_1.UserType.Student]), middleware_1.handleInputErrors, notifications_1.markNotificationsAsRead);
exports.default = notificationsRouter;
