"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllGrades = exports.deleteFinalGrade = exports.deleteGrade = exports.updateFinalGrade = exports.updateGrade = exports.getFinalGrades = exports.getThreeLatestGrades = exports.getAllGradesForStudent = exports.getGrades = exports.createFinalGrade = exports.createGrade = void 0;
const db_1 = __importDefault(require("../db"));
const responseInterfaces_1 = require("../interfaces/responseInterfaces");
const uuid_1 = require("uuid");
const node_buffer_1 = require("node:buffer");
const createGrade = async (req, res) => {
    try {
        const description = req.body.description;
        const grade = req.body.grade;
        const weight = req.body.weight;
        const studentId = req.body.studentId;
        const subjectId = req.body.subjectId;
        const teacherId = req.body.teacherId;
        const existingStudent = await db_1.default.students.findUnique({
            where: {
                id: node_buffer_1.Buffer.from((0, uuid_1.parse)(studentId))
            }
        });
        if (!existingStudent) {
            return res.status(404).json((0, responseInterfaces_1.createErrorResponse)(`Student does not exist.`));
        }
        const existingSubject = await db_1.default.subjects.findUnique({
            where: {
                id: node_buffer_1.Buffer.from((0, uuid_1.parse)(subjectId))
            }
        });
        if (!existingSubject) {
            return res.status(404).json((0, responseInterfaces_1.createErrorResponse)(`Subject does not exist.`));
        }
        const existingTeacher = await db_1.default.teachers.findUnique({
            where: {
                id: node_buffer_1.Buffer.from((0, uuid_1.parse)(teacherId))
            }
        });
        if (!existingTeacher) {
            return res.status(404).json((0, responseInterfaces_1.createErrorResponse)(`Teacher does not exist.`));
        }
        const createdGrade = await db_1.default.grades_gradebook.create({
            data: {
                description: description,
                grade: grade,
                weight: weight,
                date_given: new Date(),
                student_id: node_buffer_1.Buffer.from((0, uuid_1.parse)(studentId)),
                subject_id: node_buffer_1.Buffer.from((0, uuid_1.parse)(subjectId)),
                teacher_id: node_buffer_1.Buffer.from((0, uuid_1.parse)(teacherId))
            }
        });
        const responseData = {
            ...createdGrade,
            id: (0, uuid_1.stringify)(createdGrade.id),
            date_given: createdGrade.date_given.toISOString(),
            student_id: (0, uuid_1.stringify)(createdGrade.student_id),
            subject_id: (0, uuid_1.stringify)(createdGrade.subject_id),
            teacher_id: (0, uuid_1.stringify)(createdGrade.teacher_id)
        };
        return res.status(200).json((0, responseInterfaces_1.createSuccessResponse)(responseData, `Grade created successfully.`));
    }
    catch (err) {
        console.error('Error creating grade', err);
        res.status(500).json((0, responseInterfaces_1.createErrorResponse)('An unexpected error occurred while creating grade. Please try again later.'));
    }
};
exports.createGrade = createGrade;
const createFinalGrade = async (req, res) => {
    try {
        const grade = req.body.grade;
        const studentId = req.body.studentId;
        const subjectId = req.body.subjectId;
        const teacherId = req.body.teacherId;
        const semesterId = req.body.semesterId;
        const existingStudent = await db_1.default.students.findUnique({
            where: {
                id: node_buffer_1.Buffer.from((0, uuid_1.parse)(studentId))
            }
        });
        if (!existingStudent) {
            return res.status(404).json((0, responseInterfaces_1.createErrorResponse)(`Student does not exist.`));
        }
        const existingSubject = await db_1.default.subjects.findUnique({
            where: {
                id: node_buffer_1.Buffer.from((0, uuid_1.parse)(subjectId))
            }
        });
        if (!existingSubject) {
            return res.status(404).json((0, responseInterfaces_1.createErrorResponse)(`Subject does not exist.`));
        }
        const existingTeacher = await db_1.default.teachers.findUnique({
            where: {
                id: node_buffer_1.Buffer.from((0, uuid_1.parse)(teacherId))
            }
        });
        if (!existingTeacher) {
            return res.status(404).json((0, responseInterfaces_1.createErrorResponse)(`Teacher does not exist.`));
        }
        const existingSemester = await db_1.default.semesters.findUnique({
            where: {
                id: node_buffer_1.Buffer.from((0, uuid_1.parse)(semesterId))
            }
        });
        if (!existingSemester) {
            return res.status(404).json((0, responseInterfaces_1.createErrorResponse)(`Semester does not exist.`));
        }
        const existingGrade = await db_1.default.final_grades.findFirst({
            where: {
                student_id: node_buffer_1.Buffer.from((0, uuid_1.parse)(studentId)),
                subject_id: node_buffer_1.Buffer.from((0, uuid_1.parse)(subjectId)),
                semester_id: node_buffer_1.Buffer.from((0, uuid_1.parse)(semesterId))
            }
        });
        if (existingGrade) {
            return res.status(404).json((0, responseInterfaces_1.createErrorResponse)(`Final grade already exists.`));
        }
        const createdGrade = await db_1.default.final_grades.create({
            data: {
                grade: grade,
                student_id: node_buffer_1.Buffer.from((0, uuid_1.parse)(studentId)),
                subject_id: node_buffer_1.Buffer.from((0, uuid_1.parse)(subjectId)),
                teacher_id: node_buffer_1.Buffer.from((0, uuid_1.parse)(teacherId)),
                semester_id: node_buffer_1.Buffer.from((0, uuid_1.parse)(semesterId))
            }
        });
        const responseData = {
            ...createdGrade,
            id: (0, uuid_1.stringify)(createdGrade.id),
            student_id: (0, uuid_1.stringify)(createdGrade.student_id),
            subject_id: (0, uuid_1.stringify)(createdGrade.subject_id),
            teacher_id: (0, uuid_1.stringify)(createdGrade.teacher_id),
            semester_id: (0, uuid_1.stringify)(createdGrade.semester_id)
        };
        return res.status(200).json((0, responseInterfaces_1.createSuccessResponse)(responseData, `Final grade created successfully.`));
    }
    catch (err) {
        console.error('Error creating final grade', err);
        res.status(500).json((0, responseInterfaces_1.createErrorResponse)('An unexpected error occurred while creating final grade. Please try again later.'));
    }
};
exports.createFinalGrade = createFinalGrade;
const getGrades = async (req, res) => {
    try {
        const studentId = req.params.studentId;
        const subjectId = req.params.subjectId;
        const existingStudent = await db_1.default.students.findUnique({
            where: {
                id: node_buffer_1.Buffer.from((0, uuid_1.parse)(studentId))
            }
        });
        if (!existingStudent) {
            return res.status(404).json((0, responseInterfaces_1.createErrorResponse)(`Student does not exist.`));
        }
        const existingSubject = await db_1.default.subjects.findUnique({
            where: {
                id: node_buffer_1.Buffer.from((0, uuid_1.parse)(subjectId))
            }
        });
        if (!existingSubject) {
            return res.status(404).json((0, responseInterfaces_1.createErrorResponse)(`Subject does not exist.`));
        }
        const grades = await db_1.default.grades_gradebook.findMany({
            where: {
                student_id: node_buffer_1.Buffer.from((0, uuid_1.parse)(studentId)),
                subject_id: node_buffer_1.Buffer.from((0, uuid_1.parse)(subjectId))
            }
        });
        const responseData = grades.map(grade => ({
            ...grade,
            id: (0, uuid_1.stringify)(grade.id),
            date_given: grade.date_given.toISOString(),
            student_id: (0, uuid_1.stringify)(grade.student_id),
            subject_id: (0, uuid_1.stringify)(grade.subject_id),
            teacher_id: (0, uuid_1.stringify)(grade.teacher_id)
        }));
        return res.status(200).json((0, responseInterfaces_1.createSuccessResponse)(responseData, 'Grades retrieved successfully.'));
    }
    catch (err) {
        console.error('Error retrieving grades', err);
        return res.status(500).json((0, responseInterfaces_1.createErrorResponse)('An unexpected error occurred while retrieving grades. Please try again later.'));
    }
};
exports.getGrades = getGrades;
const getAllGradesForStudent = async (req, res) => {
    try {
        const studentId = req.params.studentId;
        const existingStudent = await db_1.default.students.findUnique({
            where: {
                id: node_buffer_1.Buffer.from((0, uuid_1.parse)(studentId))
            }
        });
        if (!existingStudent) {
            return res.status(404).json((0, responseInterfaces_1.createErrorResponse)(`Student with ID ${studentId} does not exist.`));
        }
        const grades = await db_1.default.grades_gradebook.findMany({
            where: {
                student_id: node_buffer_1.Buffer.from((0, uuid_1.parse)(studentId)),
            },
            include: {
                subjects: {
                    select: {
                        name: true
                    }
                },
                teachers: {
                    select: {
                        first_name: true,
                        last_name: true
                    }
                }
            }
        });
        const responseData = grades.map(grade => ({
            id: (0, uuid_1.stringify)(grade.id),
            description: grade.description,
            grade: grade.grade,
            weight: grade.weight,
            date_given: grade.date_given.toISOString(),
            subject_id: (0, uuid_1.stringify)(grade.subject_id),
            teacher_id: (0, uuid_1.stringify)(grade.teacher_id),
            subject: grade.subjects.name,
            teacher_first_name: grade.teachers.first_name,
            teacher_last_name: grade.teachers.last_name
        }));
        return res.status(200).json((0, responseInterfaces_1.createSuccessResponse)(responseData, 'Grades retrieved successfully.'));
    }
    catch (err) {
        console.error('Error retrieving grades', err);
        return res.status(500).json((0, responseInterfaces_1.createErrorResponse)('An unexpected error occurred while retrieving grades. Please try again later.'));
    }
};
exports.getAllGradesForStudent = getAllGradesForStudent;
const getThreeLatestGrades = async (req, res) => {
    try {
        const studentId = req.params.studentId;
        const existingStudent = await db_1.default.students.findUnique({
            where: {
                id: node_buffer_1.Buffer.from((0, uuid_1.parse)(studentId))
            }
        });
        if (!existingStudent) {
            return res.status(404).json((0, responseInterfaces_1.createErrorResponse)(`Student does not exist.`));
        }
        const grades = await db_1.default.grades_gradebook.findMany({
            where: {
                student_id: node_buffer_1.Buffer.from((0, uuid_1.parse)(studentId))
            },
            orderBy: {
                date_given: 'desc'
            },
            take: 3
        });
        const responseData = grades.map(grade => ({
            ...grade,
            id: (0, uuid_1.stringify)(grade.id),
            date_given: grade.date_given.toISOString(),
            student_id: (0, uuid_1.stringify)(grade.student_id),
            subject_id: (0, uuid_1.stringify)(grade.subject_id),
            teacher_id: (0, uuid_1.stringify)(grade.teacher_id)
        }));
        return res.status(200).json((0, responseInterfaces_1.createSuccessResponse)(responseData, 'Three latest grades retrieved successfully.'));
    }
    catch (err) {
        console.error('Error retrieving three latest grades', err);
        return res.status(500).json((0, responseInterfaces_1.createErrorResponse)('An unexpected error occurred while retrieving three latest grades. Please try again later.'));
    }
};
exports.getThreeLatestGrades = getThreeLatestGrades;
const getFinalGrades = async (req, res) => {
    try {
        const studentId = req.params.studentId;
        const existingStudent = await db_1.default.students.findUnique({
            where: {
                id: node_buffer_1.Buffer.from((0, uuid_1.parse)(studentId))
            }
        });
        if (!existingStudent) {
            return res.status(404).json((0, responseInterfaces_1.createErrorResponse)(`Student does not exist.`));
        }
        const grades = await db_1.default.final_grades.findMany({
            where: {
                student_id: node_buffer_1.Buffer.from((0, uuid_1.parse)(studentId)),
            }
        });
        const responseData = grades.map(grade => ({
            ...grade,
            id: (0, uuid_1.stringify)(grade.id),
            student_id: (0, uuid_1.stringify)(grade.student_id),
            subject_id: (0, uuid_1.stringify)(grade.subject_id),
            teacher_id: (0, uuid_1.stringify)(grade.teacher_id),
            semester_id: (0, uuid_1.stringify)(grade.semester_id)
        }));
        return res.status(200).json((0, responseInterfaces_1.createSuccessResponse)(responseData, 'Final grades retrieved successfully.'));
    }
    catch (err) {
        console.error('Error retrieving final grades', err);
        return res.status(500).json((0, responseInterfaces_1.createErrorResponse)('An unexpected error occurred while retrieving final grades. Please try again later.'));
    }
};
exports.getFinalGrades = getFinalGrades;
const updateGrade = async (req, res) => {
    try {
        const gradeId = req.params.gradeId;
        const description = req.body.description;
        const grade = req.body.grade;
        const weight = req.body.weight;
        const existingGrade = await db_1.default.grades_gradebook.findUnique({
            where: {
                id: node_buffer_1.Buffer.from((0, uuid_1.parse)(gradeId))
            }
        });
        if (!existingGrade) {
            return res.status(404).json((0, responseInterfaces_1.createErrorResponse)(`Grade does not exist.`));
        }
        const data = {};
        if (description)
            data.description = description;
        if (grade)
            data.grade = grade;
        if (weight)
            data.weight = weight;
        const updatedGrade = await db_1.default.grades_gradebook.update({
            where: {
                id: node_buffer_1.Buffer.from((0, uuid_1.parse)(gradeId))
            },
            data: data
        });
        const responseData = {
            ...updatedGrade,
            id: (0, uuid_1.stringify)(updatedGrade.id),
            date_given: updatedGrade.date_given.toISOString(),
            student_id: (0, uuid_1.stringify)(updatedGrade.student_id),
            subject_id: (0, uuid_1.stringify)(updatedGrade.subject_id),
            teacher_id: (0, uuid_1.stringify)(updatedGrade.teacher_id)
        };
        return res.status(200).json((0, responseInterfaces_1.createSuccessResponse)(responseData, `Grade updated successfully.`));
    }
    catch (err) {
        console.error('Error updating grade', err);
        res.status(500).json((0, responseInterfaces_1.createErrorResponse)('An unexpected error occurred while updating grade. Please try again later.'));
    }
};
exports.updateGrade = updateGrade;
const updateFinalGrade = async (req, res) => {
    try {
        const gradeId = req.params.gradeId;
        const grade = req.body.grade;
        const existingGrade = await db_1.default.final_grades.findUnique({
            where: {
                id: node_buffer_1.Buffer.from((0, uuid_1.parse)(gradeId))
            }
        });
        if (!existingGrade) {
            return res.status(404).json((0, responseInterfaces_1.createErrorResponse)(`Final grade does not exist.`));
        }
        const updatedGrade = await db_1.default.final_grades.update({
            where: {
                id: node_buffer_1.Buffer.from((0, uuid_1.parse)(gradeId))
            },
            data: {
                grade: grade
            }
        });
        const responseData = {
            ...updatedGrade,
            id: (0, uuid_1.stringify)(updatedGrade.id),
            student_id: (0, uuid_1.stringify)(updatedGrade.student_id),
            subject_id: (0, uuid_1.stringify)(updatedGrade.subject_id),
            teacher_id: (0, uuid_1.stringify)(updatedGrade.teacher_id),
            semester_id: (0, uuid_1.stringify)(updatedGrade.semester_id)
        };
        return res.status(200).json((0, responseInterfaces_1.createSuccessResponse)(responseData, `Final grade updated successfully.`));
    }
    catch (err) {
        console.error('Error updating final grade', err);
        res.status(500).json((0, responseInterfaces_1.createErrorResponse)('An unexpected error occurred while updating final grade. Please try again later.'));
    }
};
exports.updateFinalGrade = updateFinalGrade;
const deleteGrade = async (req, res) => {
    try {
        const gradeId = req.params.gradeId;
        const existingGrade = await db_1.default.grades_gradebook.findUnique({
            where: {
                id: node_buffer_1.Buffer.from((0, uuid_1.parse)(gradeId))
            }
        });
        if (!existingGrade) {
            return res.status(404).json((0, responseInterfaces_1.createErrorResponse)(`Grade does not exist.`));
        }
        const deletedGrade = await db_1.default.grades_gradebook.delete({
            where: {
                id: node_buffer_1.Buffer.from((0, uuid_1.parse)(gradeId))
            }
        });
        const responseData = {
            ...deletedGrade,
            id: (0, uuid_1.stringify)(deletedGrade.id),
            date_given: deletedGrade.date_given.toISOString(),
            student_id: (0, uuid_1.stringify)(deletedGrade.student_id),
            subject_id: (0, uuid_1.stringify)(deletedGrade.subject_id),
            teacher_id: (0, uuid_1.stringify)(deletedGrade.teacher_id)
        };
        return res.status(200).json((0, responseInterfaces_1.createSuccessResponse)(responseData, `Grade deleted successfully.`));
    }
    catch (err) {
        console.error('Error deleting grade', err);
        res.status(500).json((0, responseInterfaces_1.createErrorResponse)('An unexpected error occurred while deleting grade. Please try again later.'));
    }
};
exports.deleteGrade = deleteGrade;
const deleteFinalGrade = async (req, res) => {
    try {
        const gradeId = req.params.gradeId;
        const existingGrade = await db_1.default.final_grades.findUnique({
            where: {
                id: node_buffer_1.Buffer.from((0, uuid_1.parse)(gradeId))
            }
        });
        if (!existingGrade) {
            return res.status(404).json((0, responseInterfaces_1.createErrorResponse)(`Final grade does not exist.`));
        }
        const deletedGrade = await db_1.default.final_grades.delete({
            where: {
                id: node_buffer_1.Buffer.from((0, uuid_1.parse)(gradeId))
            }
        });
        const responseData = {
            ...deletedGrade,
            id: (0, uuid_1.stringify)(deletedGrade.id),
            student_id: (0, uuid_1.stringify)(deletedGrade.student_id),
            subject_id: (0, uuid_1.stringify)(deletedGrade.subject_id),
            teacher_id: (0, uuid_1.stringify)(deletedGrade.teacher_id),
            semester_id: (0, uuid_1.stringify)(deletedGrade.semester_id),
        };
        return res.status(200).json((0, responseInterfaces_1.createSuccessResponse)(responseData, `Final grade deleted successfully.`));
    }
    catch (err) {
        console.error('Error deleting final grade', err);
        res.status(500).json((0, responseInterfaces_1.createErrorResponse)('An unexpected error occurred while deleting final grade. Please try again later.'));
    }
};
exports.deleteFinalGrade = deleteFinalGrade;
const getAllGrades = async (req, res) => {
    try {
        const grades = await db_1.default.grades_gradebook.findMany({
            include: {
                subjects: {
                    select: {
                        name: true
                    }
                },
                teachers: {
                    select: {
                        first_name: true,
                        last_name: true
                    }
                }
            }
        });
        const responseData = grades.map(grade => ({
            id: (0, uuid_1.stringify)(grade.id),
            description: grade.description,
            grade: grade.grade,
            date_given: grade.date_given.toISOString(),
            student_id: (0, uuid_1.stringify)(grade.student_id),
            subject_id: (0, uuid_1.stringify)(grade.subject_id),
            teacher_id: (0, uuid_1.stringify)(grade.teacher_id),
            subject: grade.subjects.name,
            teacher_first_name: grade.teachers.first_name,
            teacher_last_name: grade.teachers.last_name
        }));
        return res.status(200).json((0, responseInterfaces_1.createSuccessResponse)(responseData, 'Grades retrieved successfully.'));
    }
    catch (err) {
        console.error('Error retrieving grades', err);
        return res.status(500).json((0, responseInterfaces_1.createErrorResponse)('An unexpected error occurred while retrieving grades. Please try again later.'));
    }
};
exports.getAllGrades = getAllGrades;
