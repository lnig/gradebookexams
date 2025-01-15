"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllExamQuestions = exports.removeParticipantsFromExam = exports.assignParticipantsToExam = exports.getExamParticipantsForNewExam = exports.getExamParticipants = exports.getGradebookExams = exports.deleteExam = exports.updateExam = exports.createExam = exports.getExams = exports.getExam = void 0;
const db_1 = __importDefault(require("../db"));
const responseInterfaces_1 = require("../interfaces/responseInterfaces");
const uuid_1 = require("uuid");
const classService_1 = require("../services/classService");
const uuidUtils_1 = require("../utils/uuidUtils");
const userTypes_1 = require("../enums/userTypes");
const getExam = async (req, res) => {
    try {
        const { exam_id } = req.params;
        if (!(0, uuid_1.validate)(exam_id)) {
            return res.status(400).json((0, responseInterfaces_1.createErrorResponse)('Invalid exam ID format.'));
        }
        const exam = await db_1.default.exams.findUnique({
            where: { id: Buffer.from((0, uuid_1.parse)(exam_id)) },
        });
        if (!exam) {
            return res.status(404).json((0, responseInterfaces_1.createErrorResponse)('Exam not found.'));
        }
        const user = req.user;
        if (!user) {
            return res.status(401).json((0, responseInterfaces_1.createErrorResponse)('Unauthorized'));
        }
        const gradebook_exam = await db_1.default.gradebook_exams.findFirst({
            where: { lesson_id: exam.lesson_id },
        });
        if (user.role === userTypes_1.UserType.Student) {
            const responseData = {
                id: (0, uuid_1.stringify)(exam.id),
                start_date_time: exam.start_date_time,
                gradebook_exam: gradebook_exam?.topic,
                end_date_time: exam.end_date_time,
                duration: exam.duration,
                number_of_questions: exam.number_of_questions,
                description: exam.description,
                allow_review: exam.allow_review,
                hide_results: exam.hide_results,
                title: exam.title,
            };
            return res.status(200).json((0, responseInterfaces_1.createSuccessResponse)(responseData, 'Exam retrieved successfully.'));
        }
        else {
            const responseData = {
                ...(0, uuidUtils_1.convertBuffersToUUIDs)(exam),
                gradebook_exam: gradebook_exam?.topic,
                start_date_time: new Date(exam.start_date_time),
                end_date_time: new Date(exam.end_date_time),
            };
            return res.status(200).json((0, responseInterfaces_1.createSuccessResponse)(responseData, 'Exam retrieved successfully.'));
        }
    }
    catch (error) {
        console.error('Error fetching exam:', error);
        return res.status(500).json((0, responseInterfaces_1.createErrorResponse)('An unexpected error occurred while fetching the exam. Please try again later.'));
    }
};
exports.getExam = getExam;
const getExams = async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json((0, responseInterfaces_1.createErrorResponse)('Unauthorized'));
        }
        let exams;
        if (user.role === userTypes_1.UserType.Student) {
            const studentIdBuffer = Buffer.from((0, uuid_1.parse)(user.userId));
            const student = await db_1.default.students.findUnique({
                where: { id: studentIdBuffer },
                select: { class_id: true },
            });
            if (!student) {
                return res.status(404).json((0, responseInterfaces_1.createErrorResponse)('Student not found.'));
            }
            const classIdBuffer = student.class_id;
            const orConditions = [
                {
                    students_exams: {
                        some: {
                            students_id: studentIdBuffer,
                        },
                    },
                },
            ];
            if (classIdBuffer) {
                orConditions.push({
                    classes_exams: {
                        some: {
                            class_id: classIdBuffer,
                        },
                    },
                });
            }
            exams = await db_1.default.exams.findMany({
                where: {
                    OR: orConditions,
                },
            });
        }
        else if (user.role === userTypes_1.UserType.Teacher) {
            const teacherIdBuffer = Buffer.from((0, uuid_1.parse)(user.userId));
            exams = await db_1.default.exams.findMany({
                where: {
                    teacher_id: teacherIdBuffer,
                },
            });
        }
        else if (user.role === userTypes_1.UserType.Administrator) {
            exams = await db_1.default.exams.findMany();
        }
        else {
            return res.status(403).json((0, responseInterfaces_1.createErrorResponse)('Forbidden'));
        }
        const responseData = exams.map(exam => ({
            id: (0, uuid_1.stringify)(exam.id),
            start_date_time: exam.start_date_time,
            end_date_time: exam.end_date_time,
            duration: exam.duration,
            questionsCount: exam.number_of_questions,
            description: exam.description,
            title: exam.title,
        }));
        return res.status(200).json((0, responseInterfaces_1.createSuccessResponse)(responseData, 'Exams retrieved successfully.'));
    }
    catch (error) {
        console.error('Error fetching exams:', error);
        return res.status(500).json((0, responseInterfaces_1.createErrorResponse)('An unexpected error occurred while fetching exams. Please try again later.'));
    }
};
exports.getExams = getExams;
const createExam = async (req, res) => {
    try {
        const { title, lesson_id, start_date_time, end_date_time, visibility = false, number_of_questions, duration, description, number_of_tries = 1, multiple_tries = false, randomise_answers = false, time_limit_for_each_question = false, randomise_questions = false, end_test_after_leaving_window = false, block_copying_pasting = false, latest_attempt_counts = true, best_attempt_counts = false, hide_results = true, display_points_per_question = false, show_correct_answers = false, allow_navigation = false, allow_review = false, } = req.body;
        const user = req.user;
        if (!user) {
            return res.status(401).json((0, responseInterfaces_1.createErrorResponse)('Unauthorized'));
        }
        const teacher_id = user.userId;
        if (!(0, uuid_1.validate)(teacher_id)) {
            return res.status(400).json((0, responseInterfaces_1.createErrorResponse)('Invalid teacher ID format.'));
        }
        const teacherIdBuffer = Buffer.from((0, uuid_1.parse)(teacher_id));
        const teacher = await db_1.default.teachers.findUnique({
            where: { id: teacherIdBuffer },
        });
        if (!teacher) {
            return res.status(404).json((0, responseInterfaces_1.createErrorResponse)('Teacher not found.'));
        }
        const lessonIdBuffer = Buffer.from((0, uuid_1.parse)(lesson_id));
        const lesson = await db_1.default.lessons.findUnique({
            where: { id: lessonIdBuffer },
        });
        if (!lesson) {
            return res.status(404).json((0, responseInterfaces_1.createErrorResponse)('Lesson not found.'));
        }
        if (number_of_questions === undefined || typeof number_of_questions !== 'number') {
            return res.status(400).json((0, responseInterfaces_1.createErrorResponse)('number_of_questions is required and must be a number.'));
        }
        const newExam = await db_1.default.exams.create({
            data: {
                title: title,
                lesson_id: lessonIdBuffer,
                start_date_time: new Date(start_date_time),
                end_date_time: new Date(end_date_time),
                visibility: visibility,
                number_of_questions: number_of_questions,
                duration: duration,
                teacher_id: teacherIdBuffer,
                description: description,
                number_of_tries: number_of_tries,
                multiple_tries: multiple_tries,
                time_limit_for_each_question: time_limit_for_each_question,
                randomise_questions: randomise_questions,
                end_test_after_leaving_window: end_test_after_leaving_window,
                block_copying_pasting: block_copying_pasting,
                randomise_answers: randomise_answers,
                latest_attempt_counts: latest_attempt_counts,
                best_attempt_counts: best_attempt_counts,
                hide_results: hide_results,
                display_points_per_question: display_points_per_question,
                show_correct_answers: show_correct_answers,
                allow_navigation: allow_navigation,
                allow_review: allow_review,
            },
        });
        const examUUID = (0, uuid_1.stringify)(newExam.id);
        return res.status(201).json((0, responseInterfaces_1.createSuccessResponse)({ id: examUUID }, 'Exam created successfully.'));
    }
    catch (error) {
        console.error('Error creating exam:', error);
        return res.status(500).json((0, responseInterfaces_1.createErrorResponse)('An unexpected error occurred while creating the exam. Please try again later.'));
    }
};
exports.createExam = createExam;
const updateExam = async (req, res) => {
    try {
        const { exam_id } = req.params;
        const { title, lesson_id, start_date_time, end_date_time, visibility, number_of_questions, duration, description, number_of_tries, multiple_tries, randomise_answers, randomise_questions, block_copying_pasting, time_limit_for_each_question, end_test_after_leaving_window, latest_attempt_counts, best_attempt_counts, hide_results, display_points_per_question, show_correct_answers, allow_navigation, allow_review, } = req.body;
        const examIdBuffer = Buffer.from((0, uuid_1.parse)(exam_id));
        const existingExam = await db_1.default.exams.findUnique({
            where: { id: examIdBuffer },
        });
        if (!existingExam) {
            return res.status(404).json((0, responseInterfaces_1.createErrorResponse)('Exam not found.'));
        }
        const lessonIdBuffer = Buffer.from((0, uuid_1.parse)(lesson_id));
        const existingLesson = await db_1.default.lessons.findUnique({
            where: { id: lessonIdBuffer },
        });
        if (!existingLesson) {
            return res.status(404).json((0, responseInterfaces_1.createErrorResponse)('Lesson not found.'));
        }
        const updateData = {
            title: title,
            lesson_id: lessonIdBuffer,
            start_date_time: new Date(start_date_time),
            end_date_time: new Date(end_date_time),
            visibility: visibility,
            number_of_questions: number_of_questions,
            duration: duration,
            description: description,
            number_of_tries: number_of_tries,
            multiple_tries: multiple_tries,
            time_limit_for_each_question: time_limit_for_each_question,
            randomise_questions: randomise_questions,
            end_test_after_leaving_window: end_test_after_leaving_window,
            block_copying_pasting: block_copying_pasting,
            randomise_answers: randomise_answers,
            latest_attempt_counts: latest_attempt_counts,
            best_attempt_counts: best_attempt_counts,
            hide_results: hide_results,
            display_points_per_question: display_points_per_question,
            show_correct_answers: show_correct_answers,
            allow_navigation: allow_navigation,
            allow_review: allow_review,
        };
        const updatedExam = await db_1.default.exams.update({
            where: { id: examIdBuffer },
            data: updateData,
        });
        const existing1Exam = await db_1.default.exams.findUnique({
            where: { id: examIdBuffer },
        });
        const examUUID = (0, uuid_1.stringify)(updatedExam.id);
        return res.status(200).json((0, responseInterfaces_1.createSuccessResponse)({ id: examUUID }, 'Exam updated successfully.'));
    }
    catch (error) {
        console.error('Error updating exam:', error);
        return res.status(500).json((0, responseInterfaces_1.createErrorResponse)('An unexpected error occurred while updating the exam. Please try again later.'));
    }
};
exports.updateExam = updateExam;
const deleteExam = async (req, res) => {
    try {
        const { exam_id } = req.params;
        if (!(0, uuid_1.validate)(exam_id)) {
            return res.status(400).json((0, responseInterfaces_1.createErrorResponse)('Invalid exam ID format.'));
        }
        const examIdBuffer = Buffer.from((0, uuid_1.parse)(exam_id));
        const exam = await db_1.default.exams.findUnique({
            where: { id: examIdBuffer },
        });
        if (!exam) {
            return res.status(404).json((0, responseInterfaces_1.createErrorResponse)('Exam not found.'));
        }
        const attempts = await db_1.default.attempts.findMany({
            where: { exam_id: examIdBuffer },
            select: { id: true },
        });
        const attemptIds = attempts.map(a => a.id);
        await db_1.default.attempt_questions.deleteMany({
            where: { attempt_id: { in: attemptIds } },
        });
        await db_1.default.student_closed_answers.deleteMany({
            where: { attempt_id: { in: attemptIds } },
        });
        await db_1.default.student_open_answers.deleteMany({
            where: { attempt_id: { in: attemptIds } },
        });
        await db_1.default.closed_answers.deleteMany({
            where: { closed_question_id: { in: (await db_1.default.closed_questions.findMany({ where: { exam_id: examIdBuffer } })).map(cq => cq.id) } },
        });
        await db_1.default.closed_questions.deleteMany({
            where: { exam_id: examIdBuffer },
        });
        await db_1.default.open_answers.deleteMany({
            where: { open_question_id: { in: (await db_1.default.open_questions.findMany({ where: { exam_id: examIdBuffer } })).map(oq => oq.id) } },
        });
        await db_1.default.open_questions.deleteMany({
            where: { exam_id: examIdBuffer },
        });
        await db_1.default.grades_exams.deleteMany({
            where: { exam_id: examIdBuffer },
        });
        await db_1.default.files_repository.deleteMany({
            where: { exam_id: examIdBuffer },
        });
        await db_1.default.classes_exams.deleteMany({
            where: { exam_id: examIdBuffer },
        });
        await db_1.default.students_exams.deleteMany({
            where: { exam_id: examIdBuffer },
        });
        await db_1.default.attempts.deleteMany({
            where: { exam_id: examIdBuffer },
        });
        await db_1.default.exams.delete({
            where: { id: examIdBuffer },
        });
        return res.status(200).json((0, responseInterfaces_1.createSuccessResponse)(null, 'Exam deleted successfully.'));
    }
    catch (error) {
        console.error('Error deleting exam:', error);
        return res.status(500).json((0, responseInterfaces_1.createErrorResponse)('An unexpected error occurred while deleting the exam. Please try again later.'));
    }
};
exports.deleteExam = deleteExam;
const getGradebookExams = async (req, res) => {
    const user = req.user;
    const user_id = user?.userId;
    if (!user) {
        return res.status(401).json((0, responseInterfaces_1.createErrorResponse)('Unauthorized1'));
    }
    if (!user_id || typeof user_id !== 'string') {
        return res.status(400).json((0, responseInterfaces_1.createErrorResponse)('Invalid teacher ID.'));
    }
    try {
        const teacherIdBuffer = Buffer.from((0, uuid_1.parse)(user_id));
        const teacher = await db_1.default.teachers.findUnique({
            where: { id: teacherIdBuffer },
        });
        let gradebookExams = null;
        if (teacher) {
            gradebookExams = await db_1.default.gradebook_exams.findMany({
                where: {
                    lessons: {
                        teacher_id: teacherIdBuffer,
                    },
                },
                select: {
                    lesson_id: true,
                    topic: true,
                },
            });
        }
        else {
            gradebookExams = await db_1.default.gradebook_exams.findMany({
                select: {
                    lesson_id: true,
                    topic: true,
                },
            });
        }
        const formattedGradebookExams = gradebookExams.map(exam => ({
            lesson_id: (0, uuid_1.stringify)(exam.lesson_id),
            topic: exam.topic,
        }));
        return res.status(200).json((0, responseInterfaces_1.createSuccessResponse)(formattedGradebookExams, 'Gradebook exams retrieved successfully.'));
    }
    catch (error) {
        console.error('Error fetching gradebook exams:', error);
        return res.status(500).json((0, responseInterfaces_1.createErrorResponse)('Internal server error.'));
    }
};
exports.getGradebookExams = getGradebookExams;
const getExamParticipants = async (req, res) => {
    try {
        const { exam_id } = req.params;
        const user = req.user;
        if (!(0, uuid_1.validate)(exam_id)) {
            return res.status(400).json((0, responseInterfaces_1.createErrorResponse)('Invalid exam ID format.'));
        }
        if (!user) {
            return res.status(401).json((0, responseInterfaces_1.createErrorResponse)('Unauthorized.'));
        }
        const exam = await db_1.default.exams.findUnique({
            where: { id: Buffer.from((0, uuid_1.parse)(exam_id)) },
            include: {
                students_exams: {
                    include: {
                        students: true,
                    },
                },
                classes_exams: {
                    include: {
                        classes: {
                            include: {
                                class_names: {
                                    select: {
                                        name: true,
                                    },
                                },
                            }
                        },
                    },
                },
            },
        });
        if (!exam) {
            return res.status(404).json((0, responseInterfaces_1.createErrorResponse)('Exam not found.'));
        }
        const studentsParticipants = exam.students_exams.map((se) => {
            const student = se.students;
            return {
                id: (0, uuid_1.stringify)(student.id),
                first_name: student.first_name,
                last_name: student.last_name,
                class_id: student.class_id ? (0, uuid_1.stringify)(student.class_id) : null,
            };
        });
        const classesParticipants = exam.classes_exams.map((ce) => {
            const cls = ce.classes;
            return {
                id: (0, uuid_1.stringify)(cls.id),
                name: cls.class_names.name,
                teacher_id: cls.teacher_id ? (0, uuid_1.stringify)(cls.teacher_id) : null,
            };
        });
        const studentsParticipantsIds = studentsParticipants.map((sp) => sp.id);
        const classesParticipantsIds = classesParticipants.map((cp) => cp.id);
        if (user.role === userTypes_1.UserType.Administrator) {
            const classesRaw = await db_1.default.classes.findMany({
                include: {
                    class_names: {
                        select: {
                            name: true,
                        },
                    },
                }
            });
            const classes = classesRaw
                .map(cls => ({
                id: (0, uuid_1.stringify)(cls.id),
                name: cls.class_names.name,
                teacher_id: cls.teacher_id ? (0, uuid_1.stringify)(cls.teacher_id) : null,
            }))
                .filter(cls => !classesParticipantsIds.includes(cls.id));
            const studentsRaw = await db_1.default.students.findMany();
            const students = studentsRaw
                .map(student => ({
                id: (0, uuid_1.stringify)(student.id),
                first_name: student.first_name,
                last_name: student.last_name,
                class_id: student.class_id ? (0, uuid_1.stringify)(student.class_id) : null,
            }))
                .filter(student => !studentsParticipantsIds.includes(student.id));
            const responseData = {
                studentsParticipants,
                classesParticipants,
                students,
                classes,
            };
            return res.status(200).json((0, responseInterfaces_1.createSuccessResponse)(responseData, 'Exam participants retrieved successfully.'));
        }
        else if (user.role === userTypes_1.UserType.Teacher) {
            const teacher_id = user.userId;
            const teacherClassesRaw = await (0, classService_1.getClassesByTeacher)(teacher_id);
            const teacherClasses = teacherClassesRaw.map((cls) => ({
                id: cls.id,
                name: cls.name,
                yearbook: cls.yearbook,
                teacher_id: cls.teacher_id ? cls.teacher_id : null,
            }));
            const classes = teacherClasses.filter((cls) => !classesParticipantsIds.includes(cls.id));
            const teacherClassIdsBuffers = teacherClassesRaw.map((cls) => Buffer.from((0, uuid_1.parse)(cls.id)));
            const studentsInTeacherClassesRaw = await db_1.default.students.findMany({
                where: {
                    class_id: {
                        in: teacherClassIdsBuffers,
                    },
                },
            });
            const studentsInTeacherClasses = studentsInTeacherClassesRaw.map((student) => ({
                id: (0, uuid_1.stringify)(student.id),
                first_name: student.first_name,
                last_name: student.last_name,
                class_id: student.class_id ? (0, uuid_1.stringify)(student.class_id) : null,
            }));
            const students = studentsInTeacherClasses;
            // const classesParticipantsBuffers = classesParticipantsIds.map(classId => Buffer.from(uuidParse(classId)));
            // const students = studentsInTeacherClasses.filter((student) => {
            //   const isIndividuallyParticipating = studentsParticipantsIds.includes(student.id);
            //   let isParticipatingViaClass = false;
            //   if (student.class_id !== null) {
            //     const studentClassIdBuffer = Buffer.from(uuidParse(student.class_id));
            //     isParticipatingViaClass = classesParticipantsBuffers.some(classIdBuffer => classIdBuffer.equals(studentClassIdBuffer));
            //   }
            //   return !isIndividuallyParticipating && !isParticipatingViaClass;
            // });
            const responseData = {
                studentsParticipants,
                classesParticipants,
                students,
                classes,
            };
            return res.status(200).json((0, responseInterfaces_1.createSuccessResponse)(responseData, 'Exam participants retrieved successfully.'));
        }
    }
    catch (error) {
        console.error('Error fetching exam participants:', error);
        return res.status(500).json((0, responseInterfaces_1.createErrorResponse)('An unexpected error occurred while fetching the exam participants. Please try again later.'));
    }
};
exports.getExamParticipants = getExamParticipants;
const getExamParticipantsForNewExam = async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json((0, responseInterfaces_1.createErrorResponse)('Unauthorized.'));
        }
        if (user.role === userTypes_1.UserType.Administrator) {
            const classesRaw = await db_1.default.classes.findMany({
                include: {
                    class_names: {
                        select: {
                            name: true,
                        },
                    },
                }
            });
            const classes = classesRaw
                .map(cls => ({
                id: (0, uuid_1.stringify)(cls.id),
                name: cls.class_names.name,
                teacher_id: cls.teacher_id ? (0, uuid_1.stringify)(cls.teacher_id) : null,
            }));
            const studentsRaw = await db_1.default.students.findMany();
            const students = studentsRaw
                .map(student => ({
                id: (0, uuid_1.stringify)(student.id),
                first_name: student.first_name,
                last_name: student.last_name,
                class_id: student.class_id ? (0, uuid_1.stringify)(student.class_id) : null,
            }));
            const responseData = {
                students,
                classes,
            };
            return res.status(200).json((0, responseInterfaces_1.createSuccessResponse)(responseData, 'Exam participants retrieved successfully.'));
        }
        else if (user.role === userTypes_1.UserType.Teacher) {
            const teacher_id = user.userId;
            const teacherClassesRaw = await (0, classService_1.getClassesByTeacher)(teacher_id);
            const classes = teacherClassesRaw.map((cls) => ({
                id: cls.id,
                name: cls.name,
                yearbook: cls.yearbook,
                teacher_id: cls.teacher_id ? cls.teacher_id : null,
            }));
            const teacherClassIdsBuffers = teacherClassesRaw.map((cls) => Buffer.from((0, uuid_1.parse)(cls.id)));
            const studentsInTeacherClassesRaw = await db_1.default.students.findMany({
                where: {
                    class_id: {
                        in: teacherClassIdsBuffers,
                    },
                },
            });
            const students = studentsInTeacherClassesRaw.map((student) => ({
                id: (0, uuid_1.stringify)(student.id),
                first_name: student.first_name,
                last_name: student.last_name,
                class_id: student.class_id ? (0, uuid_1.stringify)(student.class_id) : null,
            }));
            const responseData = {
                students,
                classes,
            };
            return res.status(200).json((0, responseInterfaces_1.createSuccessResponse)(responseData, 'Exam participants retrieved successfully.'));
        }
        ;
    }
    catch (error) {
        console.error('Error fetching exam participants:', error);
        return res.status(500).json((0, responseInterfaces_1.createErrorResponse)('An unexpected error occurred while fetching the exam participants. Please try again later.'));
    }
};
exports.getExamParticipantsForNewExam = getExamParticipantsForNewExam;
const assignParticipantsToExam = async (req, res) => {
    try {
        const { exam_id } = req.params;
        const { classes, students } = req.body;
        let examIdBuffer;
        try {
            if (!(0, uuid_1.validate)(exam_id))
                throw new Error('Invalid UUID');
            const uuidBytes = (0, uuid_1.parse)(exam_id);
            examIdBuffer = Buffer.from(uuidBytes);
        }
        catch (e) {
            return res.status(400).json((0, responseInterfaces_1.createErrorResponse)('Invalid exam ID format.'));
        }
        const exam = await db_1.default.exams.findUnique({
            where: { id: examIdBuffer },
        });
        if (!exam) {
            return res.status(404).json((0, responseInterfaces_1.createErrorResponse)('Exam not found.'));
        }
        const alreadyAssignedClasses = await db_1.default.classes_exams.findMany({
            where: { exam_id: examIdBuffer },
            select: { class_id: true },
        });
        const alreadyAssignedClassIdBuffers = alreadyAssignedClasses.map(entry => entry.class_id);
        const assignedClassIdBuffers = [...alreadyAssignedClassIdBuffers];
        const operations = [];
        if (classes && Array.isArray(classes)) {
            for (const classId of classes) {
                let classIdBuffer;
                try {
                    if (!(0, uuid_1.validate)(classId))
                        throw new Error('Invalid UUID');
                    const uuidBytes = (0, uuid_1.parse)(classId);
                    classIdBuffer = Buffer.from(uuidBytes);
                }
                catch (e) {
                    return res.status(400).json((0, responseInterfaces_1.createErrorResponse)(`Invalid class ID format: ${classId}`));
                }
                const classExists = await db_1.default.classes.findUnique({
                    where: { id: classIdBuffer },
                });
                if (!classExists) {
                    return res.status(404).json((0, responseInterfaces_1.createErrorResponse)(`Class not found: ${classId}`));
                }
                const isAlreadyAssigned = alreadyAssignedClassIdBuffers.some(existingClassIdBuffer => existingClassIdBuffer.equals(classIdBuffer));
                if (!isAlreadyAssigned) {
                    operations.push(db_1.default.classes_exams.create({
                        data: {
                            class_id: classIdBuffer,
                            exam_id: examIdBuffer,
                        },
                    }));
                    assignedClassIdBuffers.push(classIdBuffer);
                }
            }
            if (assignedClassIdBuffers.length > 0) {
                const studentsInClasses = await db_1.default.students.findMany({
                    where: {
                        class_id: {
                            in: assignedClassIdBuffers,
                        },
                    },
                    select: {
                        id: true,
                    },
                });
                const studentIdsToRemove = studentsInClasses.map(student => student.id);
                if (studentIdsToRemove.length > 0) {
                    operations.push(db_1.default.students_exams.deleteMany({
                        where: {
                            students_id: {
                                in: studentIdsToRemove,
                            },
                            exam_id: examIdBuffer,
                        },
                    }));
                }
            }
        }
        if (students && Array.isArray(students)) {
            for (const studentId of students) {
                let studentIdBuffer;
                try {
                    if (!(0, uuid_1.validate)(studentId))
                        throw new Error('Invalid UUID');
                    const uuidBytes = (0, uuid_1.parse)(studentId);
                    studentIdBuffer = Buffer.from(uuidBytes);
                }
                catch (e) {
                    return res.status(400).json((0, responseInterfaces_1.createErrorResponse)(`Invalid student ID format: ${studentId}`));
                }
                const studentRecord = await db_1.default.students.findUnique({
                    where: { id: studentIdBuffer },
                    select: {
                        id: true,
                        class_id: true,
                    },
                });
                if (!studentRecord) {
                    return res.status(404).json((0, responseInterfaces_1.createErrorResponse)(`Student not found: ${studentId}`));
                }
                let isStudentInAssignedClass = false;
                if (studentRecord.class_id !== null) {
                    isStudentInAssignedClass = assignedClassIdBuffers.some(classIdBuffer => classIdBuffer.equals(studentRecord.class_id));
                }
                if (isStudentInAssignedClass) {
                    continue;
                }
                const existingStudentExam = await db_1.default.students_exams.findUnique({
                    where: {
                        students_id_exam_id: {
                            students_id: studentIdBuffer,
                            exam_id: examIdBuffer,
                        },
                    },
                });
                if (!existingStudentExam) {
                    operations.push(db_1.default.students_exams.create({
                        data: {
                            students_id: studentIdBuffer,
                            exam_id: examIdBuffer,
                        },
                    }));
                }
            }
        }
        if (operations.length > 0) {
            await db_1.default.$transaction(operations);
        }
        return res.status(200).json((0, responseInterfaces_1.createSuccessResponse)(null, 'Participants assigned to exam successfully.'));
    }
    catch (error) {
        console.error('Error assigning participants to exam:', error);
        return res.status(500).json((0, responseInterfaces_1.createErrorResponse)('An unexpected error occurred while assigning participants to the exam. Please try again later.'));
    }
};
exports.assignParticipantsToExam = assignParticipantsToExam;
const removeParticipantsFromExam = async (req, res) => {
    try {
        const { exam_id } = req.params;
        const { classes, students } = req.body;
        let examIdBuffer;
        try {
            if (!(0, uuid_1.validate)(exam_id))
                throw new Error('Invalid UUID');
            const uuidBytes = (0, uuid_1.parse)(exam_id);
            examIdBuffer = Buffer.from(uuidBytes);
        }
        catch (e) {
            return res.status(400).json((0, responseInterfaces_1.createErrorResponse)('Invalid exam ID format.'));
        }
        const exam = await db_1.default.exams.findUnique({
            where: { id: examIdBuffer },
        });
        if (!exam) {
            return res.status(404).json((0, responseInterfaces_1.createErrorResponse)('Exam not found.'));
        }
        const operations = [];
        if (classes && Array.isArray(classes)) {
            for (const classId of classes) {
                let classIdBuffer;
                try {
                    if (!(0, uuid_1.validate)(classId))
                        throw new Error('Invalid UUID');
                    const uuidBytes = (0, uuid_1.parse)(classId);
                    classIdBuffer = Buffer.from(uuidBytes);
                }
                catch (e) {
                    return res.status(400).json((0, responseInterfaces_1.createErrorResponse)(`Invalid class ID format: ${classId}`));
                }
                const classExists = await db_1.default.classes.findUnique({
                    where: { id: classIdBuffer },
                });
                if (!classExists) {
                    return res.status(404).json((0, responseInterfaces_1.createErrorResponse)(`Class not found: ${classId}`));
                }
                const existingClassExam = await db_1.default.classes_exams.findUnique({
                    where: {
                        class_id_exam_id: {
                            class_id: classIdBuffer,
                            exam_id: examIdBuffer,
                        },
                    },
                });
                if (existingClassExam) {
                    operations.push(db_1.default.classes_exams.delete({
                        where: {
                            class_id_exam_id: {
                                class_id: classIdBuffer,
                                exam_id: examIdBuffer,
                            },
                        },
                    }));
                }
            }
        }
        if (students && Array.isArray(students)) {
            for (const studentId of students) {
                let studentIdBuffer;
                try {
                    if (!(0, uuid_1.validate)(studentId))
                        throw new Error('Invalid UUID');
                    const uuidBytes = (0, uuid_1.parse)(studentId);
                    studentIdBuffer = Buffer.from(uuidBytes);
                }
                catch (e) {
                    return res.status(400).json((0, responseInterfaces_1.createErrorResponse)(`Invalid student ID format: ${studentId}`));
                }
                const studentExists = await db_1.default.students.findUnique({
                    where: { id: studentIdBuffer },
                });
                if (!studentExists) {
                    return res.status(404).json((0, responseInterfaces_1.createErrorResponse)(`Student not found: ${studentId}`));
                }
                const existingStudentExam = await db_1.default.students_exams.findUnique({
                    where: {
                        students_id_exam_id: {
                            students_id: studentIdBuffer,
                            exam_id: examIdBuffer,
                        },
                    },
                });
                if (existingStudentExam) {
                    operations.push(db_1.default.students_exams.delete({
                        where: {
                            students_id_exam_id: {
                                students_id: studentIdBuffer,
                                exam_id: examIdBuffer,
                            },
                        },
                    }));
                }
            }
        }
        if (operations.length > 0) {
            await db_1.default.$transaction(operations);
        }
        return res.status(200).json((0, responseInterfaces_1.createSuccessResponse)(null, 'Participants removed from exam successfully.'));
    }
    catch (error) {
        console.error('Error removing participants from exam:', error);
        return res.status(500).json((0, responseInterfaces_1.createErrorResponse)('An unexpected error occurred while removing participants from the exam. Please try again later.'));
    }
};
exports.removeParticipantsFromExam = removeParticipantsFromExam;
const getAllExamQuestions = async (req, res) => {
    try {
        const { exam_id } = req.params;
        if (!exam_id || !(0, uuid_1.validate)(exam_id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid exam ID format.',
            });
        }
        const examIdBuffer = Buffer.from((0, uuid_1.parse)(exam_id));
        const exam = await db_1.default.exams.findUnique({
            where: { id: examIdBuffer },
        });
        if (!exam) {
            return res.status(404).json({
                success: false,
                message: 'Exam not found.',
            });
        }
        const openQuestions = await db_1.default.open_questions.findMany({
            where: { exam_id: examIdBuffer },
            select: {
                id: true,
                description: true,
                score: true,
                auto_check: true,
                open_answers: {
                    select: {
                        id: true,
                        description: true,
                    },
                },
            },
        });
        const closedQuestions = await db_1.default.closed_questions.findMany({
            where: { exam_id: examIdBuffer },
            include: {
                closed_answers: {
                    select: {
                        id: true,
                        description: true,
                        is_correct: true,
                    },
                },
            },
        });
        const mappedOpenQuestions = openQuestions.map(q => ({
            id: (0, uuid_1.stringify)(q.id),
            description: q.description || '',
            type: 'OPEN',
            score: q.score,
            is_multiple: null,
            auto_check: q.auto_check || '',
            answers: q.open_answers.map(a => ({
                id: (0, uuid_1.stringify)(a.id),
                description: a.description || '',
            })),
        }));
        const mappedClosedQuestions = closedQuestions.map(q => ({
            id: (0, uuid_1.stringify)(q.id),
            description: q.description || '',
            type: 'CLOSED',
            score: q.score || undefined,
            is_multiple: q.is_multiple,
            answers: q.closed_answers.map(a => ({
                id: (0, uuid_1.stringify)(a.id),
                description: a.description || '',
                is_correct: a.is_correct,
            })),
        }));
        const allQuestions = [
            ...mappedOpenQuestions,
            ...mappedClosedQuestions
        ];
        return res.status(200).json({
            success: true,
            data: {
                exam_id: exam_id,
                title: exam.title,
                description: exam.description,
                questions: allQuestions,
            },
            message: 'All questions fetched successfully.',
        });
    }
    catch (error) {
        console.error('Error fetching exam questions:', error);
        return res.status(500).json({
            success: false,
            message: 'An unexpected error occurred while fetching the exam questions. Please try again later.',
        });
    }
};
exports.getAllExamQuestions = getAllExamQuestions;
