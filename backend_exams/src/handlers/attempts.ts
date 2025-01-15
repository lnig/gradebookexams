import { Request, Response } from 'express';
import  prisma  from '../db';
import { CreateExamInput } from '../interfaces/examCredentials';
import { createErrorResponse, createSuccessResponse } from '../interfaces/responseInterfaces';
import {  parse as uuidParse, validate as isUUID, stringify as uuidStringify, v4 as uuidv4 } from 'uuid';
import { getClassesByTeacher } from '../services/classService';
import { Student, Class, StudentExam, ClassExam} from '../interfaces/ConvertedTypes';
import { convertBuffersToUUIDs } from '../utils/uuidUtils';
import AuthUser from '../interfaces/authUser';
import { GradingService } from '../services/gradingService';
import { students, exams, open_questions, closed_questions, closed_answers, attempt_questions_question_type } from '@prisma/client';
import { ClosedAnswerInput, OpenAnswerInput, SaveAttemptInput } from '../interfaces/attemptCredentials';
import { GradeOpenAnswerInput, OpenAnswerToGrade, StudentOpenAnswers, OpenAnswersToGradeResponse, StudentToGrade } from '../interfaces/GradingInterfaces';
import { SelectedQuestion } from '../interfaces/questions'
import { ParticipantAttempt, ExamStatistics, ScoreDistribution } from '../interfaces/ExamResults'
import { getClosedQuestionsStatistics, getOpenQuestionsStatistics, calculateScoreDistribution } from '../services/statisticsService';
import { AttemptDetailsResponse, Question, Answer } from '../interfaces/reviewingInterfaces';



export const getUserAttempts = async (req: Request, res: Response) => {
    try {
        const { exam_id } = req.params;
        const user = req.user;

        if (!user) {
            return res.status(401).json(createErrorResponse('Unauthorized'));
        }

        const userIdBuffer = Buffer.from(uuidParse(user.userId));
        const examIdBuffer = Buffer.from(uuidParse(exam_id));

        const attempts = await prisma.attempts.findMany({
            where: { 
                student_id: userIdBuffer,
                exam_id: examIdBuffer

            },
        });

        const formattedAttempts = attempts
        .map(attempt => ({
            attempt_id: uuidStringify(attempt.id),
            attempt_number: attempt.attempt_number,
            start_time: attempt.start_time.toISOString(),
            end_time: attempt.end_time?.toISOString(),
            total_score: attempt.total_score ?? undefined,
            max_score: attempt.max_score ?? 0,
        }))
        .sort((a, b) => a.attempt_number - b.attempt_number);


        return res.status(200).json(createSuccessResponse(formattedAttempts, 'User attempts retrieved successfully.'));
    } catch (error) {
        console.error('Error fetching user attempts:', error);
        return res.status(500).json(createErrorResponse('An unexpected error occurred while fetching user attempts. Please try again later.'));
    }
};

