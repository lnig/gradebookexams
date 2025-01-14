"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GradingService = void 0;
const db_1 = __importDefault(require("../db"));
const uuid_1 = require("uuid");
class GradingService {
    async gradeClosedAnswers(closedAnswers) {
        let totalScore = 0;
        if (closedAnswers.length === 0)
            return totalScore;
        const groupedAnswers = {};
        closedAnswers.forEach(answer => {
            if (!groupedAnswers[answer.closed_question_id]) {
                groupedAnswers[answer.closed_question_id] = [];
            }
            groupedAnswers[answer.closed_question_id].push(answer.closed_answer_id);
        });
        const questionIdStrings = Object.keys(groupedAnswers);
        const questionIds = questionIdStrings.map(id => Buffer.from((0, uuid_1.parse)(id)));
        const closedQuestions = await db_1.default.closed_questions.findMany({
            where: { id: { in: questionIds } },
            include: { closed_answers: true },
        });
        const questionMap = {};
        closedQuestions.forEach(q => {
            const qIdString = (0, uuid_1.stringify)(q.id);
            questionMap[qIdString] = q;
        });
        const updateOperations = [];
        for (const [questionId, selectedAnswerIds] of Object.entries(groupedAnswers)) {
            const question = questionMap[questionId];
            if (!question)
                continue;
            const selectedAnswers = question.closed_answers.filter(a => selectedAnswerIds.includes((0, uuid_1.stringify)(a.id)));
            const correctSelected = selectedAnswers.filter(a => a.is_correct).length;
            const incorrectSelected = selectedAnswers.filter(a => !a.is_correct).length;
            const totalCorrect = question.closed_answers.filter(a => a.is_correct).length;
            if (totalCorrect === 0)
                continue;
            const score = question.score ?? 1;
            const ratio = (correctSelected - incorrectSelected) / totalCorrect;
            const points = Math.ceil(ratio * score) < 0 ? 0 : Math.ceil(ratio * score);
            totalScore += points;
            const correctAnswerIds = selectedAnswers.filter(a => a.is_correct).map(a => (0, uuid_1.stringify)(a.id));
            const incorrectAnswerIds = selectedAnswers.filter(a => !a.is_correct).map(a => (0, uuid_1.stringify)(a.id));
            const correctAnswerBuffers = correctAnswerIds.map(id => Buffer.from((0, uuid_1.parse)(id)));
            const incorrectAnswerBuffers = incorrectAnswerIds.map(id => Buffer.from((0, uuid_1.parse)(id)));
            if (correctAnswerBuffers.length > 0) {
                updateOperations.push(db_1.default.student_closed_answers.updateMany({
                    where: {
                        closed_question_id: Buffer.from((0, uuid_1.parse)(questionId)),
                        closed_answer_id: { in: correctAnswerBuffers },
                    },
                    data: {
                        correctness: true,
                    },
                }));
            }
            if (incorrectAnswerBuffers.length > 0) {
                updateOperations.push(db_1.default.student_closed_answers.updateMany({
                    where: {
                        closed_question_id: Buffer.from((0, uuid_1.parse)(questionId)),
                        closed_answer_id: { in: incorrectAnswerBuffers },
                    },
                    data: {
                        correctness: false,
                    },
                }));
            }
        }
        await Promise.all(updateOperations);
        return totalScore;
    }
    async gradeOpenAnswers(openAnswers) {
        let totalScore = 0;
        if (openAnswers.length === 0)
            return totalScore;
        const openQuestionIdStrings = [...new Set(openAnswers.map(a => a.open_question_id))];
        const openQuestionIds = openQuestionIdStrings.map(id => Buffer.from((0, uuid_1.parse)(id)));
        const openQuestions = await db_1.default.open_questions.findMany({
            where: {
                id: { in: openQuestionIds },
                auto_check: true,
            },
        });
        const questionMap = {};
        openQuestions.forEach(q => {
            const qIdString = (0, uuid_1.stringify)(q.id);
            questionMap[qIdString] = q;
        });
        const correctAnswers = await db_1.default.open_answers.findMany({
            where: {
                open_question_id: { in: openQuestionIds },
            },
        });
        const correctAnswerMap = {};
        correctAnswers.forEach(a => {
            const qIdString = (0, uuid_1.stringify)(a.open_question_id);
            if (!correctAnswerMap[qIdString]) {
                correctAnswerMap[qIdString] = [];
            }
            correctAnswerMap[qIdString].push(a.description.toLowerCase().trim());
        });
        const updateOperations = [];
        for (const answerInput of openAnswers) {
            const { open_question_id, description } = answerInput;
            if (!description)
                continue;
            const questionIdString = open_question_id;
            const question = questionMap[questionIdString];
            if (!question)
                continue;
            const correctDescriptions = correctAnswerMap[questionIdString];
            if (!correctDescriptions || correctDescriptions.length === 0)
                continue;
            const normalize = (str) => str.trim().toLowerCase();
            const normalizedUserAnswer = normalize(description);
            const isCorrect = correctDescriptions.includes(normalizedUserAnswer);
            updateOperations.push(db_1.default.student_open_answers.updateMany({
                where: {
                    open_question_id: Buffer.from((0, uuid_1.parse)(open_question_id)),
                    description: description.trim(),
                },
                data: {
                    score: isCorrect ? (question.score ?? 1) : 0,
                },
            }));
            if (isCorrect) {
                const points = question.score ?? 1;
                totalScore += points;
            }
        }
        await Promise.all(updateOperations);
        return totalScore;
    }
    async gradeAllAnswers(closedAnswers, openAnswers) {
        const [closedScore, openScore] = await Promise.all([
            this.gradeClosedAnswers(closedAnswers),
            this.gradeOpenAnswers(openAnswers),
        ]);
        const openQuestionIdBuffers = openAnswers.map(a => Buffer.from((0, uuid_1.parse)(a.open_question_id)));
        const openAutoCheckedCount = await db_1.default.open_questions.count({
            where: {
                id: { in: openQuestionIdBuffers },
                auto_check: false,
            },
        });
        return closedScore + openScore;
    }
}
exports.GradingService = GradingService;
