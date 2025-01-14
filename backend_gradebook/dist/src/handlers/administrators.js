"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAdministrators = exports.signUpAdministrator = void 0;
const users_1 = require("./users");
const userTypes_1 = require("../enums/userTypes");
const db_1 = __importDefault(require("../db"));
const responseInterfaces_1 = require("../interfaces/responseInterfaces");
const uuid_1 = require("uuid");
const signUpAdministrator = (req, res) => {
    return (0, users_1.signUp)(req, res, userTypes_1.UserType.Administrator);
};
exports.signUpAdministrator = signUpAdministrator;
const getAdministrators = async (req, res) => {
    try {
        const administrators = await db_1.default.administrators.findMany();
        const responseData = administrators.map(administrator => ({
            id: (0, uuid_1.stringify)(administrator.id),
            email: administrator.email,
            first_name: administrator.first_name,
            last_name: administrator.last_name,
            role: userTypes_1.UserType.Administrator
        }));
        return res.status(200).json((0, responseInterfaces_1.createSuccessResponse)(responseData, 'Administrators retrieved successfully.'));
    }
    catch (err) {
        console.error('Error retrieving administrators', err);
        return res.status(500).json((0, responseInterfaces_1.createErrorResponse)('An unexpected error occurred while retrieving administrators. Please try again later.'));
    }
};
exports.getAdministrators = getAdministrators;
