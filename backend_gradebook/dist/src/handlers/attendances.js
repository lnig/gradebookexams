"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.excuseAbsencesForStudentByDate = exports.excuseAbsencesForStudent = exports.updateAttendance = exports.getStudentAttendancesByDate = exports.getClassAttendances = exports.getStudentAttendances = exports.getAttendancesStatistics = exports.getLessonAttendances = exports.createAttendances = void 0;
const db_1 = __importDefault(require("../db"));
const responseInterfaces_1 = require("../interfaces/responseInterfaces");
const node_buffer_1 = require("node:buffer");
const uuid_1 = require("uuid");
const months_1 = require("../enums/months");
const createAttendances = async (req, res) => {
    try {
        const lessonId = req.body.lessonId;
        const attendances = req.body.attendances;
        const existingLesson = await db_1.default.lessons.findUnique({
            where: {
                id: node_buffer_1.Buffer.from((0, uuid_1.parse)(lessonId))
            }
        });
        if (!existingLesson) {
            return res.status(404).json((0, responseInterfaces_1.createErrorResponse)(`Lesson does not exist.`));
        }
        for (const attendance of attendances) {
            const existingStudent = await db_1.default.students.findUnique({
                where: {
                    id: node_buffer_1.Buffer.from((0, uuid_1.parse)(attendance.studentId))
                }
            });
            if (!existingStudent) {
                return res.status(404).json((0, responseInterfaces_1.createErrorResponse)(`Student with ID ${attendance.studentId} does not exist.`));
            }
            if (!attendance.wasPresent && attendance.wasLate) {
                return res.status(422).json((0, responseInterfaces_1.createErrorResponse)(`Invalid attendance status: cannot be marked as late if student with ID '${attendance.studentId}' is absent.`));
            }
            if (attendance.wasPresent && !attendance.wasLate && attendance.wasExcused) {
                return res.status(422).json((0, responseInterfaces_1.createErrorResponse)(`Invalid attendance status: cannot be marked as excused if student with ID '${attendance.studentId}' is present and not late.`));
            }
        }
        const existingAttendance = await db_1.default.attendances.findFirst({
            where: {
                lesson_id: node_buffer_1.Buffer.from((0, uuid_1.parse)(lessonId))
            }
        });
        if (existingAttendance) {
            return res.status(409).json((0, responseInterfaces_1.createErrorResponse)(`Attendances already exists.`));
        }
        const payload = await db_1.default.attendances.createMany({
            data: attendances.map((attendance) => {
                return {
                    date_time: new Date(),
                    was_present: attendance.wasPresent,
                    was_late: attendance.wasLate,
                    was_excused: attendance.wasExcused,
                    student_id: node_buffer_1.Buffer.from((0, uuid_1.parse)(attendance.studentId)),
                    lesson_id: node_buffer_1.Buffer.from((0, uuid_1.parse)(lessonId))
                };
            })
        });
        return res.status(200).json((0, responseInterfaces_1.createSuccessResponse)(payload.count, `Attendances list created successfully.`));
    }
    catch (err) {
        console.error('Error creating attendances list', err);
        res.status(500).json((0, responseInterfaces_1.createErrorResponse)('An unexpected error occurred while creating attendances list. Please try again later.'));
    }
};
exports.createAttendances = createAttendances;
const getLessonAttendances = async (req, res) => {
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
        const attendances = await db_1.default.attendances.findMany({
            where: {
                lesson_id: node_buffer_1.Buffer.from((0, uuid_1.parse)(lessonId))
            }
        });
        const responseData = attendances.map(attendance => ({
            ...attendance,
            id: (0, uuid_1.stringify)(attendance.id),
            date_time: attendance.date_time.toISOString(),
            student_id: (0, uuid_1.stringify)(attendance.student_id),
            lesson_id: (0, uuid_1.stringify)(attendance.lesson_id)
        }));
        return res.status(200).json((0, responseInterfaces_1.createSuccessResponse)(responseData, `Attendances retrieved successfully.`));
    }
    catch (err) {
        console.error('Error retrieving attendances', err);
        return res.status(500).json((0, responseInterfaces_1.createErrorResponse)('An unexpected error occurred while retrieving attendances. Please try again later.'));
    }
};
exports.getLessonAttendances = getLessonAttendances;
const getAttendancesStatistics = async (req, res) => {
    try {
        const studentId = req.params.studentId;
        const currentYear = new Date().getUTCFullYear();
        const currentMonth = new Date().getUTCMonth();
        let startDateYear = null;
        let endDateYear = null;
        if (currentMonth < 7) {
            startDateYear = currentYear - 1;
            endDateYear = currentYear;
        }
        else {
            startDateYear = currentYear;
            endDateYear = currentYear + 1;
        }
        let startDate = new Date(startDateYear, 8, 1);
        let endDate = new Date(endDateYear, 5, 30);
        const existingStudent = await db_1.default.students.findUnique({
            where: {
                id: node_buffer_1.Buffer.from((0, uuid_1.parse)(studentId))
            }
        });
        if (!existingStudent) {
            return res.status(404).json((0, responseInterfaces_1.createErrorResponse)(`Student does not exist.`));
        }
        const attendances = await db_1.default.attendances.findMany({
            where: {
                lessons: {
                    date: {
                        gt: startDate,
                        lt: endDate
                    }
                }
            }
        });
        const responseData = {
            [months_1.Month.January]: { present: 0, late: 0, absent: 0, excused: 0 },
            [months_1.Month.February]: { present: 0, late: 0, absent: 0, excused: 0 },
            [months_1.Month.March]: { present: 0, late: 0, absent: 0, excused: 0 },
            [months_1.Month.April]: { present: 0, late: 0, absent: 0, excused: 0 },
            [months_1.Month.May]: { present: 0, late: 0, absent: 0, excused: 0 },
            [months_1.Month.June]: { present: 0, late: 0, absent: 0, excused: 0 },
            [months_1.Month.July]: { present: 0, late: 0, absent: 0, excused: 0 },
            [months_1.Month.August]: { present: 0, late: 0, absent: 0, excused: 0 },
            [months_1.Month.September]: { present: 0, late: 0, absent: 0, excused: 0 },
            [months_1.Month.October]: { present: 0, late: 0, absent: 0, excused: 0 },
            [months_1.Month.November]: { present: 0, late: 0, absent: 0, excused: 0 },
            [months_1.Month.December]: { present: 0, late: 0, absent: 0, excused: 0 }
        };
        for (const attendance of attendances) {
            if ((0, uuid_1.stringify)(attendance.student_id) !== studentId)
                continue;
            const monthIndex = attendance.date_time.getUTCMonth();
            const monthName = Object.values(months_1.Month)[monthIndex];
            if (attendance.was_excused) {
                responseData[monthName].excused += 1;
            }
            else if (attendance.was_present) {
                if (attendance.was_late) {
                    responseData[monthName].late += 1;
                }
                else {
                    responseData[monthName].present += 1;
                }
            }
            else {
                responseData[monthName].absent += 1;
            }
        }
        return res.status(200).json((0, responseInterfaces_1.createSuccessResponse)(responseData, `Attendances statistics retrieved successfully.`));
    }
    catch (err) {
        console.error('Error retrieving attendances statistics', err);
        return res.status(500).json((0, responseInterfaces_1.createErrorResponse)('An unexpected error occurred while retrieving attendances statistics. Please try again later.'));
    }
};
exports.getAttendancesStatistics = getAttendancesStatistics;
const getStudentAttendances = async (req, res) => {
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
        const attendances = await db_1.default.attendances.findMany({
            where: {
                student_id: node_buffer_1.Buffer.from((0, uuid_1.parse)(studentId))
            },
            include: {
                lessons: {
                    include: {
                        subjects: true
                    },
                },
            },
            orderBy: {
                lessons: {
                    start_time: 'asc',
                }
            }
        });
        const responseData = attendances.map(attendance => ({
            ...attendance,
            id: (0, uuid_1.stringify)(attendance.id),
            date_time: attendance.date_time.toISOString(),
            student_id: (0, uuid_1.stringify)(attendance.student_id),
            lesson_id: (0, uuid_1.stringify)(attendance.lesson_id),
            lesson: attendance.lessons ? {
                ...attendance.lessons,
                id: (0, uuid_1.stringify)(attendance.lessons.id),
                date: attendance.lessons.date.toISOString(),
                start_time: attendance.lessons.start_time.toISOString(),
                end_time: attendance.lessons.end_time.toISOString(),
                teacher_id: (0, uuid_1.stringify)(attendance.lessons.teacher_id),
                class_id: (0, uuid_1.stringify)(attendance.lessons.class_id),
                subject_id: (0, uuid_1.stringify)(attendance.lessons.subject_id),
                subject: {
                    ...attendance.lessons.subjects,
                    id: (0, uuid_1.stringify)(attendance.lessons.subjects.id),
                }
            } : null
        }));
        return res.status(200).json((0, responseInterfaces_1.createSuccessResponse)(responseData, `Attendances retrieved successfully.`));
    }
    catch (err) {
        console.error('Error retrieving attendances', err);
        return res.status(500).json((0, responseInterfaces_1.createErrorResponse)('An unexpected error occurred while retrieving attendances. Please try again later.'));
    }
};
exports.getStudentAttendances = getStudentAttendances;
const getClassAttendances = async (req, res) => {
    try {
        const classId = req.params.classId;
        const existingClass = await db_1.default.classes.findUnique({
            where: {
                id: node_buffer_1.Buffer.from((0, uuid_1.parse)(classId))
            }
        });
        if (!existingClass) {
            return res.status(404).json((0, responseInterfaces_1.createErrorResponse)('Class does not exist.'));
        }
        const existingStudents = await db_1.default.students.findMany({
            where: {
                class_id: existingClass.id
            }
        });
        const attendances = await db_1.default.attendances.findMany({
            where: {
                student_id: {
                    in: existingStudents.map(student => student.id),
                },
            },
            include: {
                students: true,
                lessons: {
                    include: {
                        subjects: true
                    },
                }
            },
            orderBy: {
                lessons: {
                    start_time: 'asc',
                }
            }
        });
        const responseData = attendances.map(attendance => ({
            ...attendance,
            id: (0, uuid_1.stringify)(attendance.id),
            date_time: attendance.date_time.toISOString(),
            student_id: (0, uuid_1.stringify)(attendance.student_id),
            lesson_id: (0, uuid_1.stringify)(attendance.lesson_id),
            student: {
                ...attendance.students,
                id: (0, uuid_1.stringify)(attendance.students.id),
                reset_password_token: null,
                reset_password_expires: null,
                class_id: attendance.students.class_id ? (0, uuid_1.stringify)(attendance.students.class_id) : null
            },
            lesson: attendance.lessons ? {
                ...attendance.lessons,
                id: (0, uuid_1.stringify)(attendance.lessons.id),
                date: attendance.lessons.date.toISOString(),
                start_time: attendance.lessons.start_time.toISOString(),
                end_time: attendance.lessons.end_time.toISOString(),
                teacher_id: (0, uuid_1.stringify)(attendance.lessons.teacher_id),
                class_id: (0, uuid_1.stringify)(attendance.lessons.class_id),
                subject_id: (0, uuid_1.stringify)(attendance.lessons.subject_id),
                subject: {
                    ...attendance.lessons.subjects,
                    id: (0, uuid_1.stringify)(attendance.lessons.subjects.id),
                }
            } : null
        }));
        return res.status(200).json((0, responseInterfaces_1.createSuccessResponse)(responseData, 'Attendances retrieved successfully.'));
    }
    catch (err) {
        console.error('Error retrieving class attendances', err);
        return res.status(500).json((0, responseInterfaces_1.createErrorResponse)('An unexpected error occurred while retrieving attendances. Please try again later.'));
    }
};
exports.getClassAttendances = getClassAttendances;
const getStudentAttendancesByDate = async (req, res) => {
    try {
        const studentId = req.params.studentId;
        const date = new Date(req.params.date);
        const existingStudent = await db_1.default.students.findUnique({
            where: {
                id: node_buffer_1.Buffer.from((0, uuid_1.parse)(studentId)),
            },
        });
        if (!existingStudent) {
            return res.status(404).json((0, responseInterfaces_1.createErrorResponse)('Student does not exist.'));
        }
        const attendances = await db_1.default.attendances.findMany({
            where: {
                student_id: node_buffer_1.Buffer.from((0, uuid_1.parse)(studentId)),
                lessons: {
                    date: {
                        gte: date,
                        lte: date
                    }
                },
            },
            include: {
                lessons: {
                    include: {
                        subjects: true
                    },
                },
            },
            orderBy: {
                lessons: {
                    start_time: 'asc',
                }
            },
        });
        const responseData = attendances.map(attendance => ({
            ...attendance,
            id: (0, uuid_1.stringify)(attendance.id),
            date_time: attendance.date_time.toISOString(),
            student_id: (0, uuid_1.stringify)(attendance.student_id),
            lesson_id: (0, uuid_1.stringify)(attendance.lesson_id),
            lesson: attendance.lessons ? {
                ...attendance.lessons,
                id: (0, uuid_1.stringify)(attendance.lessons.id),
                date: attendance.lessons.date.toISOString(),
                start_time: attendance.lessons.start_time.toISOString(),
                end_time: attendance.lessons.end_time.toISOString(),
                teacher_id: (0, uuid_1.stringify)(attendance.lessons.teacher_id),
                class_id: (0, uuid_1.stringify)(attendance.lessons.class_id),
                subject_id: (0, uuid_1.stringify)(attendance.lessons.subject_id),
                subject: {
                    ...attendance.lessons.subjects,
                    id: (0, uuid_1.stringify)(attendance.lessons.subjects.id),
                }
            } : null
        }));
        return res.status(200).json((0, responseInterfaces_1.createSuccessResponse)(responseData, 'Student attendances for the specified date successfully retrieved.'));
    }
    catch (err) {
        console.error('Error retrieving student attendances by date', err);
        return res.status(500).json((0, responseInterfaces_1.createErrorResponse)('An unexpected error occurred while retrieving attendances by date. Please try again later.'));
    }
};
exports.getStudentAttendancesByDate = getStudentAttendancesByDate;
const updateAttendance = async (req, res) => {
    try {
        const attendanceId = req.params.attendanceId;
        const wasPresent = req.body.wasPresent;
        const wasLate = req.body.wasLate;
        const wasExcused = req.body.wasExcused;
        if (!wasPresent && wasLate) {
            return res.status(422).json((0, responseInterfaces_1.createErrorResponse)('Invalid attendance status: cannot be marked as late if student is absent'));
        }
        if (wasPresent && !wasLate && wasExcused) {
            return res.status(422).json((0, responseInterfaces_1.createErrorResponse)('Invalid attendance status: cannot be marked as excused if student is present and not late.'));
        }
        const attendance = await db_1.default.attendances.findUnique({
            where: {
                id: node_buffer_1.Buffer.from((0, uuid_1.parse)(attendanceId))
            }
        });
        if (!attendance) {
            return res.status(404).json((0, responseInterfaces_1.createErrorResponse)(`Attendance does not exist.`));
        }
        const updatedAttendance = await db_1.default.attendances.update({
            where: {
                id: node_buffer_1.Buffer.from((0, uuid_1.parse)(attendanceId))
            },
            data: {
                was_present: wasPresent,
                was_late: wasLate,
                was_excused: wasExcused
            }
        });
        return res.status(200).json((0, responseInterfaces_1.createSuccessResponse)(updatedAttendance, `Attendance updated successfully.`));
    }
    catch (err) {
        console.error('Error updating attendance', err);
        return res.status(500).json((0, responseInterfaces_1.createErrorResponse)('An unexpected error occurred while updating attendance. Please try again later.'));
    }
};
exports.updateAttendance = updateAttendance;
const excuseAbsencesForStudent = async (req, res) => {
    try {
        const studentId = req.params.studentId;
        if (!(0, uuid_1.parse)(studentId)) {
            return res.status(400).json((0, responseInterfaces_1.createErrorResponse)('Invalid student ID format.'));
        }
        const existingStudent = await db_1.default.students.findUnique({
            where: {
                id: node_buffer_1.Buffer.from((0, uuid_1.parse)(studentId)),
            },
        });
        if (!existingStudent) {
            return res.status(404).json((0, responseInterfaces_1.createErrorResponse)('Student does not exist.'));
        }
        const updateResult = await db_1.default.attendances.updateMany({
            where: {
                student_id: node_buffer_1.Buffer.from((0, uuid_1.parse)(studentId)),
                was_present: false,
                was_late: false,
                was_excused: false,
            },
            data: {
                was_excused: true,
            },
        });
        if (updateResult.count === 0) {
            return res.status(404).json((0, responseInterfaces_1.createErrorResponse)('No unexcused absences found to excuse for this student.'));
        }
        return res.status(200).json((0, responseInterfaces_1.createSuccessResponse)({ updatedCount: updateResult.count }, `${updateResult.count} absences have been excused successfully for student.`));
    }
    catch (err) {
        console.error('Error excusing attendances for student', err);
        return res.status(500).json((0, responseInterfaces_1.createErrorResponse)('An unexpected error occurred while excusing attendances. Please try again later.'));
    }
};
exports.excuseAbsencesForStudent = excuseAbsencesForStudent;
const excuseAbsencesForStudentByDate = async (req, res) => {
    try {
        const studentId = req.params.studentId;
        const date = new Date(req.params.date);
        const existingStudent = await db_1.default.students.findUnique({
            where: {
                id: node_buffer_1.Buffer.from((0, uuid_1.parse)(studentId)),
            },
        });
        if (!existingStudent) {
            return res.status(404).json((0, responseInterfaces_1.createErrorResponse)('Student does not exist.'));
        }
        if (!existingStudent) {
            return res.status(404).json((0, responseInterfaces_1.createErrorResponse)('Student does not exist.'));
        }
        const startOfDay = new Date(date);
        startOfDay.setUTCHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setUTCHours(23, 59, 59, 999);
        const updateResult = await db_1.default.attendances.updateMany({
            where: {
                student_id: node_buffer_1.Buffer.from((0, uuid_1.parse)(studentId)),
                was_present: false,
                was_late: false,
                was_excused: false,
                lessons: {
                    date: {
                        gte: startOfDay,
                        lte: endOfDay,
                    },
                },
            },
            data: {
                was_excused: true,
            },
        });
        if (updateResult.count === 0) {
            return res.status(404).json((0, responseInterfaces_1.createErrorResponse)('No unexcused absences found for the specified date.'));
        }
        return res.status(200).json((0, responseInterfaces_1.createSuccessResponse)({ updatedCount: updateResult.count }, `${updateResult.count} absences have been excused successfully for the specified date.`));
    }
    catch (err) {
        console.error('Error excusing attendances for student by date', err);
        return res.status(500).json((0, responseInterfaces_1.createErrorResponse)('An unexpected error occurred while excusing attendances. Please try again later.'));
    }
};
exports.excuseAbsencesForStudentByDate = excuseAbsencesForStudentByDate;