export const startExamAttempt = async (req: Request, res: Response) => {
    try {
        const { exam_id } = req.params;
        
        const user = req.user;
        const student_id = user?.userId;
        
        if (!exam_id || !isUUID(exam_id)) {
            return res.status(400).json(createErrorResponse('Invalid exam ID format.'));
        }

        if (!student_id) {
            return res.status(400).json(createErrorResponse('Invalid student ID.'));
        }

        const studentIdBuffer = Buffer.from(uuidParse(student_id));
        const examIdBuffer = Buffer.from(uuidParse(exam_id));

        const student = await prisma.students.findUnique({
            where: { id: studentIdBuffer },
            include: {
                classes: true,
            }
        });

        if (!student) {
            return res.status(404).json(createErrorResponse('Student not found.'));
        }

        const exam = await prisma.exams.findUnique({
            where: { id: examIdBuffer },
        });

        if (!exam) {
            return res.status(404).json(createErrorResponse('Exam not found.'));
        }

        const existingAttemptsCount = await prisma.attempts.count({
            where: {
                student_id: studentIdBuffer,
                exam_id: examIdBuffer,
            }
        });

        if (!exam.multiple_tries) {
            if (existingAttemptsCount >= 1) {
                return res.status(403).json(createErrorResponse('You cannot attempt this exam anymore.'));
            }
        } else {
            const allowedTries = exam.number_of_tries ?? 1;
            if (existingAttemptsCount >= allowedTries) {
                return res.status(403).json(createErrorResponse('You cannot attempt this exam anymore.'));
            }
        }

        const openQuestions = await prisma.open_questions.findMany({
            where: { exam_id: examIdBuffer },
            select: {
                id: true,
                description: true,
                score: true,
            }
        });

        const closedQuestions = await prisma.closed_questions.findMany({
            where: { exam_id: examIdBuffer },
            include: {
                closed_answers: {
                    select: {
                        id: true,
                        description: true,
                        is_correct: true,
                    }
                }
            }
        });

        const mappedOpenQuestions: SelectedQuestion[] = openQuestions.map(q => ({
            id: uuidStringify(q.id),
            description: q.description || '',
            is_multiple: null,
            ...(exam.display_points_per_question ? { score: q.score } : {}),
            type: 'OPEN',
        }));

        const mappedClosedQuestions: SelectedQuestion[] = closedQuestions.map(q => ({
            id: uuidStringify(q.id),
            description: q.description || '',
            is_multiple: q.is_multiple,
            type: 'CLOSED',
            ...(exam.display_points_per_question ? { score: q.score ?? undefined } : {}),
            answers: q.closed_answers.map(a => ({
                id: uuidStringify(a.id),
                description: a.description || '',
            })),
        }));

        const allQuestions: SelectedQuestion[] = [
            ...mappedOpenQuestions,
            ...mappedClosedQuestions
        ];

        const numberOfQuestions = exam.number_of_questions;

        if (numberOfQuestions === null || numberOfQuestions === undefined) {
            return res.status(400).json(createErrorResponse('Exam does not have a valid number of questions.'));
        }

        const totalAvailableQuestions = allQuestions.length;
        if (totalAvailableQuestions < numberOfQuestions) {
            return res.status(400).json(createErrorResponse('Not enough questions in the exam to fulfill the request.'));
        }

        const shuffledQuestions = [...allQuestions];
        for (let i = shuffledQuestions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffledQuestions[i], shuffledQuestions[j]] = [shuffledQuestions[j], shuffledQuestions[i]];
        }

        const selectedQuestionsPool = shuffledQuestions.slice(0, numberOfQuestions);

        const selectedQuestions: SelectedQuestion[] = selectedQuestionsPool.map(q => ({
            id: q.id,
            description: q.description,
            type: q.type,
            is_multiple: q.is_multiple,
            ...(q.score !== undefined ? { score: q.score } : {}),
            answers: q.type === 'CLOSED' ? q.answers : undefined,
        }));


        const maxScore = selectedQuestionsPool.reduce((acc, q) => {
            if (q.type === 'OPEN') {
                const openQ = openQuestions.find(oq => uuidStringify(oq.id) === q.id);
                return acc + (openQ?.score || 0);
            } else if (q.type === 'CLOSED') {
                const closedQ = closedQuestions.find(cq => uuidStringify(cq.id) === q.id);
                return acc + (closedQ?.score || 0);
            }
            return acc;
        }, 0);

        if (exam.randomise_answers) {
            selectedQuestionsPool.forEach(question => {
                if (question.type === 'CLOSED' && question.answers) {
                    for (let i = question.answers.length - 1; i > 0; i--) {
                        const j = Math.floor(Math.random() * (i + 1));
                        [question.answers[i], question.answers[j]] = [question.answers[j], question.answers[i]];
                    }
                }
            });
        }


        const lastAttempt = await prisma.attempts.findFirst({
            where: {
                student_id: studentIdBuffer,
                exam_id: examIdBuffer,
            },
            orderBy: {
                attempt_number: 'desc',
            },
        });

        const nextAttemptNumber = lastAttempt ? lastAttempt.attempt_number + 1 : 1;

        const newAttempt = await prisma.$transaction(async (prismaTransaction) => {

            const attempt = await prismaTransaction.attempts.create({
                data: {
                    id: Buffer.from(uuidParse(uuidv4())),
                    student_id: studentIdBuffer,
                    exam_id: examIdBuffer,
                    attempt_number: nextAttemptNumber,
                    total_score: 0,
                    max_score: maxScore,
                    start_time: new Date(),
                    end_time: new Date(),
                },
            });

            const attemptQuestionsData = selectedQuestions.map((q) => ({
                id: Buffer.from(uuidParse(uuidv4())),
                attempt_id: attempt.id,
                open_question_id: q.type === 'OPEN' ? Buffer.from(uuidParse(q.id)) : null,
                closed_question_id: q.type === 'CLOSED' ? Buffer.from(uuidParse(q.id)) : null,
                question_type: q.type as attempt_questions_question_type,
                created_at: new Date(),
            }));

            await prismaTransaction.attempt_questions.createMany({
                data: attemptQuestionsData,
            });

            return attempt;
        });

        const attemptId = uuidStringify(newAttempt.id);
        const date = new Date();
        return res.status(200).json(createSuccessResponse({
            attempt_id: attemptId,
            time_for_exam: exam.duration,
            allow_navigation: exam.allow_navigation,
            end_test_after_leaving_window: exam.end_test_after_leaving_window,
            time_limit_for_each_question: exam.time_limit_for_each_question,
            block_copying_pasting: exam.block_copying_pasting,
            title: exam.title,
            date: date,
            questions: selectedQuestions,
        }, 'Exam attempt started successfully.'));
    } catch (error) {
        console.error('Error starting exam attempt:', error);
        return res.status(500).json(createErrorResponse('An unexpected error occurred while starting the exam attempt. Please try again later.'));
    }
};

