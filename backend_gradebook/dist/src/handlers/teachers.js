"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTeachers = exports.signUpTeacher = void 0;
const users_1 = require("./users");
const userTypes_1 = require("../enums/userTypes");
const db_1 = __importDefault(require("../db"));
const responseInterfaces_1 = require("../interfaces/responseInterfaces");
const uuid_1 = require("uuid");
const signUpTeacher = (req, res) => {
    return (0, users_1.signUp)(req, res, userTypes_1.UserType.Teacher);
};
exports.signUpTeacher = signUpTeacher;
const getTeachers = async (req, res) => {
    try {
        const teachers = await db_1.default.teachers.findMany();
        const responseData = teachers.map(teacher => ({
            id: (0, uuid_1.stringify)(teacher.id),
            email: teacher.email,
            first_name: teacher.first_name,
            last_name: teacher.last_name,
            role: userTypes_1.UserType.Teacher
        }));
        return res.status(200).json((0, responseInterfaces_1.createSuccessResponse)(responseData, 'Teachers retrieved successfully.'));
    }
    catch (err) {
        console.error('Error retrieving teachers', err);
        return res.status(500).json((0, responseInterfaces_1.createErrorResponse)('An unexpected error occurred while retrieving teachers. Please try again later.'));
    }
};
exports.getTeachers = getTeachers;
