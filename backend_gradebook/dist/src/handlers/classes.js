"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteClass = exports.unassignStudent = exports.assignStudent = exports.updateClass = exports.getStudentClassId = exports.getStudents = exports.getClassById = exports.getClasses = exports.createClass = void 0;
const db_1 = __importDefault(require("../db"));
const responseInterfaces_1 = require("../interfaces/responseInterfaces");
const uuid_1 = require("uuid");
const node_buffer_1 = require("node:buffer");
const createClass = async (req, res) => {
    try {
        const classNameId = req.body.classNameId;
        const schoolYearId = req.body.schoolYearId;
        const existingClassName = await db_1.default.class_names.findUnique({
            where: {
                id: node_buffer_1.Buffer.from((0, uuid_1.parse)(classNameId))
            }
        });
        if (!existingClassName) {
            return res.status(404).json((0, responseInterfaces_1.createErrorResponse)(`Class name does not exist.`));
        }
        const existingSchoolYear = await db_1.default.school_years.findUnique({
            where: {
                id: node_buffer_1.Buffer.from((0, uuid_1.parse)(schoolYearId))
            }
        });
        if (!existingSchoolYear) {
            return res.status(404).json((0, responseInterfaces_1.createErrorResponse)(`School year does not exist.`));
        }
        const existingClass = await db_1.default.classes.findUnique({
            where: {
                class_name_id_school_year_id: {
                    class_name_id: node_buffer_1.Buffer.from((0, uuid_1.parse)(classNameId)),
                    school_year_id: node_buffer_1.Buffer.from((0, uuid_1.parse)(schoolYearId))
                }
            }
        });
        if (existingClass) {
            return res.status(409).json((0, responseInterfaces_1.createErrorResponse)(`Class already exists.`));
        }
        const createdClass = await db_1.default.classes.create({
            data: {
                class_name_id: node_buffer_1.Buffer.from((0, uuid_1.parse)(classNameId)),
                school_year_id: node_buffer_1.Buffer.from((0, uuid_1.parse)(schoolYearId))
            }
        });
        const responseData = {
            ...createdClass,
            id: (0, uuid_1.stringify)(createdClass.id),
            class_name_id: (0, uuid_1.stringify)(createdClass.class_name_id),
            school_year_id: (0, uuid_1.stringify)(createdClass.school_year_id),
        };
        return res.status(200).json((0, responseInterfaces_1.createSuccessResponse)(responseData, `Class created successfully.`));
    }
    catch (err) {
        console.error('Error creating class', err);
        res.status(500).json((0, responseInterfaces_1.createErrorResponse)('An unexpected error occurred while creating class. Please try again later.'));
    }
};
exports.createClass = createClass;
const getClasses = async (req, res) => {
    try {
        const classesData = await db_1.default.classes.findMany({
            include: {
                class_names: true,
                school_years: true,
                teachers: true,
                _count: {
                    select: { students: true },
                },
            },
        });
        const responseData = classesData.map(cls => ({
            ...cls,
            id: (0, uuid_1.stringify)(cls.id),
            class_name_id: (0, uuid_1.stringify)(cls.class_name_id),
            school_year_id: (0, uuid_1.stringify)(cls.school_year_id),
            teacher_id: cls.teacher_id ? (0, uuid_1.stringify)(cls.teacher_id) : null,
            class_names: {
                ...cls.class_names,
                id: (0, uuid_1.stringify)(cls.class_names.id),
            },
            school_years: {
                ...cls.school_years,
                id: (0, uuid_1.stringify)(cls.school_years.id),
            },
            teachers: cls.teachers ? {
                ...cls.teachers,
                id: (0, uuid_1.stringify)(cls.teachers.id),
            } : null,
            studentCount: cls._count.students,
        }));
        return res.status(200).json((0, responseInterfaces_1.createSuccessResponse)(responseData, 'Classes retrieved successfully.'));
    }
    catch (err) {
        console.error('Error retrieving classes', err);
        return res.status(500).json((0, responseInterfaces_1.createErrorResponse)('An unexpected error occurred while retrieving classes. Please try again later.'));
    }
};
exports.getClasses = getClasses;
const getClassById = async (req, res) => {
    try {
        const classId = req.params.classId;
        const existingClass = await db_1.default.classes.findUnique({
            where: {
                id: node_buffer_1.Buffer.from((0, uuid_1.parse)(classId))
            },
            include: {
                class_names: true,
                school_years: true,
                teachers: true,
                students: true,
                _count: {
                    select: { students: true },
                }
            },
        });
        if (!existingClass) {
            return res.status(404).json((0, responseInterfaces_1.createErrorResponse)('Class does not exist.'));
        }
        const responseData = {
            ...existingClass,
            id: (0, uuid_1.stringify)(existingClass.id),
            class_name_id: (0, uuid_1.stringify)(existingClass.class_name_id),
            school_year_id: (0, uuid_1.stringify)(existingClass.school_year_id),
            teacher_id: existingClass.teacher_id ? (0, uuid_1.stringify)(existingClass.teacher_id) : null,
            class_names: {
                ...existingClass.class_names,
                id: (0, uuid_1.stringify)(existingClass.class_names.id),
            },
            school_years: {
                ...existingClass.school_years,
                id: (0, uuid_1.stringify)(existingClass.school_years.id),
            },
            teachers: existingClass.teachers ? {
                ...existingClass.teachers,
                id: (0, uuid_1.stringify)(existingClass.teachers.id),
                reset_password_token: null,
                reset_password_expires: null
            } : null,
            students: existingClass.students.map(student => ({
                ...student,
                id: (0, uuid_1.stringify)(student.id),
                reset_password_token: null,
                reset_password_expires: null,
                class_id: student.class_id ? (0, uuid_1.stringify)(student.class_id) : null
            })),
            studentCount: existingClass._count.students
        };
        return res.status(200).json((0, responseInterfaces_1.createSuccessResponse)(responseData, 'Class retrieved successfully.'));
    }
    catch (err) {
        console.error('Error retrieving class by ID', err);
        return res.status(500).json((0, responseInterfaces_1.createErrorResponse)('An unexpected error occurred while retrieving the class. Please try again later.'));
    }
};
exports.getClassById = getClassById;
const getStudents = async (req, res) => {
    try {
        const classId = req.params.classId;
        const existingClass = await db_1.default.classes.findUnique({
            where: {
                id: node_buffer_1.Buffer.from((0, uuid_1.parse)(classId))
            }
        });
        if (!existingClass) {
            return res.status(404).json((0, responseInterfaces_1.createErrorResponse)(`Class does not exist.`));
        }
        const students = await db_1.default.students.findMany({
            where: {
                class_id: node_buffer_1.Buffer.from((0, uuid_1.parse)(classId))
            }
        });
        const responseData = students.map(student => ({
            ...student,
            id: (0, uuid_1.stringify)(student.id),
            reset_password_token: null,
            reset_password_expires: null,
            class_id: student.class_id ? (0, uuid_1.stringify)(student.class_id) : null
        }));
        return res.status(200).json((0, responseInterfaces_1.createSuccessResponse)(responseData, `Students retrieved successfully.`));
    }
    catch (err) {
        console.error('Error retrieving students', err);
        res.status(500).json((0, responseInterfaces_1.createErrorResponse)('An unexpected error occurred while retrieving students. Please try again later.'));
    }
};
exports.getStudents = getStudents;
const getStudentClassId = async (req, res) => {
    try {
        const studentId = req.params.studentId;
        const existingStudent = await db_1.default.students.findUnique({
            where: {
                id: node_buffer_1.Buffer.from((0, uuid_1.parse)(studentId))
            }
        });
        if (!existingStudent) {
            return res.status(404).json((0, responseInterfaces_1.createErrorResponse)('Student does not exist.'));
        }
        if (!existingStudent.class_id) {
            return res.status(404).json((0, responseInterfaces_1.createErrorResponse)('Student is not assigned to any class.'));
        }
        return res.status(200).json((0, responseInterfaces_1.createSuccessResponse)((0, uuid_1.stringify)(existingStudent.class_id), 'Class ID successfully retrieved.'));
    }
    catch (err) {
        console.error('Error occured while retrieving student\'s class ID', err);
        return res.status(500).json((0, responseInterfaces_1.createErrorResponse)('An unexpected error occurred while retrieving student\'s class ID. Please try again later.'));
    }
};
exports.getStudentClassId = getStudentClassId;
const updateClass = async (req, res) => {
    try {
        const classId = req.params.classId;
        const classNameId = req.body.classNameId;
        const schoolYearId = req.body.schoolYearId;
        const teacherId = req.body.teacherId;
        const existingClass = await db_1.default.classes.findUnique({
            where: {
                id: node_buffer_1.Buffer.from((0, uuid_1.parse)(classId))
            }
        });
        if (!existingClass) {
            return res.status(404).json((0, responseInterfaces_1.createErrorResponse)(`Class does not exist.`));
        }
        const data = {};
        if (classNameId) {
            const existingClassName = await db_1.default.class_names.findUnique({
                where: {
                    id: node_buffer_1.Buffer.from((0, uuid_1.parse)(classNameId))
                }
            });
            if (!existingClassName) {
                return res.status(404).json((0, responseInterfaces_1.createErrorResponse)(`Class name does not exist.`));
            }
            data.class_name_id = node_buffer_1.Buffer.from((0, uuid_1.parse)(classNameId));
        }
        if (schoolYearId) {
            const existingSchoolYear = await db_1.default.school_years.findUnique({
                where: {
                    id: node_buffer_1.Buffer.from((0, uuid_1.parse)(schoolYearId))
                }
            });
            if (!existingSchoolYear) {
                return res.status(404).json((0, responseInterfaces_1.createErrorResponse)(`School year does not exist.`));
            }
            data.school_year_id = node_buffer_1.Buffer.from((0, uuid_1.parse)(schoolYearId));
        }
        if (teacherId) {
            const existingTeacher = await db_1.default.teachers.findUnique({
                where: {
                    id: node_buffer_1.Buffer.from((0, uuid_1.parse)(teacherId))
                }
            });
            if (!existingTeacher) {
                return res.status(404).json((0, responseInterfaces_1.createErrorResponse)(`Teacher does not exist.`));
            }
            data.teacher_id = node_buffer_1.Buffer.from((0, uuid_1.parse)(teacherId));
        }
        const updatedClass = await db_1.default.classes.update({
            where: {
                id: node_buffer_1.Buffer.from((0, uuid_1.parse)(classId))
            },
            data: data
        });
        const responseData = {
            ...updatedClass,
            id: (0, uuid_1.stringify)(updatedClass.id),
            class_name_id: (0, uuid_1.stringify)(updatedClass.class_name_id),
            school_year_id: (0, uuid_1.stringify)(updatedClass.school_year_id),
            teacher_id: updatedClass.teacher_id ? (0, uuid_1.stringify)(updatedClass.teacher_id) : null
        };
        return res.status(200).json((0, responseInterfaces_1.createSuccessResponse)(responseData, `Class updated successfully.`));
    }
    catch (err) {
        console.error('Error updating class', err);
        res.status(500).json((0, responseInterfaces_1.createErrorResponse)('An unexpected error occurred while updating class. Please try again later.'));
    }
};
exports.updateClass = updateClass;
const assignStudent = async (req, res) => {
    try {
        const classId = req.params.classId;
        const studentId = req.body.studentId;
        const existingClass = await db_1.default.classes.findUnique({
            where: {
                id: node_buffer_1.Buffer.from((0, uuid_1.parse)(classId))
            }
        });
        if (!existingClass) {
            return res.status(404).json((0, responseInterfaces_1.createErrorResponse)(`Class does not exist.`));
        }
        const existingStudent = await db_1.default.students.findUnique({
            where: {
                id: node_buffer_1.Buffer.from((0, uuid_1.parse)(studentId))
            }
        });
        if (!existingStudent) {
            return res.status(404).json((0, responseInterfaces_1.createErrorResponse)(`Student does not exist.`));
        }
        const updatedStudent = await db_1.default.students.update({
            where: {
                id: node_buffer_1.Buffer.from((0, uuid_1.parse)(studentId))
            },
            data: {
                class_id: node_buffer_1.Buffer.from((0, uuid_1.parse)(classId))
            }
        });
        const responseData = {
            ...updatedStudent,
            id: (0, uuid_1.stringify)(updatedStudent.id),
            class_id: updatedStudent.class_id ? (0, uuid_1.stringify)(updatedStudent.class_id) : null
        };
        return res.status(200).json((0, responseInterfaces_1.createSuccessResponse)(responseData, `Student assigned to class successfully.`));
    }
    catch (err) {
        console.error('Error assigning student to class', err);
        return res.status(500).json((0, responseInterfaces_1.createErrorResponse)('An unexpected error occurred while assigning student to class. Please try again later.'));
    }
};
exports.assignStudent = assignStudent;
const unassignStudent = async (req, res) => {
    try {
        const classId = req.params.classId;
        const studentId = req.body.studentId;
        const existingClass = await db_1.default.classes.findUnique({
            where: { id: node_buffer_1.Buffer.from((0, uuid_1.parse)(classId)) }
        });
        if (!existingClass) {
            return res.status(404).json((0, responseInterfaces_1.createErrorResponse)(`Class does not exist.`));
        }
        const existingStudent = await db_1.default.students.findUnique({
            where: { id: node_buffer_1.Buffer.from((0, uuid_1.parse)(studentId)) }
        });
        if (!existingStudent) {
            return res.status(404).json((0, responseInterfaces_1.createErrorResponse)(`Student does not exist.`));
        }
        const updatedStudent = await db_1.default.students.update({
            where: { id: node_buffer_1.Buffer.from((0, uuid_1.parse)(studentId)) },
            data: { class_id: null }
        });
        const responseData = {
            ...updatedStudent,
            id: (0, uuid_1.stringify)(updatedStudent.id),
            class_id: updatedStudent.class_id
        };
        return res.status(200).json((0, responseInterfaces_1.createSuccessResponse)(responseData, `Student unassigned from class successfully.`));
    }
    catch (err) {
        console.error('Error removing student from class', err);
        res.status(500).json((0, responseInterfaces_1.createErrorResponse)('An unexpected error occurred while removing the student from the class. Please try again later.'));
    }
};
exports.unassignStudent = unassignStudent;
const deleteClass = async (req, res) => {
    try {
        const classId = req.params.classId;
        const existingClass = await db_1.default.classes.findUnique({
            where: { id: node_buffer_1.Buffer.from((0, uuid_1.parse)(classId)) }
        });
        if (!existingClass) {
            return res.status(404).json((0, responseInterfaces_1.createErrorResponse)(`Class does not exist.`));
        }
        await db_1.default.students.updateMany({
            where: { class_id: node_buffer_1.Buffer.from((0, uuid_1.parse)(classId)) },
            data: { class_id: null }
        });
        const deletedClass = await db_1.default.classes.delete({
            where: { id: node_buffer_1.Buffer.from((0, uuid_1.parse)(classId)) }
        });
        const responseData = {
            ...deletedClass,
            id: (0, uuid_1.stringify)(deletedClass.id),
            teacher_id: deletedClass.teacher_id ? (0, uuid_1.stringify)(deletedClass.teacher_id) : null
        };
        return res.status(200).json((0, responseInterfaces_1.createSuccessResponse)(responseData, `Class deleted successfully.`));
    }
    catch (err) {
        console.error('Error deleting class', err);
        res.status(500).json((0, responseInterfaces_1.createErrorResponse)('An unexpected error occurred while deleting the class. Please try again later.'));
    }
};
exports.deleteClass = deleteClass;