export const saveAttempt = async (req: Request, res: Response) => {
    try {
        const { attempt_id } = req.params;
        const { closed_answers, open_answers } = req.body as SaveAttemptInput;

        const user = req.user;
        const student_id = user?.userId;

        if (!student_id) {
            return res.status(400).json(createErrorResponse('Invalid student ID.'));
        }

        if (!isUUID(attempt_id)) {
            return res.status(400).json(createErrorResponse('Invalid attempt ID format.'));
        }

        const attemptIdBuffer = Buffer.from(uuidParse(attempt_id));

        const attempt = await prisma.attempts.findUnique({
            where: { id: attemptIdBuffer },
            include: {
                exams: true,
                students: true,
            },
        });

        if (!attempt) {
            return res.status(404).json(createErrorResponse('Attempt not found.'));
        }
        if (!attempt.student_id.equals(Buffer.from(uuidParse(student_id as string)))) {
            return res.status(403).json(createErrorResponse('Attempt does not belong to the specified student.'));
        }

        const startTime = new Date(attempt.start_time);
        const endTime = attempt.end_time ? new Date(attempt.end_time) : new Date();
        const { isEqual } = require('date-fns');

        
        if (!isEqual(startTime, endTime)) {
            return res.status(400).json(createErrorResponse('Attempt has already been completed.'));
        }

        const gradingService = new GradingService();

        await prisma.$transaction(async (prismaTransaction) => {
            if (closed_answers && Array.isArray(closed_answers) && closed_answers.length > 0) {
                const closedAnswersData = closed_answers.map((answer: ClosedAnswerInput) => ({
                    id: Buffer.from(uuidParse(uuidv4())),
                    student_id: Buffer.from(uuidParse(student_id as string)),
                    closed_question_id: Buffer.from(uuidParse(answer.closed_question_id)),
                    closed_answer_id: Buffer.from(uuidParse(answer.closed_answer_id)),
                    attempt_id: attemptIdBuffer,
                    correctness: null,
                    date_time: new Date(),
                }));

                await prismaTransaction.student_closed_answers.createMany({
                    data: closedAnswersData,
                });
            }

            if (open_answers && Array.isArray(open_answers) && open_answers.length > 0) {
                const openAnswersData = open_answers.map((answer: OpenAnswerInput) => ({
                    id: Buffer.from(uuidParse(uuidv4())),
                    open_question_id: Buffer.from(uuidParse(answer.open_question_id)),
                    score: null,
                    student_id: Buffer.from(uuidParse(student_id as string)),
                    attempt_id: attemptIdBuffer,
                    date_time: new Date(),
                    description: answer.description,
                }));

                await prismaTransaction.student_open_answers.createMany({
                    data: openAnswersData,
                });
            }
        });

        const gradingOutcome = await gradingService.gradeAllAnswers(closed_answers, open_answers);

        const ungradedOpenAnswers = await prisma.student_open_answers.findMany({
            where: {
              attempt_id: attemptIdBuffer,
              score: null,
            },
            select: {
              id: true
            },
          });


        await prisma.$transaction(async (prismaTransaction) => {
            if (gradingOutcome !== null) {
                await prismaTransaction.attempts.update({
                    where: { id: attemptIdBuffer },
                    data: {
                        total_score : gradingOutcome,
                        end_time: new Date(),
                        graded: ungradedOpenAnswers.length > 0 ? false : true,
                    },
                });
            } else {
                await prismaTransaction.attempts.update({
                    where: { id: attemptIdBuffer },
                    data: {
                        total_score : gradingOutcome,
                        end_time: new Date(),
                        graded: ungradedOpenAnswers.length > 0 ? false : true,
                    },
                });
            }
        });
        return res.status(200).json(createSuccessResponse({}, 'Exam attempt saved and graded successfully.'));
    } catch (error: any) {
        console.error('Error saving exam attempt:', error);
        return res.status(500).json(createErrorResponse('An unexpected error occurred while saving the exam attempt. Please try again later.'));
    }
};

