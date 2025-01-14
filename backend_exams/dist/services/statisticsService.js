"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateScoreDistribution = exports.getOpenQuestionsStatistics = exports.getClosedQuestionsStatistics = void 0;
const db_1 = __importDefault(require("../db"));
const getClosedQuestionsStatistics = async (examId) => {
    const closedQuestions = await db_1.default.closed_questions.findMany({
        where: { exam_id: examId },
        select: {
            id: true,
            description: true,
            score: true,
            closed_answers: {
                select: {
                    id: true,
                    description: true,
                    is_correct: true,
                },
            },
        },
    });
    const statistics = [];
    for (const question of closedQuestions) {
        const answerStats = await Promise.all(question.closed_answers.map(async (answer) => {
            const responseCount = await db_1.default.student_closed_answers.count({
                where: {
                    closed_answer_id: answer.id,
                },
            });
            return {
                description: answer.description || '',
                response_count: responseCount,
                is_correct: answer.is_correct,
            };
        }));
        statistics.push({
            description: question.description || '',
            answers: answerStats,
            score: question.score || undefined,
        });
    }
    return statistics;
};
exports.getClosedQuestionsStatistics = getClosedQuestionsStatistics;
const getOpenQuestionsStatistics = async (examId) => {
    const openQuestions = await db_1.default.open_questions.findMany({
        where: {
            exam_id: examId,
        },
        select: {
            id: true,
            description: true,
            auto_check: true,
            score: true,
        },
    });
    const statistics = [];
    for (const question of openQuestions) {
        if (question.auto_check) {
            const correctCount = await db_1.default.student_open_answers.count({
                where: {
                    open_question_id: question.id,
                    score: {
                        gt: 0,
                    },
                },
            });
            const incorrectCount = await db_1.default.student_open_answers.count({
                where: {
                    open_question_id: question.id,
                    OR: [
                        { score: 0 },
                        { score: null },
                    ],
                },
            });
            const autoCheckStatistic = {
                description: question.description || '',
                correct_count: correctCount,
                incorrect_count: incorrectCount,
                score: question.score,
            };
            statistics.push(autoCheckStatistic);
        }
        else {
            const correctCount = await db_1.default.student_open_answers.count({
                where: {
                    open_question_id: question.id,
                    score: question.score,
                },
            });
            const partialCorrectCount = await db_1.default.student_open_answers.count({
                where: {
                    open_question_id: question.id,
                    score: {
                        gt: 0,
                        lt: question.score,
                    },
                },
            });
            const wrongCount = await db_1.default.student_open_answers.count({
                where: {
                    open_question_id: question.id,
                    OR: [
                        { score: 0 },
                        { score: null },
                    ],
                },
            });
            const manualCheckStatistic = {
                description: question.description || '',
                correct_count: correctCount,
                partial_correct_count: partialCorrectCount,
                wrong_count: wrongCount,
                score: question.score,
            };
            statistics.push(manualCheckStatistic);
        }
    }
    return statistics;
};
exports.getOpenQuestionsStatistics = getOpenQuestionsStatistics;
const calculateScoreDistribution = (students) => {
    const ranges = [
        { min: 0, max: 10 },
        { min: 10, max: 20 },
        { min: 20, max: 30 },
        { min: 30, max: 40 },
        { min: 40, max: 50 },
        { min: 50, max: 60 },
        { min: 60, max: 70 },
        { min: 70, max: 80 },
        { min: 80, max: 90 },
        { min: 90, max: 100 },
    ];
    const distribution = ranges.map(range => ({
        range: `${range.min} - ${range.max}%`,
        count: 0,
    }));
    students.forEach(student => {
        if (student.total_score === undefined) {
            return;
        }
        const percentage = (student.total_score / student.max_score) * 100;
        for (let i = 0; i < ranges.length; i++) {
            const range = ranges[i];
            if (percentage >= range.min && percentage < range.max) {
                distribution[i].count += 1;
                break;
            }
            if (percentage === 100 && i === ranges.length - 1) {
                distribution[i].count += 1;
                break;
            }
        }
    });
    return distribution;
};
exports.calculateScoreDistribution = calculateScoreDistribution;
