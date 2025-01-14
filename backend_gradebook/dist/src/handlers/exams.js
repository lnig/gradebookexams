"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllExams = exports.deleteExam = exports.updateExam = exports.getThreeUpcomingExams = exports.getExams = exports.createExam = void 0;
const db_1 = __importDefault(require("../db"));
const responseInterfaces_1 = require("../interfaces/responseInterfaces");
const uuid_1 = require("uuid");
const node_buffer_1 = require("node:buffer");
function isStudent(user) {
    return user.class_id !== undefined;
}
const createExam = async (req, res) => {
    try {
        const topic = req.body.topic;
        const scope = req.body.scope;
        const lessonId = req.body.lessonId;
        const existingLesson = await db_1.default.lessons.findUnique({
            where: {
                id: node_buffer_1.Buffer.from((0, uuid_1.parse)(lessonId))
            }
        });
        if (!existingLesson) {
            return res.status(404).json((0, responseInterfaces_1.createErrorResponse)(`Lesson does not exist.`));
        }
        const createdExam = await db_1.default.gradebook_exams.create({
            data: {
                topic: topic,
                scope: scope,
                lesson_id: node_buffer_1.Buffer.from((0, uuid_1.parse)(lessonId))
            }
        });
        const responseData = {
            ...createdExam,
            id: (0, uuid_1.stringify)(createdExam.id),
            lesson_id: (0, uuid_1.stringify)(createdExam.lesson_id),
        };
        return res.status(200).json((0, responseInterfaces_1.createSuccessResponse)(responseData, `Exam created successfully.`));
    }
    catch (err) {
        console.error('Error creating exam', err);
        res.status(500).json((0, responseInterfaces_1.createErrorResponse)('An unexpected error occurred while creating exam. Please try again later.'));
    }
};
exports.createExam = createExam;
const getExams = async (req, res) => {
    try {
        const userId = req.params.userId;
        let existingUser = await db_1.default.teachers.findUnique({
            where: {
                id: node_buffer_1.Buffer.from((0, uuid_1.parse)(userId))
            }
        });
        if (!existingUser) {
            existingUser = await db_1.default.students.findUnique({
                where: {
                    id: node_buffer_1.Buffer.from((0, uuid_1.parse)(userId))
                }
            });
        }
        if (!existingUser) {
            return res.status(404).json((0, responseInterfaces_1.createErrorResponse)(`User does not exist.`));
        }
        let lessons;
        if (isStudent(existingUser) && existingUser.class_id) {
            lessons = await db_1.default.lessons.findMany({
                where: {
                    class_id: existingUser.class_id
                }
            });
        }
        else {
            lessons = await db_1.default.lessons.findMany({
                where: {
                    teacher_id: existingUser.id,
                }
            });
        }
        const exams = await db_1.default.gradebook_exams.findMany({
            where: {
                lesson_id: {
                    in: lessons.map(lesson => lesson.id)
                }
            },
            include: {
                lessons: true
            }
        });
        const responseData = exams.map(exam => ({
            id: (0, uuid_1.stringify)(exam.id),
            topic: exam.topic,
            scope: exam.scope,
            lesson: {
                id: (0, uuid_1.stringify)(exam.lessons.id),
                description: exam.lessons.description,
                date: exam.lessons.date,
                start_time: exam.lessons.start_time,
                end_time: exam.lessons.end_time,
                teacher_id: (0, uuid_1.stringify)(exam.lessons.teacher_id),
                class_id: (0, uuid_1.stringify)(exam.lessons.class_id),
                subject_id: (0, uuid_1.stringify)(exam.lessons.subject_id),
            }
        }));
        return res.status(200).json((0, responseInterfaces_1.createSuccessResponse)(responseData, 'Exams retrieved successfully.'));
    }
    catch (err) {
        console.error('Error retrieving exams', err);
        return res.status(500).json((0, responseInterfaces_1.createErrorResponse)('An unexpected error occurred while retrieving exams. Please try again later.'));
    }
};
exports.getExams = getExams;
const getThreeUpcomingExams = async (req, res) => {
    try {
        const userId = req.params.userId;
        let existingUser = await db_1.default.teachers.findUnique({
            where: {
                id: node_buffer_1.Buffer.from((0, uuid_1.parse)(userId))
            }
        });
        if (!existingUser) {
            existingUser = await db_1.default.students.findUnique({
                where: {
                    id: node_buffer_1.Buffer.from((0, uuid_1.parse)(userId))
                }
            });
        }
        if (!existingUser) {
            return res.status(404).json((0, responseInterfaces_1.createErrorResponse)(`User does not exist.`));
        }
        let lessons;
        if (isStudent(existingUser) && existingUser.class_id) {
            lessons = await db_1.default.lessons.findMany({
                where: {
                    class_id: existingUser.class_id
                }
            });
        }
        else {
            lessons = await db_1.default.lessons.findMany({
                where: {
                    teacher_id: existingUser.id,
                }
            });
        }
        const now = new Date();
        const exams = await db_1.default.gradebook_exams.findMany({
            where: {
                lesson_id: {
                    in: lessons.map(lesson => lesson.id)
                },
                OR: [
                    {
                        lessons: {
                            date: {
                                gt: now
                            }
                        }
                    },
                    {
                        lessons: {
                            date: {
                                equals: now
                            },
                            start_time: {
                                gt: now
                            }
                        }
                    }
                ]
            },
            include: {
                lessons: true
            },
            orderBy: [
                { lessons: { date: 'asc' } },
                { lessons: { start_time: 'asc' } }
            ],
            take: 3
        });
        const responseData = exams.map(exam => ({
            id: (0, uuid_1.stringify)(exam.id),
            topic: exam.topic,
            scope: exam.scope,
            lesson: {
                id: (0, uuid_1.stringify)(exam.lessons.id),
                description: exam.lessons.description,
                date: exam.lessons.date,
                start_time: exam.lessons.start_time,
                end_time: exam.lessons.end_time,
                teacher_id: (0, uuid_1.stringify)(exam.lessons.teacher_id),
                class_id: (0, uuid_1.stringify)(exam.lessons.class_id),
                subject_id: (0, uuid_1.stringify)(exam.lessons.subject_id),
            }
        }));
        return res.status(200).json((0, responseInterfaces_1.createSuccessResponse)(responseData, 'Exams retrieved successfully.'));
    }
    catch (err) {
        console.error('Error retrieving exams', err);
        return res.status(500).json((0, responseInterfaces_1.createErrorResponse)('An unexpected error occurred while retrieving exams. Please try again later.'));
    }
};
exports.getThreeUpcomingExams = getThreeUpcomingExams;
const updateExam = async (req, res) => {
    try {
        const examId = req.params.examId;
        const topic = req.body.topic;
        const scope = req.body.scope;
        const existingExam = await db_1.default.gradebook_exams.findUnique({
            where: {
                id: node_buffer_1.Buffer.from((0, uuid_1.parse)(examId))
            }
        });
        if (!existingExam) {
            return res.status(404).json((0, responseInterfaces_1.createErrorResponse)(`Exam does not exist.`));
        }
        const data = {};
        if (topic)
            data.topic = topic;
        if (scope)
            data.scope = scope;
        const updatedExam = await db_1.default.gradebook_exams.update({
            where: {
                id: node_buffer_1.Buffer.from((0, uuid_1.parse)(examId))
            },
            data: data
        });
        const responseData = {
            ...updatedExam,
            id: (0, uuid_1.stringify)(updatedExam.id),
            lesson_id: (0, uuid_1.stringify)(updatedExam.lesson_id)
        };
        return res.status(200).json((0, responseInterfaces_1.createSuccessResponse)(responseData, `Exam updated successfully.`));
    }
    catch (err) {
        console.error('Error updating exam', err);
        res.status(500).json((0, responseInterfaces_1.createErrorResponse)('An unexpected error occurred while updating exam. Please try again later.'));
    }
};
exports.updateExam = updateExam;
const deleteExam = async (req, res) => {
    try {
        const examId = req.params.examId;
        const existingExam = await db_1.default.gradebook_exams.findUnique({
            where: {
                id: node_buffer_1.Buffer.from((0, uuid_1.parse)(examId))
            }
        });
        if (!existingExam) {
            return res.status(404).json((0, responseInterfaces_1.createErrorResponse)(`Exam does not exist.`));
        }
        const deletedExam = await db_1.default.gradebook_exams.delete({
            where: {
                id: node_buffer_1.Buffer.from((0, uuid_1.parse)(examId))
            }
        });
        const responseData = {
            ...deletedExam,
            id: (0, uuid_1.stringify)(deletedExam.id),
            lesson_id: (0, uuid_1.stringify)(deletedExam.lesson_id)
        };
        return res.status(200).json((0, responseInterfaces_1.createSuccessResponse)(responseData, `Exam deleted successfully.`));
    }
    catch (err) {
        console.error('Error deleting exam', err);
        res.status(500).json((0, responseInterfaces_1.createErrorResponse)('An unexpected error occurred while deleting exam. Please try again later.'));
    }
};
exports.deleteExam = deleteExam;
const getAllExams = async (req, res) => {
    try {
        const exams = await db_1.default.gradebook_exams.findMany({
            include: {
                lessons: true,
            },
        });
        const responseData = exams.map(exam => ({
            id: (0, uuid_1.stringify)(exam.id),
            topic: exam.topic,
            scope: exam.scope,
            lesson: {
                id: (0, uuid_1.stringify)(exam.lessons.id),
                description: exam.lessons.description,
                date: exam.lessons.date,
                start_time: exam.lessons.start_time,
                end_time: exam.lessons.end_time,
                teacher_id: (0, uuid_1.stringify)(exam.lessons.teacher_id),
                class_id: (0, uuid_1.stringify)(exam.lessons.class_id),
                subject_id: (0, uuid_1.stringify)(exam.lessons.subject_id),
            },
        }));
        return res.status(200).json((0, responseInterfaces_1.createSuccessResponse)(responseData, 'All exams retrieved successfully.'));
    }
    catch (err) {
        console.error('Error retrieving all exams', err);
        return res.status(500).json((0, responseInterfaces_1.createErrorResponse)('An unexpected error occurred while retrieving all exams. Please try again later.'));
    }
};
exports.getAllExams = getAllExams;