export const checkAttemptEligibility = async (req: Request, res: Response) => {
    try {
        const { exam_id } = req.params;
        const user = req.user;
        const student_id = user?.userId;

        if (!student_id) {
            return res.status(400).json(createErrorResponse('Invalid student ID.'));
        }

        const exam = await prisma.exams.findUnique({
            where: { id: Buffer.from(uuidParse(exam_id)) },
            include: {
                attempts: true,
            },
        });

        if (!exam) {
            return res.status(404).json(createErrorResponse('Exam not found.'));
        }

        const studentAttempts = exam.attempts.filter(attempt => attempt.student_id.equals(Buffer.from(uuidParse(student_id as string))));

        let maxAttempts = 0;

        if (!exam.multiple_tries) {
            maxAttempts = 1;
        }
        else {
            maxAttempts = exam.number_of_tries != null ? exam.number_of_tries : 0;
        }

        if (studentAttempts.length >= maxAttempts) {
            return res.status(403).json(createErrorResponse(`You have already completed the maximum number of attempts for this exam.`));
        }

        return res.status(200).json(createSuccessResponse({}, 'You are eligible to attempt this exam.'));
    } catch (error: any) {
        console.error('Error checking attempt eligibility:', error);
        return res.status(500).json(createErrorResponse('An unexpected error occurred while checking eligibility. Please try again later.'));
    }
};

