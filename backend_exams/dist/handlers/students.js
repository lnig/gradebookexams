"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllStudents = exports.signUpStudent = void 0;
const users_js_1 = require("./users.js");
const db_1 = __importDefault(require("../db"));
const responseInterfaces_1 = require("../interfaces/responseInterfaces");
const uuidUtils_js_1 = require("../utils/uuidUtils.js");
const userTypes_js_1 = require("../enums/userTypes.js");
const signUpStudent = (req, res) => {
    return (0, users_js_1.signUp)(req, res, userTypes_js_1.UserType.Student);
};
exports.signUpStudent = signUpStudent;
const getAllStudents = async (req, res) => {
    try {
        const students = await db_1.default.students.findMany({
            select: {
                id: true,
                pesel: true,
                email: true,
                phone_number: true,
                first_name: true,
                last_name: true,
                reset_password_token: true,
                reset_password_expires: true,
                class_id: true,
            },
        });
        const convertedStudents = (0, uuidUtils_js_1.convertBuffersToUUIDs)(students);
        return res.status(200).json((0, responseInterfaces_1.createSuccessResponse)(convertedStudents, 'Students retrieved successfully.'));
    }
    catch (error) {
        console.error('Error fetching students:', error);
        return res.status(500).json((0, responseInterfaces_1.createErrorResponse)('An unexpected error occurred while fetching the students. Please try again later.'));
    }
};
exports.getAllStudents = getAllStudents;
