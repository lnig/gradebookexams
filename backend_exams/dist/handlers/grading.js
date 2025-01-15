"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.gradeExam = exports.checkExamState = exports.getExamResults = exports.gradeOpenAnswers = exports.getAllAttemptsToGrade = exports.showAllOpenAnswersToGrade = exports.showOpenAnswersToGrade = void 0;
const db_1 = __importDefault(require("../db"));
const responseInterfaces_1 = require("../interfaces/responseInterfaces");
const uuid_1 = require("uuid");
const gradingService_1 = require("../services/gradingService");
const statisticsService_1 = require("../services/statisticsService");
const showOpenAnswersToGrade = async (req, res) => {
    const { attempt_id } = req.params;
    if (!(0, uuid_1.validate)(attempt_id)) {
        return res.status(400).json({ error: 'Invalid attempt ID format.' });
    }
    try {
        const attemptIdBuffer = Buffer.from((0, uuid_1.parse)(attempt_id));
        const attempt = await db_1.default.attempts.findUnique({
            where: { id: attemptIdBuffer },
            include: { students: true },
        });
        const number_of_attempt = attempt?.attempt_number;
        if (!attempt) {
            return res.status(404).json({ error: 'Attempt not found.' });
        }
        const exam = await db_1.default.exams.findUnique({
            where: { id: attempt.exam_id },
        });
        if (!exam) {
            return res.status(404).json({ error: 'Exam from attempt not found.' });
        }
        const exam_title = exam.title;
        const exam_id = (0, uuid_1.stringify)(exam.id);
        const studentOpenAnswers = await db_1.default.student_open_answers.findMany({
            where: {
                attempt_id: attemptIdBuffer,
                score: null,
            },
            include: {
                open_questions: {},
                attempts: {},
            },
        });
        const student = attempt.students;
        const openQuestionsToGrade = studentOpenAnswers.map(answer => ({
            student_open_answer_id: (0, uuid_1.stringify)(answer.id),
            open_question_id: (0, uuid_1.stringify)(answer.open_question_id),
            question_description: answer.open_questions.description,
            student_description: answer.description,
            student_score: answer.score,
            max_score: answer.open_questions.score,
            date_time: answer.date_time,
        }));
        const responsePayload = {
            number_of_attempt,
            attempt_id,
            exam_id,
            first_name: student.first_name,
            last_name: student.last_name,
            exam_title,
            open_questions_to_grade: openQuestionsToGrade,
        };
        return res.status(200).json((0, responseInterfaces_1.createSuccessResponse)(responsePayload, 'Students to grade fetched successfully.'));
    }
    catch (error) {
        console.error('Error fetching open questions to grade:', error);
        return res.status(500).json({ error: 'An unexpected error occurred.' });
    }
};
exports.showOpenAnswersToGrade = showOpenAnswersToGrade;
const showAllOpenAnswersToGrade = async (req, res) => {
    const { exam_id } = req.params;
    if (!(0, uuid_1.validate)(exam_id)) {
        return res.status(400).json((0, responseInterfaces_1.createErrorResponse)('Invalid exam ID format.'));
    }
    try {
        const examIdBuffer = Buffer.from((0, uuid_1.parse)(exam_id));
        const exam = await db_1.default.exams.findUnique({
            where: { id: examIdBuffer },
            select: {
                title: true,
                id: true,
            },
        });
        if (!exam) {
            return res.status(404).json((0, responseInterfaces_1.createErrorResponse)('Exam not found.'));
        }
        const attempts = await db_1.default.attempts.findMany({
            where: { exam_id: examIdBuffer },
            select: { id: true, attempt_number: true },
        });
        const attemptIds = attempts.map(attempt => attempt.id);
        if (attemptIds.length === 0) {
            return res.status(200).json((0, responseInterfaces_1.createSuccessResponse)({
                exam_id,
                exam_name: exam.title,
                open_questions_to_grade: [],
            }, 'No attempts found for this exam.'));
        }
        const studentOpenAnswers = await db_1.default.student_open_answers.findMany({
            where: {
                attempt_id: {
                    in: attemptIds,
                },
                score: null,
            },
            include: {
                open_questions: {
                    select: {
                        description: true,
                        score: true,
                    },
                },
                students: {
                    select: {
                        first_name: true,
                        last_name: true,
                    },
                },
                attempts: {
                    select: {
                        id: true,
                        attempt_number: true,
                    },
                },
            },
        });
        if (studentOpenAnswers.length === 0) {
            return res.status(200).json((0, responseInterfaces_1.createSuccessResponse)({
                exam_id,
                exam_name: exam.title,
                open_questions_to_grade: [],
            }, 'No open answers to grade found for this exam.'));
        }
        const studentsMap = new Map();
        studentOpenAnswers.forEach(answer => {
            const studentKey = `${answer.students.first_name} ${answer.students.last_name}`;
            if (!studentsMap.has(studentKey)) {
                studentsMap.set(studentKey, {
                    firstName: answer.students.first_name,
                    lastName: answer.students.last_name,
                    questions: [],
                });
            }
            const question = {
                student_open_answer_id: (0, uuid_1.stringify)(answer.id),
                question_description: answer.open_questions.description || '',
                student_description: answer.description || '',
                attempt_number: answer.attempts.attempt_number,
                student_score: answer.score,
                max_score: answer.open_questions.score,
            };
            studentsMap.get(studentKey)?.questions.push(question);
        });
        const openQuestionsToGrade = Array.from(studentsMap.values());
        const response = {
            exam_id,
            exam_name: exam.title,
            open_questions_to_grade: openQuestionsToGrade,
        };
        return res.status(200).json((0, responseInterfaces_1.createSuccessResponse)(response, 'Open answers to grade fetched successfully.'));
    }
    catch (error) {
        console.error('Error fetching all open questions to grade:', error);
        return res.status(500).json((0, responseInterfaces_1.createErrorResponse)('An unexpected error occurred.'));
    }
};
exports.showAllOpenAnswersToGrade = showAllOpenAnswersToGrade;
const getAllAttemptsToGrade = async (req, res) => {
    const { exam_id } = req.params;
    if (!(0, uuid_1.validate)(exam_id)) {
        return res.status(400).json((0, responseInterfaces_1.createErrorResponse)('Invalid exam ID format.'));
    }
    const examIdBuffer = Buffer.from((0, uuid_1.parse)(exam_id));
    try {
        const exam = await db_1.default.exams.findUnique({
            where: { id: examIdBuffer },
            select: {
                title: true,
                id: true,
            },
        });
        if (!exam) {
            return res.status(404).json((0, responseInterfaces_1.createErrorResponse)('Exam not found.'));
        }
        const attempts = await db_1.default.attempts.findMany({
            where: { exam_id: examIdBuffer },
            select: { id: true, end_time: true, total_score: true, max_score: true, student_id: true },
        });
        const attemptIds = attempts.map(attempt => attempt.id);
        if (attemptIds.length === 0) {
            return res.status(200).json((0, responseInterfaces_1.createSuccessResponse)({
                exam_id,
                exam_name: exam.title,
                students_to_grade: [],
            }, 'No attempts found for this exam.'));
        }
        const openAnswers = await db_1.default.student_open_answers.findMany({
            where: {
                attempt_id: { in: attemptIds },
                score: null,
            },
            select: {
                id: true,
                attempt_id: true,
                description: true,
                open_questions: {
                    select: {
                        description: true,
                        score: true,
                    },
                },
                students: {
                    select: {
                        first_name: true,
                        last_name: true,
                    },
                },
                attempts: {
                    select: {
                        end_time: true,
                        total_score: true,
                        max_score: true,
                    },
                },
            },
        });
        if (openAnswers.length === 0) {
            return res.status(200).json((0, responseInterfaces_1.createSuccessResponse)({
                exam_id,
                exam_name: exam.title,
                students_to_grade: [],
            }, 'No open answers to grade found for this exam.'));
        }
        const attemptsMap = new Map();
        openAnswers.forEach(answer => {
            const attemptId = (0, uuid_1.stringify)(answer.attempt_id);
            if (!attemptsMap.has(attemptId)) {
                const attempt = attempts.find(attempt => (0, uuid_1.stringify)(attempt.id) === attemptId);
                if (attempt) {
                    const attemptIndex = attempts.findIndex(a => a.id === attempt.id) + 1;
                    attemptsMap.set(attemptId, {
                        attemptId: attemptId,
                        attemptNumber: `${attemptIndex}`,
                        end_time: attempt.end_time ? new Date(attempt.end_time).toISOString() : undefined,
                        firstName: answer.students.first_name,
                        lastName: answer.students.last_name,
                        total_score: attempt.total_score ?? undefined,
                        max_score: attempt.max_score ?? undefined,
                    });
                }
            }
        });
        const attemptsToGrade = Array.from(attemptsMap.values());
        const responsePayload = {
            exam_id,
            exam_name: exam.title,
            exam_title: 'abc',
            students_to_grade: attemptsToGrade,
        };
        return res.status(200).json((0, responseInterfaces_1.createSuccessResponse)(responsePayload, 'Students to grade fetched successfully.'));
    }
    catch (error) {
        console.error('Error fetching students to grade:', error);
        return res.status(500).json((0, responseInterfaces_1.createErrorResponse)('An unexpected error occurred.'));
    }
};
exports.getAllAttemptsToGrade = getAllAttemptsToGrade;
const gradeOpenAnswers = async (req, res) => {
    const grades = req.body;
    if (!Array.isArray(grades) || grades.length === 0) {
        return res.status(400).json({ error: 'Request body must be a non-empty array of grade objects.' });
    }
    try {
        for (const grade of grades) {
            if (!grade.student_open_answer_id || !(0, uuid_1.validate)(grade.student_open_answer_id)) {
                return res.status(400).json({ error: `Invalid or missing student_open_answer_id: ${grade.student_open_answer_id}` });
            }
            if (typeof grade.score !== 'number' || grade.score < 0) {
                return res.status(400).json({ error: `Invalid score for student_open_answer_id ${grade.student_open_answer_id}. Score must be a non-negative number.` });
            }
        }
        const gradeData = grades.map(grade => ({
            student_open_answer_id: Buffer.from((0, uuid_1.parse)(grade.student_open_answer_id)),
            score: grade.score
        }));
        const attemptsToCheck = new Set();
        const gradingService = new gradingService_1.GradingService();
        await db_1.default.$transaction(async (prismaTransaction) => {
            for (const grade of gradeData) {
                const studentOpenAnswer = await prismaTransaction.student_open_answers.findUnique({
                    where: { id: grade.student_open_answer_id },
                    include: {
                        open_questions: true,
                        attempts: true,
                    },
                });
                if (!studentOpenAnswer) {
                    throw new Error(`Student open answer not found for ID: ${(0, uuid_1.stringify)(grade.student_open_answer_id)}`);
                }
                const maxScore = studentOpenAnswer.open_questions.score;
                if (grade.score > maxScore) {
                    throw new Error(`Score for student open answer ID ${(0, uuid_1.stringify)(grade.student_open_answer_id)} exceeds maximum allowed score of ${maxScore}.`);
                }
                await prismaTransaction.student_open_answers.update({
                    where: { id: grade.student_open_answer_id },
                    data: {
                        score: grade.score
                    },
                });
                const attemptId = (0, uuid_1.stringify)(studentOpenAnswer.attempt_id);
                attemptsToCheck.add(attemptId);
                const totalScoreResult = await prismaTransaction.student_open_answers.aggregate({
                    where: {
                        attempt_id: studentOpenAnswer.attempt_id,
                        open_questions: {
                            auto_check: false,
                        }
                    },
                    _sum: { score: true },
                });
                const openQuestionScore = totalScoreResult._sum.score || 0;
                const currentScore = studentOpenAnswer.attempts.total_score || 0;
                await prismaTransaction.attempts.update({
                    where: { id: studentOpenAnswer.attempt_id },
                    data: {
                        total_score: openQuestionScore + currentScore,
                    },
                });
            }
            for (const attemptId of attemptsToCheck) {
                const ungradedOpenAnswers = await prismaTransaction.student_open_answers.findFirst({
                    where: {
                        attempt_id: Buffer.from((0, uuid_1.parse)(attemptId)),
                        score: null,
                    },
                });
                if (!ungradedOpenAnswers) {
                    await prismaTransaction.attempts.update({
                        where: { id: Buffer.from((0, uuid_1.parse)(attemptId)) },
                        data: {
                            graded: true,
                        },
                    });
                }
            }
        });
        return res.status(200).json({ message: 'Open answers graded successfully.' });
    }
    catch (error) {
        console.error('Error grading open answers:', error);
        return res.status(500).json({ error: 'An unexpected error occurred while grading open answers.' });
    }
};
exports.gradeOpenAnswers = gradeOpenAnswers;
const getExamResults = async (req, res) => {
    try {
        const { exam_id } = req.params;
        if (!exam_id || !(0, uuid_1.validate)(exam_id)) {
            return res.status(400).json((0, responseInterfaces_1.createErrorResponse)('Invalid exam ID format.'));
        }
        const examIdBuffer = Buffer.from((0, uuid_1.parse)(exam_id));
        const examExists = await db_1.default.exams.findUnique({
            where: { id: examIdBuffer },
        });
        if (!examExists) {
            return res.status(404).json((0, responseInterfaces_1.createErrorResponse)('Exam not found.'));
        }
        const attempts = await db_1.default.attempts.findMany({
            where: {
                exam_id: examIdBuffer,
                student_open_answers: {
                    some: {},
                },
            },
            select: {
                id: true,
                student_id: true,
                attempt_number: true,
                total_score: true,
                max_score: true,
                start_time: true,
                end_time: true,
                students: {
                    select: {
                        first_name: true,
                        last_name: true,
                    },
                },
            },
        });
        const formattedStudents = [];
        const attemptsByStudent = {};
        attempts.forEach(attempt => {
            if (!attemptsByStudent[(0, uuid_1.stringify)(attempt.student_id)]) {
                attemptsByStudent[(0, uuid_1.stringify)(attempt.student_id)] = [];
            }
            attemptsByStudent[(0, uuid_1.stringify)(attempt.student_id)].push(attempt);
        });
        for (const studentId in attemptsByStudent) {
            const studentAttempts = attemptsByStudent[studentId];
            let selectedAttempt;
            if (examExists.best_attempt_counts) {
                selectedAttempt = studentAttempts.reduce((prev, current) => {
                    return (prev.total_score || 0) > (current.total_score || 0) ? prev : current;
                }, studentAttempts[0]);
            }
            else {
                selectedAttempt = studentAttempts.reduce((prev, current) => {
                    return (prev.end_time || new Date(0)) > (current.end_time || new Date(0)) ? prev : current;
                }, studentAttempts[0]);
            }
            formattedStudents.push({
                attempt_id: (0, uuid_1.stringify)(selectedAttempt.id),
                attempt_number: selectedAttempt.attempt_number,
                start_time: selectedAttempt.start_time.toISOString(),
                end_time: selectedAttempt.end_time?.toISOString(),
                first_name: selectedAttempt.students.first_name,
                last_name: selectedAttempt.students.last_name,
                total_score: selectedAttempt.total_score ?? undefined,
                max_score: selectedAttempt.max_score ?? 0,
            });
        }
        const closedQuestionsStatistics = await (0, statisticsService_1.getClosedQuestionsStatistics)(examIdBuffer);
        const openQuestionsStatistics = await (0, statisticsService_1.getOpenQuestionsStatistics)(examIdBuffer);
        const scoreDistribution = await (0, statisticsService_1.calculateScoreDistribution)(formattedStudents);
        const examStatistics = {
            exam_title: examExists.title,
            Students: formattedStudents,
            Statistics: {
                closedQuestions: closedQuestionsStatistics,
                openQuestions: openQuestionsStatistics,
                scoreDistribution,
            },
        };
        return res.status(200).json((0, responseInterfaces_1.createSuccessResponse)(examStatistics, 'Participants and statistics fetched successfully.'));
    }
    catch (error) {
        console.error('Error fetching exam participants attempts and statistics:', error);
        return res.status(500).json((0, responseInterfaces_1.createErrorResponse)('An unexpected error occurred while fetching exam participants attempts and statistics.'));
    }
};
exports.getExamResults = getExamResults;
const checkExamState = async (req, res) => {
    const { exam_id } = req.params;
    try {
        const examIdBuffer = Buffer.from((0, uuid_1.parse)(exam_id));
        const exam = await db_1.default.exams.findUnique({
            where: { id: examIdBuffer },
        });
        if (!exam) {
            return res.status(404).json({ message: 'Exam not found.' });
        }
        const currentTime = new Date();
        if (exam.end_date_time > currentTime) {
            return res.status(200).json({ message: 'The exam has not yet ended.' });
        }
        const ungradedAttempts = await db_1.default.attempts.findMany({
            where: {
                exam_id: examIdBuffer,
                graded: false,
            },
            select: {
                id: true,
                student_id: true,
            },
        });
        if (ungradedAttempts.length > 0) {
            return res.status(200).json({ message: 'Some open questions are awaiting grading.' });
        }
        const allStudents = await db_1.default.attempts.findMany({
            where: { exam_id: examIdBuffer },
            select: { student_id: true },
            distinct: ['student_id'],
        });
        const totalStudents = allStudents.length;
        const gradedStudents = await db_1.default.grades_exams.findMany({
            where: { exam_id: examIdBuffer },
            select: { student_id: true },
            distinct: ['student_id'],
        });
        const totalGradedStudents = gradedStudents.length;
        if (totalGradedStudents === totalStudents && totalStudents > 0) {
            return res.status(200).json({ message: 'All students have been graded.' });
        }
        else {
            return res.status(200).json({ message: 'The exam can be graded.' });
        }
    }
    catch (error) {
        console.error('Error checking grading status:', error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
};
exports.checkExamState = checkExamState;
const gradeExam = async (req, res) => {
    const { exam_id } = req.params;
    const { mode } = req.body;
    if (!(0, uuid_1.validate)(exam_id)) {
        return res.status(400).json({ error: 'Invalid exam_id format.' });
    }
    if (mode !== 'grade' && mode !== 'regrade') {
        return res.status(400).json({ error: 'Invalid mode. Expected "grade" or "regrade".' });
    }
    try {
        const examIdBuffer = Buffer.from((0, uuid_1.parse)(exam_id));
        const exam = await db_1.default.exams.findUnique({
            where: { id: examIdBuffer },
        });
        if (!exam) {
            return res.status(404).json({ error: 'Exam not found.' });
        }
        const gradingScales = await db_1.default.grading_scale.findMany({
            orderBy: { min_score: 'asc' },
        });
        if (gradingScales.length === 0) {
            return res.status(400).json({ error: 'Grading scale is not defined.' });
        }
        const attempts = await db_1.default.attempts.findMany({
            where: { exam_id: examIdBuffer },
            include: { students: true },
        });
        if (attempts.length === 0) {
            return res.status(400).json({ error: 'No attempts found for this exam.' });
        }
        const existingGrades = await db_1.default.grades_exams.findMany({
            where: { exam_id: examIdBuffer },
            include: { students: true },
        });
        const studentGradesMap = new Map();
        existingGrades.forEach(grade => {
            const studentIdHex = grade.student_id.toString('hex');
            studentGradesMap.set(studentIdHex, grade);
        });
        const attemptsByStudent = attempts.reduce((acc, attempt) => {
            const studentId = attempt.student_id.toString('hex');
            if (!acc[studentId]) {
                acc[studentId] = [];
            }
            acc[studentId].push(attempt);
            return acc;
        }, {});
        const gradesToInsert = [];
        const gradesToUpdate = [];
        for (const [studentIdHex, studentAttempts] of Object.entries(attemptsByStudent)) {
            const studentIdBuffer = Buffer.from(studentIdHex, 'hex');
            let selectedAttempt = null;
            if (exam.best_attempt_counts) {
                selectedAttempt = studentAttempts.reduce((best, current) => {
                    if (current.total_score === null)
                        return best;
                    if (!best || current.total_score > (best.total_score || 0)) {
                        return current;
                    }
                    return best;
                }, null);
            }
            else if (exam.latest_attempt_counts) {
                selectedAttempt = studentAttempts.reduce((latest, current) => {
                    if (!latest || current.attempt_number > latest.attempt_number) {
                        return current;
                    }
                    return latest;
                }, null);
            }
            else {
                selectedAttempt = studentAttempts.reduce((latest, current) => {
                    if (!latest || current.attempt_number > latest.attempt_number) {
                        return current;
                    }
                    return latest;
                }, null);
            }
            if (!selectedAttempt) {
                continue;
            }
            const totalScore = selectedAttempt.total_score != null && selectedAttempt.max_score != null
                ? (selectedAttempt.total_score * 100) / selectedAttempt.max_score
                : 0;
            const gradingScale = gradingScales.find(scale => totalScore >= scale.min_score && totalScore <= scale.max_score);
            if (!gradingScale) {
                continue;
            }
            const expectedGrade = gradingScale.grades;
            if (mode === 'grade') {
                if (!studentGradesMap.has(studentIdHex)) {
                    gradesToInsert.push({
                        id: Buffer.from((0, uuid_1.parse)((0, uuid_1.v4)())),
                        student_id: studentIdBuffer,
                        attempt_id: selectedAttempt.id,
                        exam_id: examIdBuffer,
                        grade: expectedGrade,
                        description: "Results from exam: " + exam.title,
                    });
                }
            }
            else if (mode === 'regrade') {
                if (!studentGradesMap.has(studentIdHex)) {
                    gradesToInsert.push({
                        id: Buffer.from((0, uuid_1.parse)((0, uuid_1.v4)())),
                        student_id: studentIdBuffer,
                        attempt_id: selectedAttempt.id,
                        exam_id: examIdBuffer,
                        grade: expectedGrade,
                        description: "Results from exam: " + exam.title,
                    });
                }
                else {
                    const existingGrade = studentGradesMap.get(studentIdHex);
                    if (existingGrade.grade !== expectedGrade) {
                        gradesToUpdate.push({
                            existingGrade,
                            newGrade: expectedGrade,
                        });
                    }
                }
            }
        }
        const transactionOperations = [];
        gradesToInsert.forEach(gradeEntry => {
            transactionOperations.push(db_1.default.grades_exams.create({
                data: {
                    id: gradeEntry.id,
                    student_id: gradeEntry.student_id,
                    attempt_id: gradeEntry.attempt_id,
                    exam_id: gradeEntry.exam_id,
                    grade: gradeEntry.grade,
                    description: gradeEntry.description || '',
                },
            }));
            transactionOperations.push(db_1.default.notifications.create({
                data: {
                    id: Buffer.from((0, uuid_1.parse)((0, uuid_1.v4)())),
                    student_id: gradeEntry.student_id,
                    description: `You have been graded on exam '${exam.title}'.`,
                    exam_id: examIdBuffer,
                },
            }));
        });
        gradesToUpdate.forEach(({ existingGrade, newGrade }) => {
            transactionOperations.push(db_1.default.grades_exams.update({
                where: { id: existingGrade.id },
                data: { grade: newGrade },
            }));
            transactionOperations.push(db_1.default.notifications.create({
                data: {
                    id: Buffer.from((0, uuid_1.parse)((0, uuid_1.v4)())),
                    student_id: existingGrade.student_id,
                    description: `You have been regraded on exam '${exam.title}'.`,
                    exam_id: examIdBuffer,
                },
            }));
        });
        if (transactionOperations.length === 0) {
            if (mode === 'grade') {
                return res.status(200).json({ message: 'All students have already been graded.' });
            }
            else if (mode === 'regrade') {
                return res.status(200).json({ message: 'All student grades are up-to-date.' });
            }
        }
        await db_1.default.$transaction(transactionOperations);
        if (mode === 'grade') {
            return res.status(200).json({ message: 'Grades have been successfully recorded and notifications sent.' });
        }
        else if (mode === 'regrade') {
            return res.status(200).json({ message: 'Grades have been successfully regraded and notifications sent.' });
        }
    }
    catch (error) {
        console.error('Error grading exam:', error);
        return res.status(500).json({ error: 'Internal server error.' });
    }
};
exports.gradeExam = gradeExam;
