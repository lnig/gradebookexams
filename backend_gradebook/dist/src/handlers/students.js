"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStudentById = exports.getStudents = exports.signUpStudent = void 0;
const users_1 = require("./users");
const userTypes_1 = require("../enums/userTypes");
const db_1 = __importDefault(require("../db"));
const responseInterfaces_1 = require("../interfaces/responseInterfaces");
const uuid_1 = require("uuid");
const signUpStudent = (req, res) => {
    return (0, users_1.signUp)(req, res, userTypes_1.UserType.Student);
};
exports.signUpStudent = signUpStudent;
const getStudents = async (req, res) => {
    try {
        const students = await db_1.default.students.findMany({
            include: {
                classes: {
                    include: {
                        class_names: true,
                    }
                }
            }
        });
        const responseData = students.map(student => ({
            id: (0, uuid_1.stringify)(student.id),
            email: student.email,
            first_name: student.first_name,
            last_name: student.last_name,
            pesel: student.pesel,
            phone_number: student.phone_number,
            class_name: student.classes?.class_names.name || 'N/A',
            role: userTypes_1.UserType.Student
        }));
        return res.status(200).json((0, responseInterfaces_1.createSuccessResponse)(responseData, 'Students retrieved successfully.'));
    }
    catch (err) {
        console.error('Error retrieving students', err);
        return res.status(500).json((0, responseInterfaces_1.createErrorResponse)('An unexpected error occurred while retrieving students. Please try again later.'));
    }
};
exports.getStudents = getStudents;
const getStudentById = async (req, res) => {
    const studentId = req.params.studentId;
    try {
        const studentData = await db_1.default.students.findUnique({
            where: {
                id: Buffer.from((0, uuid_1.parse)(studentId)),
            },
            include: {
                classes: {
                    include: {
                        class_names: true,
                    },
                },
                students_parents: {
                    include: {
                        parents: true,
                    },
                },
            },
        });
        if (!studentData) {
            return res.status(404).json((0, responseInterfaces_1.createErrorResponse)('Student not found.'));
        }
        const parents = studentData.students_parents.map((sp) => ({
            id: (0, uuid_1.stringify)(sp.parents.id),
            first_name: sp.parents.first_name,
            last_name: sp.parents.last_name,
            email: sp.parents.email,
            phone_number: sp.parents.phone_number,
            pesel: sp.parents.pesel,
        }));
        const responseData = {
            id: (0, uuid_1.stringify)(studentData.id),
            first_name: studentData.first_name,
            last_name: studentData.last_name,
            phone_number: studentData.phone_number,
            email: studentData.email,
            pesel: studentData.pesel,
            class_name: studentData.classes?.class_names?.name || 'N/A',
            parents: parents,
        };
        return res.status(200).json((0, responseInterfaces_1.createSuccessResponse)(responseData, 'Student retrieved successfully.'));
    }
    catch (err) {
        console.error('Error retrieving student', err);
        return res.status(500).json((0, responseInterfaces_1.createErrorResponse)('An unexpected error occurred while retrieving the student. Please try again later.'));
    }
};
exports.getStudentById = getStudentById;
