"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upsertQuestionsToExam = exports.addQuestionsToExam = void 0;
const db_1 = __importDefault(require("../db"));
const responseInterfaces_1 = require("../interfaces/responseInterfaces");
const uuid_1 = require("uuid");
const addQuestionsToExam = async (req, res) => {
    try {
        const exam_id = req.params.exam_id;
        const { open_questions, closed_questions } = req.body;
        if (!exam_id) {
            return res.status(400).json((0, responseInterfaces_1.createErrorResponse)('Exam ID is required.'));
        }
        let exam_id_buffer;
        try {
            exam_id_buffer = Buffer.from((0, uuid_1.parse)(exam_id));
        }
        catch (e) {
            return res.status(400).json((0, responseInterfaces_1.createErrorResponse)('Invalid exam ID format.'));
        }
        const exam = await db_1.default.exams.findUnique({
            where: {
                id: exam_id_buffer,
            },
        });
        if (!exam) {
            return res.status(404).json((0, responseInterfaces_1.createErrorResponse)('Exam not found.'));
        }
        await db_1.default.$transaction(async (prismaTransaction) => {
            if (open_questions && Array.isArray(open_questions) && open_questions.length > 0) {
                for (const openQuestion of open_questions) {
                    if (openQuestion.auto_check) {
                        if (!openQuestion.answers || !Array.isArray(openQuestion.answers) || openQuestion.answers.length === 0) {
                            throw new Error(`Open question "${openQuestion.description}" requires at least one answer because auto_check is enabled.`);
                        }
                    }
                    const newOpenQuestion = await prismaTransaction.open_questions.create({
                        data: {
                            exam_id: exam_id_buffer,
                            description: openQuestion.description,
                            score: openQuestion.score,
                            auto_check: openQuestion.auto_check,
                        },
                    });
                    if (openQuestion.auto_check && openQuestion.answers) {
                        for (const answer of openQuestion.answers) {
                            await prismaTransaction.open_answers.create({
                                data: {
                                    open_question_id: newOpenQuestion.id,
                                    description: answer.description,
                                },
                            });
                        }
                    }
                }
            }
            if (closed_questions && Array.isArray(closed_questions) && closed_questions.length > 0) {
                for (const closedQuestion of closed_questions) {
                    const newClosedQuestion = await prismaTransaction.closed_questions.create({
                        data: {
                            exam_id: exam_id_buffer,
                            description: closedQuestion.description,
                            is_multiple: closedQuestion.is_multiple,
                            score: closedQuestion.score,
                        },
                    });
                    if (closedQuestion.answers && Array.isArray(closedQuestion.answers) && closedQuestion.answers.length > 0) {
                        for (const answer of closedQuestion.answers) {
                            await prismaTransaction.closed_answers.create({
                                data: {
                                    closed_question_id: newClosedQuestion.id,
                                    description: answer.description,
                                    is_correct: answer.is_correct,
                                },
                            });
                        }
                    }
                }
            }
        });
        return res.status(200).json((0, responseInterfaces_1.createSuccessResponse)(null, 'Questions added successfully.'));
    }
    catch (err) {
        console.error('Error adding questions to exam', err);
        if (err.message && err.message.includes('requires at least one answer')) {
            return res.status(400).json((0, responseInterfaces_1.createErrorResponse)(err.message));
        }
        res.status(500).json((0, responseInterfaces_1.createErrorResponse)('An unexpected error occurred while adding questions to the exam. Please try again later.'));
    }
};
exports.addQuestionsToExam = addQuestionsToExam;
const removeUnusedQuestions = async (exam_id_buffer, open_questions, closed_questions, prismaTransaction) => {
    const providedOpenIds = open_questions?.map((q) => q.id || '') || [];
    const existingOpenIds = (await prismaTransaction.open_questions.findMany({
        where: { exam_id: exam_id_buffer },
        select: { id: true },
    })).map((q) => q.id);
    const providedOpenIdsBuffers = providedOpenIds
        .filter(id => id)
        .map(id => Buffer.from((0, uuid_1.parse)(id)));
    const openIdsToDelete = existingOpenIds.filter(existingId => !providedOpenIdsBuffers.some(providedId => providedId.equals(existingId)));
    if (openIdsToDelete.length > 0) {
        console.log("openIdsToDelete:", openIdsToDelete);
        // Find all `open_answer_id`s linked to `openIdsToDelete` for debugging
        const existingOpenAnswerIds = (await prismaTransaction.attempt_questions.findMany({
            where: { open_question_id: { in: openIdsToDelete } },
            select: { id: true },
        })).map((ans) => ans.id);
        // Log the open answers to ensure they are identified
        console.log("Existing open answer IDs:", existingOpenAnswerIds);
        // Delete `attempt_questions` records linked to `open_question_id`
        await prismaTransaction.attempt_questions.deleteMany({
            where: { open_question_id: { in: openIdsToDelete } },
        });
        console.log("Deleted attempt_questions.");
        // Delete `open_answers` linked to `open_question_id`
        await prismaTransaction.open_answers.deleteMany({
            where: { open_question_id: { in: openIdsToDelete } },
        });
        console.log("Deleted open_answers.");
        // Delete `open_questions`
        await prismaTransaction.open_questions.deleteMany({
            where: { id: { in: openIdsToDelete } },
        });
        console.log("Deleted open_questions.");
    }
    const providedClosedIds = closed_questions?.map((q) => q.id || '') || [];
    const existingClosedIds = (await prismaTransaction.closed_questions.findMany({
        where: { exam_id: exam_id_buffer },
        select: { id: true },
    })).map((q) => q.id);
    const providedClosedIdsBuffers = providedClosedIds
        .filter(id => id)
        .map(id => Buffer.from((0, uuid_1.parse)(id)));
    const closedIdsToDelete = existingClosedIds.filter(existingId => !providedClosedIdsBuffers.some(providedId => providedId.equals(existingId)));
    if (closedIdsToDelete.length > 0) {
        const existingAnswerIds = (await prismaTransaction.closed_answers.findMany({
            where: { closed_question_id: { in: closedIdsToDelete } },
            select: { id: true },
        })).map((ans) => ans.id);
        await prismaTransaction.student_closed_answers.deleteMany({
            where: { closed_answer_id: { in: existingAnswerIds } },
        });
        await prismaTransaction.closed_answers.deleteMany({
            where: { closed_question_id: { in: closedIdsToDelete } },
        });
        await prismaTransaction.attempt_questions.deleteMany({
            where: { closed_question_id: { in: closedIdsToDelete } },
        });
        await prismaTransaction.closed_questions.deleteMany({
            where: { id: { in: closedIdsToDelete } },
        });
    }
};
const upsertQuestions = async (exam_id_buffer, open_questions, closed_questions, prismaTransaction) => {
    const processOpenQuestion = async (q) => {
        const { id, description, score, auto_check, answers } = q;
        const questionData = { description, score, auto_check };
        console.log(q.description);
        console.log(q.answers);
        let questionId;
        if (id) {
            const qId = Buffer.from((0, uuid_1.parse)(id));
            const existing = await prismaTransaction.open_questions.findUnique({
                where: { id: qId },
            });
            if (existing) {
                await prismaTransaction.open_questions.update({
                    where: { id: qId },
                    data: questionData,
                });
                questionId = qId;
            }
            else {
                questionId = Buffer.from((0, uuid_1.parse)((0, uuid_1.v4)()));
                await prismaTransaction.open_questions.create({
                    data: {
                        id: questionId,
                        exam_id: exam_id_buffer,
                        ...questionData,
                    },
                });
            }
        }
        else {
            questionId = Buffer.from((0, uuid_1.parse)((0, uuid_1.v4)()));
            await prismaTransaction.open_questions.create({
                data: {
                    id: questionId,
                    exam_id: exam_id_buffer,
                    ...questionData,
                },
            });
        }
        if (auto_check && (!answers || answers.length === 0)) {
            throw new Error(`Open question "${description}" requires at least one answer because auto_check is enabled.`);
        }
        await prismaTransaction.open_answers.deleteMany({
            where: { open_question_id: questionId },
        });
        if (answers && answers.length > 0) {
            const newAnswers = answers.map((ans) => {
                if (ans.id) {
                    throw new Error(`Invalid UUID format for open answer ID: ${ans.id}`);
                }
                return {
                    id: ans.id ? Buffer.from((0, uuid_1.parse)(ans.id)) : Buffer.from((0, uuid_1.parse)((0, uuid_1.v4)())),
                    open_question_id: questionId,
                    description: ans.description,
                };
            });
            await prismaTransaction.open_answers.createMany({
                data: newAnswers,
            });
        }
    };
    const processClosedQuestion = async (q) => {
        const { id, description, is_multiple, score, answers } = q;
        const questionData = { description, is_multiple, score };
        let questionId;
        if (id) {
            const qId = Buffer.from((0, uuid_1.parse)(id));
            const existing = await prismaTransaction.closed_questions.findUnique({
                where: { id: qId },
            });
            if (existing) {
                await prismaTransaction.closed_questions.update({
                    where: { id: qId },
                    data: questionData,
                });
                questionId = qId;
            }
            else {
                questionId = Buffer.from((0, uuid_1.parse)((0, uuid_1.v4)()));
                await prismaTransaction.closed_questions.create({
                    data: {
                        id: questionId,
                        exam_id: exam_id_buffer,
                        ...questionData,
                    },
                });
            }
        }
        else {
            questionId = Buffer.from((0, uuid_1.parse)((0, uuid_1.v4)()));
            await prismaTransaction.closed_questions.create({
                data: {
                    id: questionId,
                    exam_id: exam_id_buffer,
                    ...questionData,
                },
            });
        }
        if (!answers || answers.length === 0) {
            throw new Error(`Closed question "${description}" requires at least one answer.`);
        }
        await prismaTransaction.closed_answers.deleteMany({
            where: { closed_question_id: questionId },
        });
        const newAnswers = answers.map((ans) => {
            return {
                closed_question_id: questionId,
                description: ans.description,
                is_correct: ans.is_correct,
            };
        });
        await prismaTransaction.closed_answers.createMany({
            data: newAnswers,
        });
    };
    if (open_questions && Array.isArray(open_questions)) {
        for (const q of open_questions) {
            await processOpenQuestion(q);
        }
    }
    if (closed_questions && Array.isArray(closed_questions)) {
        for (const q of closed_questions) {
            await processClosedQuestion(q);
        }
    }
};
const upsertQuestionsToExam = async (req, res) => {
    try {
        const exam_id = req.params.exam_id;
        const { open_questions, closed_questions } = req.body;
        if (!exam_id) {
            return res.status(400).json({ success: false, message: 'Exam ID is required.' });
        }
        const exam_id_buffer = Buffer.from((0, uuid_1.parse)(exam_id));
        const exam = await db_1.default.exams.findUnique({
            where: {
                id: exam_id_buffer,
            },
        });
        if (!exam) {
            return res.status(404).json({ success: false, message: 'Exam not found.' });
        }
        await db_1.default.$transaction(async (prismaTransaction) => {
            await removeUnusedQuestions(exam_id_buffer, open_questions, closed_questions, prismaTransaction);
            await upsertQuestions(exam_id_buffer, open_questions, closed_questions, prismaTransaction);
        });
        return res.status(200).json((0, responseInterfaces_1.createSuccessResponse)(null, 'Questions upserted successfully.'));
    }
    catch (err) {
        console.error('Error upserting questions to exam', err);
        if (err.message && err.message.includes('requires at least one answer')) {
            return res.status(400).json({ success: false, message: err.message });
        }
        return res.status(500).json({ success: false, message: 'An unexpected error occurred while upserting questions to the exam. Please try again later.' });
    }
};
exports.upsertQuestionsToExam = upsertQuestionsToExam;
