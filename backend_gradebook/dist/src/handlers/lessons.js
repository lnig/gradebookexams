"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteLesson = exports.deleteLessonsByClassIdAndDate = exports.deleteLessonsByClassAndSubjectIds = exports.updateLesson = exports.getLessonsToday = exports.getLessonsThreeDaysAhead = exports.getLessonsThreeDaysBack = exports.getLessonsForUser = exports.getLessonsByClassId = exports.getAllLessons = exports.getLessons = exports.createLessons = void 0;
const db_1 = __importDefault(require("../db"));
const client_1 = require("@prisma/client");
const responseInterfaces_1 = require("../interfaces/responseInterfaces");
const uuid_1 = require("uuid");
const node_buffer_1 = require("node:buffer");
function isStudent(user) {
    return user.class_id !== undefined;
}
const createLessons = async (req, res) => {
    try {
        // startDate and endDate are the same values as these that are present in specific semester
        // start data < lessons dates < end date
        const startDate = new Date(req.body.startDate);
        const endDate = new Date(req.body.endDate);
        const lessonSchedules = req.body.lessonSchedules;
        const teacherId = req.body.teacherId;
        const classId = req.body.classId;
        const subjectId = req.body.subjectId;
        if (startDate >= endDate) {
            return res.status(400).json((0, responseInterfaces_1.createErrorResponse)('Start date must be earlier than end date.'));
        }
        const existingTeacher = await db_1.default.teachers.findUnique({
            where: {
                id: node_buffer_1.Buffer.from((0, uuid_1.parse)(teacherId))
            }
        });
        if (!existingTeacher) {
            return res.status(404).json((0, responseInterfaces_1.createErrorResponse)(`Teacher does not exist.`));
        }
        const existingClass = await db_1.default.classes.findUnique({
            where: {
                id: node_buffer_1.Buffer.from((0, uuid_1.parse)(classId))
            }
        });
        if (!existingClass) {
            return res.status(404).json((0, responseInterfaces_1.createErrorResponse)(`Class does not exist.`));
        }
        const existingSubject = await db_1.default.subjects.findUnique({
            where: {
                id: node_buffer_1.Buffer.from((0, uuid_1.parse)(subjectId))
            }
        });
        if (!existingSubject) {
            return res.status(404).json((0, responseInterfaces_1.createErrorResponse)(`Subject does not exist.`));
        }
        const dayMilliseconds = 24 * 60 * 60 * 1000;
        const weekMilliseconds = 7 * dayMilliseconds;
        for (const schedule of lessonSchedules) {
            let currentDate = new Date(startDate.getTime() + dayMilliseconds);
            while (currentDate < endDate) {
                const dayOfWeek = currentDate.getDay();
                if (dayOfWeek !== schedule.dayOfWeek) {
                    const daysUntilNextLesson = (schedule.dayOfWeek + 7 - dayOfWeek) % 7;
                    currentDate = new Date(currentDate.getTime() + daysUntilNextLesson * dayMilliseconds);
                }
                if (currentDate < endDate) {
                    const [startHour, startMinute] = schedule.startTime.split(':').map(Number);
                    const [endHour, endMinute] = schedule.endTime.split(':').map(Number);
                    const lessonStartTime = new Date(currentDate);
                    lessonStartTime.setUTCHours(startHour, startMinute, 0, 0);
                    const lessonEndTime = new Date(currentDate);
                    lessonEndTime.setUTCHours(endHour, endMinute, 0, 0);
                    const dateStr = currentDate.toISOString().split('T')[0];
                    const startTimeStr = lessonStartTime.toISOString().split('T')[1].slice(0, 8);
                    const endTimeStr = lessonEndTime.toISOString().split('T')[1].slice(0, 8);
                    const existingLessons = await db_1.default.$queryRaw(client_1.Prisma.sql `
                            SELECT *
                            FROM lessons
                            WHERE 
                                date = ${dateStr} AND
                                class_id = ${node_buffer_1.Buffer.from((0, uuid_1.parse)(classId))} AND
                                (
                                    ${startTimeStr} BETWEEN start_time AND end_time OR
                                    ${endTimeStr} BETWEEN start_time AND end_time OR
                                    start_time BETWEEN ${startTimeStr} AND ${endTimeStr}
                                )
                            LIMIT 1
                        `);
                    if (existingLessons.length > 0) {
                        return res.status(409).json({ error: 'Lesson overlaps with another lesson.' });
                    }
                }
                currentDate = new Date(currentDate.getTime() + (schedule.frequency * weekMilliseconds));
            }
        }
        const lessonsToCreate = [];
        lessonSchedules.forEach((schedule) => {
            let currentDate = new Date(startDate.getTime() + dayMilliseconds);
            while (currentDate < endDate) {
                const dayOfWeek = currentDate.getDay();
                if (dayOfWeek !== schedule.dayOfWeek) {
                    const daysUntilNextLesson = (schedule.dayOfWeek + 7 - dayOfWeek) % 7;
                    currentDate = new Date(currentDate.getTime() + daysUntilNextLesson * dayMilliseconds);
                }
                if (currentDate < endDate) {
                    const [startHour, startMinute] = schedule.startTime.split(':').map(Number);
                    const [endHour, endMinute] = schedule.endTime.split(':').map(Number);
                    const lessonStartTime = new Date(currentDate);
                    const lessonEndTime = new Date(currentDate);
                    lessonStartTime.setUTCHours(startHour, startMinute, 0, 0);
                    lessonEndTime.setUTCHours(endHour, endMinute, 0, 0);
                    lessonsToCreate.push({
                        date: currentDate,
                        start_time: lessonStartTime,
                        end_time: lessonEndTime,
                        teacher_id: node_buffer_1.Buffer.from((0, uuid_1.parse)(teacherId)),
                        class_id: node_buffer_1.Buffer.from((0, uuid_1.parse)(classId)),
                        subject_id: node_buffer_1.Buffer.from((0, uuid_1.parse)(subjectId))
                    });
                }
                currentDate = new Date(currentDate.getTime() + (schedule.frequency * weekMilliseconds));
            }
        });
        const payload = await db_1.default.lessons.createMany({
            data: lessonsToCreate
        });
        res.status(200).json((0, responseInterfaces_1.createSuccessResponse)(payload.count, `Lessons generated successfully.`));
    }
    catch (err) {
        console.error('Error generating lessons', err);
        res.status(500).json((0, responseInterfaces_1.createErrorResponse)('An unexpected error occurred while generating lessons. Please try again later.'));
    }
};
exports.createLessons = createLessons;
const getLessons = async (req, res) => {
    try {
        const classId = req.params.classId;
        const subjectId = req.params.subjectId;
        const existingClass = await db_1.default.classes.findUnique({
            where: {
                id: node_buffer_1.Buffer.from((0, uuid_1.parse)(classId))
            }
        });
        if (!existingClass) {
            return res.status(404).json((0, responseInterfaces_1.createErrorResponse)(`Class does not exist.`));
        }
        const existingSubject = await db_1.default.subjects.findUnique({
            where: {
                id: node_buffer_1.Buffer.from((0, uuid_1.parse)(subjectId))
            }
        });
        if (!existingSubject) {
            return res.status(404).json((0, responseInterfaces_1.createErrorResponse)(`Subject does not exist.`));
        }
        const lessons = await db_1.default.lessons.findMany({
            where: {
                class_id: node_buffer_1.Buffer.from((0, uuid_1.parse)(classId)),
                subject_id: node_buffer_1.Buffer.from((0, uuid_1.parse)(subjectId)),
            }
        });
        const responseData = lessons.map(lesson => ({
            ...lesson,
            id: (0, uuid_1.stringify)(lesson.id),
            date: lesson.date.toISOString(),
            start_time: lesson.start_time.toISOString(),
            end_time: lesson.end_time.toISOString(),
            teacher_id: (0, uuid_1.stringify)(lesson.teacher_id),
            class_id: (0, uuid_1.stringify)(lesson.class_id),
            subject_id: (0, uuid_1.stringify)(lesson.subject_id)
        }));
        return res.status(200).json((0, responseInterfaces_1.createSuccessResponse)(responseData, `Lessons retrieved successfully.`));
    }
    catch (err) {
        console.error('Error retrieving lessons', err);
        res.status(500).json((0, responseInterfaces_1.createErrorResponse)('An unexpected error occurred while retrieving lessons. Please try again later.'));
    }
};
exports.getLessons = getLessons;
const getAllLessons = async (req, res) => {
    try {
        const lessons = await db_1.default.lessons.findMany();
        const responseData = lessons.map(lesson => ({
            ...lesson,
            id: (0, uuid_1.stringify)(lesson.id),
            date: lesson.date.toISOString(),
            start_time: lesson.start_time.toISOString(),
            end_time: lesson.end_time.toISOString(),
            teacher_id: (0, uuid_1.stringify)(lesson.teacher_id),
            class_id: (0, uuid_1.stringify)(lesson.class_id),
            subject_id: (0, uuid_1.stringify)(lesson.subject_id)
        }));
        return res.status(200).json((0, responseInterfaces_1.createSuccessResponse)(responseData, `All lessons retrieved successfully.`));
    }
    catch (err) {
        console.error('Error retrieving all lessons', err);
        res.status(500).json((0, responseInterfaces_1.createErrorResponse)('An unexpected error occurred while retrieving lessons. Please try again later.'));
    }
};
exports.getAllLessons = getAllLessons;
const getLessonsByClassId = async (req, res) => {
    try {
        const classId = req.params.classId;
        const existingClass = await db_1.default.classes.findUnique({
            where: {
                id: node_buffer_1.Buffer.from((0, uuid_1.parse)(classId))
            },
            include: {
                students: true
            }
        });
        if (!existingClass) {
            return res.status(404).json((0, responseInterfaces_1.createErrorResponse)(`Class does not exist.`));
        }
        const lessons = await db_1.default.lessons.findMany({
            where: {
                class_id: node_buffer_1.Buffer.from((0, uuid_1.parse)(classId)),
            },
            include: {
                teachers: true,
                subjects: true,
                classes: {
                    include: {
                        students: true
                    }
                }
            },
            orderBy: [
                { date: 'asc' },
                { start_time: 'asc' }
            ]
        });
        const responseData = lessons.map(lesson => ({
            ...lesson,
            id: (0, uuid_1.stringify)(lesson.id),
            date: lesson.date.toISOString(),
            start_time: lesson.start_time.toISOString(),
            end_time: lesson.end_time.toISOString(),
            teacher_id: (0, uuid_1.stringify)(lesson.teacher_id),
            class_id: (0, uuid_1.stringify)(lesson.class_id),
            subject_id: (0, uuid_1.stringify)(lesson.subject_id),
            teachers: {
                ...lesson.teachers,
                id: (0, uuid_1.stringify)(lesson.teachers.id),
                reset_password_token: undefined,
                reset_password_expires: undefined
            },
            subjects: {
                ...lesson.subjects,
                id: (0, uuid_1.stringify)(lesson.subjects.id),
            },
            students: lesson.classes.students.map(student => ({
                ...student,
                id: (0, uuid_1.stringify)(student.id),
                class_id: student.class_id ? (0, uuid_1.stringify)(student.class_id) : null,
            })),
        }));
        return res.status(200).json((0, responseInterfaces_1.createSuccessResponse)(responseData, `Lessons retrieved successfully.`));
    }
    catch (err) {
        console.error('Error retrieving lessons by class ID', err);
        res.status(500).json((0, responseInterfaces_1.createErrorResponse)('An unexpected error occurred while retrieving lessons. Please try again later.'));
    }
};
exports.getLessonsByClassId = getLessonsByClassId;
const getLessonsForUser = async (req, res) => {
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
        const now = new Date();
        const todayMidnight = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0));
        const currentSemester = await db_1.default.semesters.findFirst({
            where: {
                start_date: { lte: todayMidnight },
                end_date: { gte: todayMidnight }
            }
        });
        if (!currentSemester) {
            return res.status(404).json((0, responseInterfaces_1.createErrorResponse)(`Semester does not exist.`));
        }
        let lessonsData;
        if (isStudent(existingUser) && existingUser.class_id) {
            lessonsData = await db_1.default.lessons.findMany({
                where: {
                    class_id: existingUser.class_id
                },
                include: {
                    teachers: true,
                    subjects: true,
                    classes: {
                        include: { students: true }
                    }
                },
                orderBy: [
                    { date: 'asc' },
                    { start_time: 'asc' }
                ]
            });
        }
        else {
            lessonsData = await db_1.default.lessons.findMany({
                where: {
                    teacher_id: existingUser.id
                },
                include: {
                    teachers: true,
                    subjects: true,
                    classes: {
                        include: { students: true }
                    }
                },
                orderBy: [
                    { date: 'asc' },
                    { start_time: 'asc' }
                ]
            });
        }
        const responseData = lessonsData.map(lesson => ({
            ...lesson,
            id: (0, uuid_1.stringify)(lesson.id),
            date: lesson.date.toISOString(),
            start_time: lesson.start_time.toISOString(),
            end_time: lesson.end_time.toISOString(),
            teacher_id: (0, uuid_1.stringify)(lesson.teacher_id),
            class_id: (0, uuid_1.stringify)(lesson.class_id),
            subject_id: (0, uuid_1.stringify)(lesson.subject_id),
            teachers: {
                ...lesson.teachers,
                id: (0, uuid_1.stringify)(lesson.teachers.id),
                reset_password_token: undefined,
                reset_password_expires: undefined
            },
            subjects: {
                ...lesson.subjects,
                id: (0, uuid_1.stringify)(lesson.subjects.id),
            },
            students: lesson.classes.students.map(student => ({
                ...student,
                id: (0, uuid_1.stringify)(student.id),
                class_id: student.class_id ? (0, uuid_1.stringify)(student.class_id) : null,
            })),
        }));
        return res.status(200).json((0, responseInterfaces_1.createSuccessResponse)(responseData, `Lessons retrieved successfully.`));
    }
    catch (err) {
        console.error('Error retrieving lessons for user', err);
        res.status(500).json((0, responseInterfaces_1.createErrorResponse)('An unexpected error occurred while retrieving lessons. Please try again later.'));
    }
};
exports.getLessonsForUser = getLessonsForUser;
const getLessonsThreeDaysBack = async (req, res) => {
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
        ;
        if (!existingUser) {
            return res.status(404).json((0, responseInterfaces_1.createErrorResponse)(`User does not exist.`));
        }
        const now = new Date();
        const year = now.getUTCFullYear();
        const month = now.getUTCMonth();
        const day = now.getUTCDate();
        const todayMidnight = new Date(Date.UTC(year, month, day - 1, 0, 0, 0));
        const threeDaysAgoMidnight = new Date(todayMidnight.getTime());
        threeDaysAgoMidnight.setUTCDate(threeDaysAgoMidnight.getUTCDate() - 3);
        let lessons;
        if (isStudent(existingUser) && existingUser.class_id) {
            lessons = await db_1.default.lessons.findMany({
                where: {
                    class_id: existingUser.class_id,
                    date: {
                        gte: threeDaysAgoMidnight,
                        lte: todayMidnight
                    }
                },
                include: {
                    teachers: true,
                    subjects: true,
                }
            });
        }
        else {
            lessons = await db_1.default.lessons.findMany({
                where: {
                    teacher_id: existingUser.id,
                    date: {
                        gte: threeDaysAgoMidnight,
                        lte: todayMidnight
                    }
                },
                include: {
                    teachers: true,
                    subjects: true,
                },
            });
        }
        const responseData = lessons.map((lesson) => ({
            ...lesson,
            id: (0, uuid_1.stringify)(lesson.id),
            date: lesson.date.toISOString(),
            start_time: lesson.start_time.toISOString(),
            end_time: lesson.end_time.toISOString(),
            teacher_id: (0, uuid_1.stringify)(lesson.teacher_id),
            class_id: (0, uuid_1.stringify)(lesson.class_id),
            subject_id: (0, uuid_1.stringify)(lesson.subject_id),
            teachers: {
                ...lesson.teachers,
                id: (0, uuid_1.stringify)(lesson.teachers.id),
                reset_password_token: undefined,
                reset_password_expires: undefined
            },
            subjects: {
                ...lesson.subjects,
                id: (0, uuid_1.stringify)(lesson.subjects.id),
            }
        }));
        return res.status(200).json((0, responseInterfaces_1.createSuccessResponse)(responseData, `Lessons three days back retrieved successfully.`));
    }
    catch (err) {
        console.error('Error retrieving lessons three days back', err);
        res.status(500).json((0, responseInterfaces_1.createErrorResponse)('An unexpected error occurred while retrieving lessons three days back. Please try again later.'));
    }
};
exports.getLessonsThreeDaysBack = getLessonsThreeDaysBack;
const getLessonsThreeDaysAhead = async (req, res) => {
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
        ;
        if (!existingUser) {
            return res.status(404).json((0, responseInterfaces_1.createErrorResponse)(`User does not exist.`));
        }
        const now = new Date();
        const year = now.getUTCFullYear();
        const month = now.getUTCMonth();
        const day = now.getUTCDate();
        const todayMidnight = new Date(Date.UTC(year, month, day + 1, 0, 0, 0));
        const threeDaysAheadMidnight = new Date(todayMidnight.getTime());
        threeDaysAheadMidnight.setUTCDate(threeDaysAheadMidnight.getUTCDate() + 3);
        let lessons;
        if (isStudent(existingUser) && existingUser.class_id) {
            lessons = await db_1.default.lessons.findMany({
                where: {
                    class_id: existingUser.class_id,
                    date: {
                        gte: todayMidnight,
                        lte: threeDaysAheadMidnight
                    }
                },
                include: {
                    teachers: true,
                    subjects: true,
                }
            });
        }
        else {
            lessons = await db_1.default.lessons.findMany({
                where: {
                    teacher_id: existingUser.id,
                    date: {
                        gte: todayMidnight,
                        lte: threeDaysAheadMidnight
                    }
                },
                include: {
                    teachers: true,
                    subjects: true,
                },
            });
        }
        const responseData = lessons.map((lesson) => ({
            ...lesson,
            id: (0, uuid_1.stringify)(lesson.id),
            date: lesson.date.toISOString(),
            start_time: lesson.start_time.toISOString(),
            end_time: lesson.end_time.toISOString(),
            teacher_id: (0, uuid_1.stringify)(lesson.teacher_id),
            class_id: (0, uuid_1.stringify)(lesson.class_id),
            subject_id: (0, uuid_1.stringify)(lesson.subject_id),
            teachers: {
                ...lesson.teachers,
                id: (0, uuid_1.stringify)(lesson.teachers.id),
                reset_password_token: undefined,
                reset_password_expires: undefined
            },
            subjects: {
                ...lesson.subjects,
                id: (0, uuid_1.stringify)(lesson.subjects.id),
            }
        }));
        return res.status(200).json((0, responseInterfaces_1.createSuccessResponse)(responseData, `Lessons three days ahead retrieved successfully.`));
    }
    catch (err) {
        console.error('Error retrieving lessons three days ahead', err);
        res.status(500).json((0, responseInterfaces_1.createErrorResponse)('An unexpected error occurred while retrieving lessons three days ahead. Please try again later.'));
    }
};
exports.getLessonsThreeDaysAhead = getLessonsThreeDaysAhead;
const getLessonsToday = async (req, res) => {
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
        ;
        if (!existingUser) {
            return res.status(404).json((0, responseInterfaces_1.createErrorResponse)(`User does not exist.`));
        }
        const now = new Date();
        const year = now.getUTCFullYear();
        const month = now.getUTCMonth();
        const day = now.getUTCDate();
        const todayMidnight = new Date(Date.UTC(year, month, day, 0, 0, 0));
        let lessons;
        if (isStudent(existingUser) && existingUser.class_id) {
            lessons = await db_1.default.lessons.findMany({
                where: {
                    class_id: existingUser.class_id,
                    date: {
                        equals: todayMidnight
                    }
                },
                include: {
                    teachers: true,
                    subjects: true,
                }
            });
        }
        else {
            lessons = await db_1.default.lessons.findMany({
                where: {
                    teacher_id: existingUser.id,
                    date: {
                        equals: todayMidnight
                    }
                },
                include: {
                    teachers: true,
                    subjects: true,
                },
            });
        }
        const responseData = lessons.map((lesson) => ({
            ...lesson,
            id: (0, uuid_1.stringify)(lesson.id),
            date: lesson.date.toISOString(),
            start_time: lesson.start_time.toISOString(),
            end_time: lesson.end_time.toISOString(),
            teacher_id: (0, uuid_1.stringify)(lesson.teacher_id),
            class_id: (0, uuid_1.stringify)(lesson.class_id),
            subject_id: (0, uuid_1.stringify)(lesson.subject_id),
            teachers: {
                ...lesson.teachers,
                id: (0, uuid_1.stringify)(lesson.teachers.id),
                reset_password_token: undefined,
                reset_password_expires: undefined
            },
            subjects: {
                ...lesson.subjects,
                id: (0, uuid_1.stringify)(lesson.subjects.id),
            }
        }));
        return res.status(200).json((0, responseInterfaces_1.createSuccessResponse)(responseData, `Lessons today retrieved successfully.`));
    }
    catch (err) {
        console.error('Error retrieving lessons today', err);
        res.status(500).json((0, responseInterfaces_1.createErrorResponse)('An unexpected error occurred while retrieving lessons today. Please try again later.'));
    }
};
exports.getLessonsToday = getLessonsToday;
const updateLesson = async (req, res) => {
    try {
        const lessonId = req.params.lessonId;
        const description = req.body.description;
        const existingLesson = await db_1.default.lessons.findUnique({
            where: {
                id: node_buffer_1.Buffer.from((0, uuid_1.parse)(lessonId))
            }
        });
        if (!existingLesson) {
            return res.status(404).json((0, responseInterfaces_1.createErrorResponse)(`Lesson does not exist.`));
        }
        const updatedLesson = await db_1.default.lessons.update({
            where: {
                id: node_buffer_1.Buffer.from((0, uuid_1.parse)(lessonId))
            }, data: {
                description: description
            }
        });
        const responseData = {
            ...updatedLesson,
            id: (0, uuid_1.stringify)(updatedLesson.id),
            date: updatedLesson.date.toISOString(),
            start_time: updatedLesson.start_time.toISOString(),
            end_time: updatedLesson.end_time.toISOString(),
            teacher_id: (0, uuid_1.stringify)(updatedLesson.teacher_id),
            class_id: (0, uuid_1.stringify)(updatedLesson.class_id),
            subject_id: (0, uuid_1.stringify)(updatedLesson.subject_id)
        };
        return res.status(200).json((0, responseInterfaces_1.createSuccessResponse)(responseData, `Lesson updated successfully.`));
    }
    catch (err) {
        console.error('Error updating lesson', err);
        res.status(500).json((0, responseInterfaces_1.createErrorResponse)('An unexpected error occurred while updating lesson. Please try again later.'));
    }
};
exports.updateLesson = updateLesson;
const deleteLessonsByClassAndSubjectIds = async (req, res) => {
    try {
        const classId = req.params.classId;
        const subjectId = req.params.subjectId;
        const existingClass = await db_1.default.classes.findUnique({
            where: {
                id: node_buffer_1.Buffer.from((0, uuid_1.parse)(classId))
            }
        });
        if (!existingClass) {
            return res.status(404).json((0, responseInterfaces_1.createErrorResponse)(`Class does not exist.`));
        }
        const existingSubject = await db_1.default.subjects.findUnique({
            where: {
                id: node_buffer_1.Buffer.from((0, uuid_1.parse)(subjectId))
            }
        });
        if (!existingSubject) {
            return res.status(404).json((0, responseInterfaces_1.createErrorResponse)(`Subject does not exist.`));
        }
        const payload = await db_1.default.lessons.deleteMany({
            where: {
                class_id: node_buffer_1.Buffer.from((0, uuid_1.parse)(classId)),
                subject_id: node_buffer_1.Buffer.from((0, uuid_1.parse)(subjectId)),
            }
        });
        res.status(200).json((0, responseInterfaces_1.createSuccessResponse)(payload.count, `Lessons deleted successfully.`));
    }
    catch (err) {
        console.error('Error deleting lessons', err);
        res.status(500).json((0, responseInterfaces_1.createErrorResponse)('An unexpected error occurred while deleting lessons. Please try again later.'));
    }
};
exports.deleteLessonsByClassAndSubjectIds = deleteLessonsByClassAndSubjectIds;
const deleteLessonsByClassIdAndDate = async (req, res) => {
    try {
        const classId = req.params.classId;
        const lessonDate = new Date(req.params.date);
        const existingClass = await db_1.default.classes.findUnique({
            where: {
                id: node_buffer_1.Buffer.from((0, uuid_1.parse)(classId))
            }
        });
        if (!existingClass) {
            return res.status(404).json((0, responseInterfaces_1.createErrorResponse)(`Class does not exist.`));
        }
        const payload = await db_1.default.lessons.deleteMany({
            where: {
                class_id: node_buffer_1.Buffer.from((0, uuid_1.parse)(classId)),
                date: lessonDate
            }
        });
        res.status(200).json((0, responseInterfaces_1.createSuccessResponse)(payload.count, `Lessons deleted successfully.`));
    }
    catch (err) {
        console.error('Error deleting lessons', err);
        res.status(500).json((0, responseInterfaces_1.createErrorResponse)('An unexpected error occurred while deleting lessons. Please try again later.'));
    }
};
exports.deleteLessonsByClassIdAndDate = deleteLessonsByClassIdAndDate;
const deleteLesson = async (req, res) => {
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
        const deletedLesson = await db_1.default.lessons.delete({
            where: {
                id: node_buffer_1.Buffer.from((0, uuid_1.parse)(lessonId))
            }
        });
        const responseData = {
            ...deletedLesson,
            id: (0, uuid_1.stringify)(deletedLesson.id),
            date: deletedLesson.date.toISOString(),
            start_time: deletedLesson.start_time.toISOString(),
            end_time: deletedLesson.end_time.toISOString(),
            teacher_id: (0, uuid_1.stringify)(deletedLesson.teacher_id),
            class_id: (0, uuid_1.stringify)(deletedLesson.class_id),
            subject_id: (0, uuid_1.stringify)(deletedLesson.subject_id)
        };
        return res.status(200).json((0, responseInterfaces_1.createSuccessResponse)(responseData, `Lesson deleted successfully.`));
    }
    catch (err) {
        console.error('Error deleting lesson', err);
        return res.status(500).json((0, responseInterfaces_1.createErrorResponse)('An unexpected error occurred while deleting lesson. Please try again later.'));
    }
};
exports.deleteLesson = deleteLesson;
