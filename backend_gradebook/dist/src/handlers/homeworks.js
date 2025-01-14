"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHomeworksForTeacher = exports.getAllHomeworks = exports.getHomeworksForStudent = exports.deleteHomework = exports.updateHomework = exports.getLatestHomework = exports.getHomeworkById = exports.getHomework = exports.createHomework = void 0;
const db_1 = __importDefault(require("../db"));
const responseInterfaces_1 = require("../interfaces/responseInterfaces");
const uuid_1 = require("uuid");
const node_buffer_1 = require("node:buffer");
const createHomework = async (req, res) => {
    try {
        const description = req.body.description;
        const deadline = req.body.deadline;
        const lessonId = req.body.lessonId;
        const existingLesson = await db_1.default.lessons.findUnique({
            where: {
                id: node_buffer_1.Buffer.from((0, uuid_1.parse)(lessonId))
            }
        });
        if (!existingLesson) {
            return res.status(404).json((0, responseInterfaces_1.createErrorResponse)('Lesson does not exist.'));
        }
        const existingHomework = await db_1.default.homeworks.findUnique({
            where: {
                lesson_id: node_buffer_1.Buffer.from((0, uuid_1.parse)(lessonId))
            }
        });
        if (existingHomework) {
            return res.status(409).json((0, responseInterfaces_1.createErrorResponse)('Homework already exists.'));
        }
        const createdHomework = await db_1.default.homeworks.create({
            data: {
                description,
                deadline: new Date(deadline),
                lesson_id: node_buffer_1.Buffer.from((0, uuid_1.parse)(lessonId))
            }
        });
        const responseData = {
            ...createdHomework,
            id: (0, uuid_1.stringify)(createdHomework.id),
            deadline: createdHomework.deadline.toISOString(),
            lesson_id: (0, uuid_1.stringify)(createdHomework.lesson_id)
        };
        return res.status(200).json((0, responseInterfaces_1.createSuccessResponse)(responseData, 'Homework created successfully.'));
    }
    catch (err) {
        console.error('Error creating homework', err);
        return res.status(500).json((0, responseInterfaces_1.createErrorResponse)('An unexpected error occurred while creating homework. Please try again later.'));
    }
};
exports.createHomework = createHomework;
const getHomework = async (req, res) => {
    try {
        const lessonId = req.params.lessonId;
        const existingLesson = await db_1.default.lessons.findUnique({
            where: {
                id: node_buffer_1.Buffer.from((0, uuid_1.parse)(lessonId))
            }
        });
        if (!existingLesson) {
            return res.status(404).json((0, responseInterfaces_1.createErrorResponse)(`Lesson does not exist.`));
        }
        const homework = await db_1.default.homeworks.findUnique({
            where: {
                lesson_id: node_buffer_1.Buffer.from((0, uuid_1.parse)(lessonId))
            }
        });
        let responseData = null;
        if (homework) {
            responseData = {
                ...homework,
                id: (0, uuid_1.stringify)(homework.id),
                deadline: homework.deadline.toISOString(),
                lesson_id: (0, uuid_1.stringify)(homework.lesson_id)
            };
        }
        return res.status(200).json((0, responseInterfaces_1.createSuccessResponse)(responseData, 'Homework retrieved successfully.'));
    }
    catch (err) {
        console.error('Error retrieving homework', err);
        return res.status(500).json((0, responseInterfaces_1.createErrorResponse)('An unexpected error occurred while retrieving homework. Please try again later.'));
    }
};
exports.getHomework = getHomework;
const getHomeworkById = async (req, res) => {
    try {
        const homeworkId = req.params.homeworkId;
        const existingHomework = await db_1.default.homeworks.findUnique({
            where: {
                id: node_buffer_1.Buffer.from((0, uuid_1.parse)(homeworkId)),
            }
        });
        if (!existingHomework) {
            return res.status(404).json((0, responseInterfaces_1.createErrorResponse)('Homework does not exist.'));
        }
        const lesson = await db_1.default.lessons.findUnique({
            where: {
                id: existingHomework.lesson_id
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
        const responseData = {
            id: (0, uuid_1.stringify)(existingHomework.id),
            description: existingHomework.description,
            deadline: existingHomework.deadline.toISOString(),
            lesson_id: (0, uuid_1.stringify)(existingHomework.lesson_id),
            subject_name: lesson?.subjects.name,
            teacher_full_name: `${lesson?.teachers.first_name} ${lesson?.teachers.last_name}`
        };
        return res.status(200).json((0, responseInterfaces_1.createSuccessResponse)(responseData, 'Homework retrieved successfully.'));
    }
    catch (err) {
        console.error('Error retrieving homework by ID', err);
        return res.status(500).json((0, responseInterfaces_1.createErrorResponse)('An unexpected error occurred while retrieving homework. Please try again later.'));
    }
};
exports.getHomeworkById = getHomeworkById;
const getLatestHomework = async (req, res) => {
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
        const latestHomework = await db_1.default.homeworks.findFirst({
            where: {
                lessons: {
                    class_id: existingStudent.class_id
                }
            },
            select: {
                id: true,
                description: true,
                deadline: true,
                lesson_id: true,
                lessons: {
                    select: {
                        subjects: {
                            select: {
                                name: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                deadline: 'asc'
            }
        });
        let responseData = null;
        if (latestHomework) {
            responseData = {
                id: (0, uuid_1.stringify)(latestHomework.id),
                description: latestHomework.description,
                deadline: latestHomework.deadline.toISOString(),
                subject_name: latestHomework.lessons.subjects.name,
                lesson_id: (0, uuid_1.stringify)(latestHomework.lesson_id)
            };
        }
        return res.status(200).json((0, responseInterfaces_1.createSuccessResponse)(responseData, 'Homework retrieved successfully.'));
    }
    catch (err) {
        console.error('Error retrieving homework', err);
        return res.status(500).json((0, responseInterfaces_1.createErrorResponse)('An unexpected error occurred while retrieving homework. Please try again later.'));
    }
};
exports.getLatestHomework = getLatestHomework;
const updateHomework = async (req, res) => {
    try {
        const homeworkId = req.params.homeworkId;
        const description = req.body.description;
        const deadline = req.body.deadline;
        const existingHomework = await db_1.default.homeworks.findUnique({
            where: {
                id: node_buffer_1.Buffer.from((0, uuid_1.parse)(homeworkId))
            }
        });
        if (!existingHomework) {
            return res.status(404).json((0, responseInterfaces_1.createErrorResponse)('Homework does not exist.'));
        }
        const data = {};
        if (description) {
            data.description = description;
        }
        if (deadline) {
            data.deadline = new Date(deadline);
        }
        const updatedHomework = await db_1.default.homeworks.update({
            where: {
                id: node_buffer_1.Buffer.from((0, uuid_1.parse)(homeworkId))
            },
            data: data
        });
        const responseData = {
            ...updatedHomework,
            id: (0, uuid_1.stringify)(updatedHomework.id),
            deadline: updatedHomework.deadline.toISOString(),
            lesson_id: (0, uuid_1.stringify)(updatedHomework.lesson_id)
        };
        return res.status(200).json((0, responseInterfaces_1.createSuccessResponse)(responseData, 'Homework updated successfully.'));
    }
    catch (err) {
        console.error('Error updating homework', err);
        return res.status(500).json((0, responseInterfaces_1.createErrorResponse)('An unexpected error occurred while updating homework. Please try again later.'));
    }
};
exports.updateHomework = updateHomework;
const deleteHomework = async (req, res) => {
    try {
        const homeworkId = req.params.homeworkId;
        const existingHomework = await db_1.default.homeworks.findUnique({
            where: {
                id: node_buffer_1.Buffer.from((0, uuid_1.parse)(homeworkId))
            }
        });
        if (!existingHomework) {
            return res.status(404).json((0, responseInterfaces_1.createErrorResponse)('Homework does not exist.'));
        }
        const deletedHomework = await db_1.default.homeworks.delete({
            where: {
                id: node_buffer_1.Buffer.from((0, uuid_1.parse)(homeworkId))
            }
        });
        const responseData = {
            ...deletedHomework,
            id: (0, uuid_1.stringify)(deletedHomework.id),
            deadline: deletedHomework.deadline.toISOString(),
            lesson_id: (0, uuid_1.stringify)(deletedHomework.lesson_id)
        };
        return res.status(200).json((0, responseInterfaces_1.createSuccessResponse)(responseData, 'Homework deleted successfully.'));
    }
    catch (err) {
        console.error('Error deleting homework', err);
        return res.status(500).json((0, responseInterfaces_1.createErrorResponse)('An unexpected error occurred while deleting the homework. Please try again later.'));
    }
};
exports.deleteHomework = deleteHomework;
const getHomeworksForStudent = async (req, res) => {
    try {
        const studentId = req.params.studentId;
        const existingStudent = await db_1.default.students.findUnique({
            where: {
                id: node_buffer_1.Buffer.from((0, uuid_1.parse)(studentId))
            }
        });
        if (!existingStudent) {
            return res.status(404).json((0, responseInterfaces_1.createErrorResponse)('Uczeń nie istnieje.'));
        }
        if (!existingStudent.class_id) {
            return res.status(404).json((0, responseInterfaces_1.createErrorResponse)('Uczeń nie jest przypisany do żadnej klasy.'));
        }
        const lessons = await db_1.default.lessons.findMany({
            where: {
                class_id: existingStudent.class_id
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
        if (lessons.length === 0) {
            return res.status(200).json((0, responseInterfaces_1.createSuccessResponse)([], 'Brak lekcji dla klasy ucznia.'));
        }
        const lessonIds = lessons.map(lesson => lesson.id);
        const homeworks = await db_1.default.homeworks.findMany({
            where: {
                lesson_id: { in: lessonIds }
            },
            include: {
                lessons: {
                    select: {
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
                }
            },
            orderBy: {
                deadline: 'asc'
            }
        });
        if (homeworks.length === 0) {
            return res.status(200).json((0, responseInterfaces_1.createSuccessResponse)([], 'Brak prac domowych dla ucznia.'));
        }
        const responseData = homeworks.map(hw => ({
            id: (0, uuid_1.stringify)(hw.id),
            description: hw.description,
            deadline: hw.deadline.toISOString(),
            lesson_id: (0, uuid_1.stringify)(hw.lesson_id),
            subject_name: hw.lessons.subjects.name,
            teacher_full_name: `${hw.lessons.teachers.first_name} ${hw.lessons.teachers.last_name}`
        }));
        return res.status(200).json((0, responseInterfaces_1.createSuccessResponse)(responseData, 'Prace domowe pobrane pomyślnie.'));
    }
    catch (err) {
        console.error('Błąd podczas pobierania prac domowych dla ucznia', err);
        return res.status(500).json((0, responseInterfaces_1.createErrorResponse)('Wystąpił nieoczekiwany błąd podczas pobierania prac domowych. Proszę spróbować ponownie później.'));
    }
};
exports.getHomeworksForStudent = getHomeworksForStudent;
const getAllHomeworks = async (req, res) => {
    try {
        const homeworks = await db_1.default.homeworks.findMany({
            include: {
                lessons: {
                    select: {
                        subjects: { select: { name: true } },
                        teachers: { select: { first_name: true, last_name: true } }
                    }
                }
            },
            orderBy: { deadline: 'asc' }
        });
        const responseData = homeworks.map(hw => ({
            id: (0, uuid_1.stringify)(hw.id),
            description: hw.description,
            deadline: hw.deadline.toISOString(),
            lesson_id: (0, uuid_1.stringify)(hw.lesson_id),
            subject_name: hw.lessons.subjects.name,
            teacher_full_name: `${hw.lessons.teachers.first_name} ${hw.lessons.teachers.last_name}`
        }));
        return res.status(200).json((0, responseInterfaces_1.createSuccessResponse)(responseData, 'Homework deleted successfully.'));
    }
    catch (err) {
        console.error('Error retrieving homework', err);
        return res.status(500).json((0, responseInterfaces_1.createErrorResponse)('An unexpected error occurred while deleting the homework. Please try again later.'));
    }
};
exports.getAllHomeworks = getAllHomeworks;
const getHomeworksForTeacher = async (req, res) => {
    try {
        const teacherId = req.params.teacherId;
        const existingTeacher = await db_1.default.teachers.findUnique({
            where: {
                id: node_buffer_1.Buffer.from((0, uuid_1.parse)(teacherId))
            }
        });
        if (!existingTeacher) {
            return res.status(404).json((0, responseInterfaces_1.createErrorResponse)('Uczeń nie istnieje.'));
        }
        const lessons = await db_1.default.lessons.findMany({
            where: {
                teacher_id: existingTeacher.id
            },
            include: {
                subjects: {
                    select: {
                        name: true
                    }
                }
            }
        });
        if (lessons.length === 0) {
            return res.status(200).json((0, responseInterfaces_1.createSuccessResponse)([], 'Brak lekcji dla nauczyciela.'));
        }
        const lessonIds = lessons.map(lesson => lesson.id);
        const homeworks = await db_1.default.homeworks.findMany({
            where: {
                lesson_id: { in: lessonIds }
            },
            include: {
                lessons: {
                    select: {
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
                }
            },
            orderBy: {
                deadline: 'asc'
            }
        });
        if (homeworks.length === 0) {
            return res.status(200).json((0, responseInterfaces_1.createSuccessResponse)([], 'Brak prac domowych dla nauczyciela.'));
        }
        const responseData = homeworks.map(hw => ({
            id: (0, uuid_1.stringify)(hw.id),
            description: hw.description,
            deadline: hw.deadline.toISOString(),
            lesson_id: (0, uuid_1.stringify)(hw.lesson_id),
            subject_name: hw.lessons.subjects.name,
            teacher_full_name: `${hw.lessons.teachers.first_name} ${hw.lessons.teachers.last_name}`
        }));
        return res.status(200).json((0, responseInterfaces_1.createSuccessResponse)(responseData, 'Prace domowe pobrane pomyślnie.'));
    }
    catch (err) {
        console.error('Błąd podczas pobierania prac domowych dla ucznia', err);
        return res.status(500).json((0, responseInterfaces_1.createErrorResponse)('Wystąpił nieoczekiwany błąd podczas pobierania prac domowych. Proszę spróbować ponownie później.'));
    }
};
exports.getHomeworksForTeacher = getHomeworksForTeacher;