export const getAttemptDetails = async (req: Request, res: Response) => {
    try {
        const { attemptId } = req.params;

        if (!attemptId || !isUUID(attemptId)) {
            return res.status(400).json(createErrorResponse('Invalid attempt ID format.'));
        }

        const attemptIdBuffer = Buffer.from(uuidParse(attemptId));

        const attempt = await prisma.attempts.findUnique({
            where: { id: attemptIdBuffer },
            include: {
                attempt_questions: {
                    include: {
                        open_questions: {
                            select: {
                                id: true,
                                description: true,
                                score: true,
                            }
                        },
                        closed_questions: {
                            include: {
                                closed_answers: {
                                    select: {
                                        id: true,
                                        description: true,
                                        is_correct: true,
                                    }
                                },
                            }
                        },
                    }
                },
                exams: {
                    select: {
                        title: true,
                        display_points_per_question: true,
                        show_correct_answers: true,
                    }
                },
            },
        });
        const exam_title = attempt?.exams.title;

        if (!attempt) {
            return res.status(404).json(createErrorResponse('Attempt not found.'));
        }

        const studentClosedAnswers = await prisma.student_closed_answers.findMany({
            where: {
                attempt_id: attemptIdBuffer,
            },
            select: {
                closed_question_id: true,
                closed_answer_id: true,
                correctness: true,
            }
        });

        const studentOpenAnswers = await prisma.student_open_answers.findMany({
            where: {
                attempt_id: attemptIdBuffer,
            },
            select: {
                open_question_id: true,
                score: true,
                description: true,
            }
        });

        const closedAnswersMap: { [questionId: string]: Set<string> } = {};
        studentClosedAnswers.forEach(ans => {
            const questionId = uuidStringify(ans.closed_question_id);
            const answerId = uuidStringify(ans.closed_answer_id);
            if (!closedAnswersMap[questionId]) {
                closedAnswersMap[questionId] = new Set();
            }
            closedAnswersMap[questionId].add(answerId);
        });

        const openAnswersMap: { [questionId: string]: { score: number; description: string } } = {};
        studentOpenAnswers.forEach(ans => {
            const questionId = uuidStringify(ans.open_question_id);
            openAnswersMap[questionId] = {
                score: ans.score ?? 0,
                description: ans.description || '',
            };
        });

        const questions: Question[] = [];

        for (const aq of attempt.attempt_questions) {
            if (aq.question_type === 'OPEN' && aq.open_questions) {
                const q = aq.open_questions;
                const questionId = uuidStringify(q.id);

                const studentAnswer = openAnswersMap[questionId] || { score: 0, description: '' };

                const question: Question = {
                    description: q.description || '',
                    type: 'OPEN',
                    ...(attempt.exams.display_points_per_question ? { max_score: q.score ?? undefined, score: studentAnswer.score } : {}),
                    student_answer: studentAnswer.description,
                };

                questions.push(question);
            } else if (aq.question_type === 'CLOSED' && aq.closed_questions) {
                const q = aq.closed_questions;
                const questionId = uuidStringify(q.id);

                const selectedAnswerIds = closedAnswersMap[questionId] || new Set<string>();

                const answers: Answer[] = q.closed_answers.map(a => ({
                    description: a.description || '',
                    selected: selectedAnswerIds.has(uuidStringify(a.id)),
                    ...(attempt.exams.show_correct_answers ? { is_correct: a.is_correct || false } : {}),
                }));

                const correctSelected = q.closed_answers.filter(a => a.is_correct && selectedAnswerIds.has(uuidStringify(a.id))).length;
                const incorrectSelected = q.closed_answers.filter(a => !a.is_correct && selectedAnswerIds.has(uuidStringify(a.id))).length;
                const totalCorrect = q.closed_answers.filter(a => a.is_correct).length;
                const score = q.score ?? 1;
                const ratio = (correctSelected - incorrectSelected) / totalCorrect;
                const points = Math.ceil(ratio * score) < 0 ? 0 : Math.ceil(ratio * score);

                const question: Question = {
                    description: q.description || '',
                    type: 'CLOSED',
                    ...(attempt.exams.display_points_per_question ? { max_score: q.score ?? undefined, score: points } : {}),
                    answers,
                };

                questions.push(question);
            }
        }
        const response: AttemptDetailsResponse = {
            exam_title: exam_title ?? undefined,
            attempt_id: attemptId,
            questions,
        };

        return res.status(200).json(createSuccessResponse(response, 'Attempt details retrieved successfully.'));
    } catch (error) {
        console.error('Error fetching attempt details:', error);
        return res.status(500).json(createErrorResponse('An unexpected error occurred while fetching attempt details. Please try again later.'));
    }
};
