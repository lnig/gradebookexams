"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.signUpAdministrator = void 0;
const users_js_1 = require("./users.js");
const userTypes_js_1 = require("../enums/userTypes.js");
const signUpAdministrator = (req, res) => {
    return (0, users_js_1.signUp)(req, res, userTypes_js_1.UserType.Administrator);
};
exports.signUpAdministrator = signUpAdministrator;
