import prisma from '../db';
import { ClosedAnswerInput, OpenAnswerInput } from '../interfaces/GradingInterfaces';
import { parse as uuidParse, stringify as uuidStringify, v4 as uuidv4 } from 'uuid';
import { closed_answers, closed_questions, open_questions } from '@prisma/client';

export class GradingService {

    public async gradeClosedAnswers(closedAnswers: ClosedAnswerInput[]): Promise<number> {
        let totalScore = 0;

        if (closedAnswers.length === 0) return totalScore;

        const groupedAnswers: { [questionId: string]: string[] } = {};
        closedAnswers.forEach(answer => {
            if (!groupedAnswers[answer.closed_question_id]) {
                groupedAnswers[answer.closed_question_id] = [];
            }
            groupedAnswers[answer.closed_question_id].push(answer.closed_answer_id);
        });

        const questionIdStrings = Object.keys(groupedAnswers);
        const questionIds: Buffer[] = questionIdStrings.map(id => Buffer.from(uuidParse(id)));

        const closedQuestions = await prisma.closed_questions.findMany({
            where: { id: { in: questionIds } },
            include: { closed_answers: true },
        });

        const questionMap: { [key: string]: closed_questions & { closed_answers: closed_answers[] } } = {};
        closedQuestions.forEach(q => {
            const qIdString = uuidStringify(q.id);
            questionMap[qIdString] = q;
        });

        const updateOperations: Promise<any>[] = [];

        for (const [questionId, selectedAnswerIds] of Object.entries(groupedAnswers)) {
            const question = questionMap[questionId];
            if (!question) continue;

            const selectedAnswers = question.closed_answers.filter(a => selectedAnswerIds.includes(uuidStringify(a.id)));

            const correctSelected = selectedAnswers.filter(a => a.is_correct).length;
            const incorrectSelected = selectedAnswers.filter(a => !a.is_correct).length;
            const totalCorrect = question.closed_answers.filter(a => a.is_correct).length;

            if (totalCorrect === 0) continue;
            const score = question.score ?? 1;
            const ratio = (correctSelected - incorrectSelected) / totalCorrect;
            const points = Math.ceil(ratio * score) < 0 ? 0 : Math.ceil(ratio * score);
            totalScore += points;

            const correctAnswerIds = selectedAnswers.filter(a => a.is_correct).map(a => uuidStringify(a.id));
            const incorrectAnswerIds = selectedAnswers.filter(a => !a.is_correct).map(a => uuidStringify(a.id));

            const correctAnswerBuffers = correctAnswerIds.map(id => Buffer.from(uuidParse(id)));
            const incorrectAnswerBuffers = incorrectAnswerIds.map(id => Buffer.from(uuidParse(id)));

            if (correctAnswerBuffers.length > 0) {
                updateOperations.push(
                    prisma.student_closed_answers.updateMany({
                        where: {
                            closed_question_id: Buffer.from(uuidParse(questionId)),
                            closed_answer_id: { in: correctAnswerBuffers },
                        },
                        data: {
                            correctness: true,
                        },
                    })
                );
            }

            if (incorrectAnswerBuffers.length > 0) {
                updateOperations.push(
                    prisma.student_closed_answers.updateMany({
                        where: {
                            closed_question_id: Buffer.from(uuidParse(questionId)),
                            closed_answer_id: { in: incorrectAnswerBuffers },
                        },
                        data: {
                            correctness: false,
                        },
                    })
                );
            }
        }

        await Promise.all(updateOperations);
        return totalScore;
    }

    public async gradeOpenAnswers(openAnswers: OpenAnswerInput[]): Promise<number> {
        let totalScore = 0;

        if (openAnswers.length === 0) return totalScore;

        const openQuestionIdStrings = [...new Set(openAnswers.map(a => a.open_question_id))];
        const openQuestionIds: Buffer[] = openQuestionIdStrings.map(id => Buffer.from(uuidParse(id)));

        const openQuestions = await prisma.open_questions.findMany({
            where: {
                id: { in: openQuestionIds },
                auto_check: true,
            },
        });

        const questionMap: { [key: string]: open_questions } = {};
        openQuestions.forEach(q => {
            const qIdString = uuidStringify(q.id);
            questionMap[qIdString] = q;
        });

        const correctAnswers = await prisma.open_answers.findMany({
            where: {
                open_question_id: { in: openQuestionIds },
            },
        });

        const correctAnswerMap: { [key: string]: string[] } = {};
        correctAnswers.forEach(a => {
            const qIdString = uuidStringify(a.open_question_id);
            if (!correctAnswerMap[qIdString]) {
                correctAnswerMap[qIdString] = [];
            }
            correctAnswerMap[qIdString].push(a.description.toLowerCase().trim());
        });

        const updateOperations: Promise<any>[] = [];

        for (const answerInput of openAnswers) {
            const { open_question_id, description } = answerInput;

            if (!description) continue;

            const questionIdString = open_question_id;
            const question = questionMap[questionIdString];

            if (!question) continue;

            const correctDescriptions = correctAnswerMap[questionIdString];
            if (!correctDescriptions || correctDescriptions.length === 0) continue; 

            const normalize = (str: string) => str.trim().toLowerCase();

            const normalizedUserAnswer = normalize(description);
            const isCorrect = correctDescriptions.includes(normalizedUserAnswer);


            updateOperations.push(
                prisma.student_open_answers.updateMany({
                    where: {
                        open_question_id: Buffer.from(uuidParse(open_question_id)),
                        description: description.trim(),
                    },
                    data: {
                        score: isCorrect ? (question.score ?? 1) : 0,
                    },
                })
            );

            if (isCorrect) {
                const points = question.score ?? 1;
                totalScore += points;
            }
        }

        await Promise.all(updateOperations);

        return totalScore;
    }

    public async gradeAllAnswers(closedAnswers: ClosedAnswerInput[], openAnswers: OpenAnswerInput[]): Promise<number | null> {
        const [closedScore, openScore] = await Promise.all([
            this.gradeClosedAnswers(closedAnswers),
            this.gradeOpenAnswers(openAnswers),
        ]);

        const openQuestionIdBuffers = openAnswers.map(a => Buffer.from(uuidParse(a.open_question_id)));
        const openAutoCheckedCount = await prisma.open_questions.count({
            where: {
                id: { in: openQuestionIdBuffers },
                auto_check: false,
            },
        });

        return closedScore + openScore;
    }
}
