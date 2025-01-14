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
import { GradeOpenAnswerInput, OpenAnswerToGrade, StudentOpenAnswers, OpenAnswersToGradeResponse, StudentToGrade, GradeToInsert, AttemptToUpdate  } from '../interfaces/GradingInterfaces';
import { SelectedQuestion } from '../interfaces/questions'
import { ParticipantAttempt, ExamStatistics, ScoreDistribution } from '../interfaces/ExamResults'
import { getClosedQuestionsStatistics, getOpenQuestionsStatistics, calculateScoreDistribution } from '../services/statisticsService';
import { AttemptDetailsResponse, Question, Answer } from '../interfaces/reviewingInterfaces';



export const showOpenAnswersToGrade = async (req: Request, res: Response) => {
    const { attempt_id } = req.params;

    if (!isUUID(attempt_id)) {
        return res.status(400).json({ error: 'Invalid attempt ID format.' });
    }

    try {
        const attemptIdBuffer = Buffer.from(uuidParse(attempt_id));

        const attempt = await prisma.attempts.findUnique({
            where: { id: attemptIdBuffer },
            include: { students: true },
        });
        const number_of_attempt = attempt?.attempt_number;

        if (!attempt) {
            return res.status(404).json({ error: 'Attempt not found.' });
        }
        
        const exam = await prisma.exams.findUnique({
            where: { id: attempt.exam_id },
        });

        if (!exam) {
            return res.status(404).json({ error: 'Exam from attempt not found.' });
        }
        const exam_title = exam.title;
        const exam_id = uuidStringify(exam.id);

        const studentOpenAnswers = await prisma.student_open_answers.findMany({
            where: {
                attempt_id: attemptIdBuffer,
                score: null,
            },
            include: {
                open_questions: {
                },
                attempts: {
                },
            },
        });
        const student = attempt.students;

        const openQuestionsToGrade = studentOpenAnswers.map(answer => ({
            student_open_answer_id: uuidStringify(answer.id),
            open_question_id: uuidStringify(answer.open_question_id),
            question_description: answer.open_questions.description,
            student_description: answer.description,
            student_score : answer.score, 
            max_score : answer.open_questions.score,
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
        return res.status(200).json(createSuccessResponse(responsePayload, 'Students to grade fetched successfully.'));
    } catch (error) {
        console.error('Error fetching open questions to grade:', error);
        return res.status(500).json({ error: 'An unexpected error occurred.' });
    }
};

export const showAllOpenAnswersToGrade = async (req: Request, res: Response) => {
    const { exam_id } = req.params;

    if (!isUUID(exam_id)) {
        return res.status(400).json(createErrorResponse('Invalid exam ID format.'));
    }

    try {
        const examIdBuffer = Buffer.from(uuidParse(exam_id));

        const exam = await prisma.exams.findUnique({
            where: { id: examIdBuffer },
            select: {
                title: true,
                id: true,
            },
        });

        if (!exam) {
            return res.status(404).json(createErrorResponse('Exam not found.'));
        }

        const attempts = await prisma.attempts.findMany({
            where: { exam_id: examIdBuffer },
            select: { id: true, attempt_number: true },
        });

        const attemptIds = attempts.map(attempt => attempt.id);

        if (attemptIds.length === 0) {
            return res.status(200).json(createSuccessResponse<OpenAnswersToGradeResponse>({
                exam_id,
                exam_name: exam.title,
                open_questions_to_grade: [],
            }, 'No attempts found for this exam.'));
        }

        const studentOpenAnswers = await prisma.student_open_answers.findMany({
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
            return res.status(200).json(createSuccessResponse<OpenAnswersToGradeResponse>({
                exam_id,
                exam_name: exam.title,
                open_questions_to_grade: [],
            }, 'No open answers to grade found for this exam.'));
        }

        const studentsMap: Map<string, StudentOpenAnswers> = new Map();

        studentOpenAnswers.forEach(answer => {
            const studentKey = `${answer.students.first_name} ${answer.students.last_name}`;
            if (!studentsMap.has(studentKey)) {
                studentsMap.set(studentKey, {
                    firstName: answer.students.first_name,
                    lastName: answer.students.last_name,
                    questions: [],
                });
            }

            const question: OpenAnswerToGrade = {
                student_open_answer_id: uuidStringify(answer.id),
                question_description: answer.open_questions.description || '',
                student_description: answer.description || '',
                attempt_number: answer.attempts.attempt_number,
                student_score: answer.score,
                max_score: answer.open_questions.score,
            };

            studentsMap.get(studentKey)?.questions.push(question);
        });

        const openQuestionsToGrade: StudentOpenAnswers[] = Array.from(studentsMap.values());

        const response: OpenAnswersToGradeResponse = {
            exam_id,
            exam_name: exam.title,
            open_questions_to_grade: openQuestionsToGrade,
        };

        return res.status(200).json(createSuccessResponse(response, 'Open answers to grade fetched successfully.'));
    } catch (error) {
        console.error('Error fetching all open questions to grade:', error);
        return res.status(500).json(createErrorResponse('An unexpected error occurred.'));
    }
};

export const getAllAttemptsToGrade = async (req: Request, res: Response) => {
    const { exam_id } = req.params;

    if (!isUUID(exam_id)) {
        return res.status(400).json(createErrorResponse('Invalid exam ID format.'));
    }

    const examIdBuffer = Buffer.from(uuidParse(exam_id));
    try {
        const exam = await prisma.exams.findUnique({
            where: { id: examIdBuffer },
            select: {
                title: true,
                id: true,
            },
        });

        if (!exam) {
            return res.status(404).json(createErrorResponse('Exam not found.'));
        }

        const attempts = await prisma.attempts.findMany({
            where: { exam_id: examIdBuffer },
            select: { id: true, end_time: true, total_score: true, max_score: true, student_id: true },
        });

        const attemptIds = attempts.map(attempt => attempt.id);

        if (attemptIds.length === 0) {
            return res.status(200).json(createSuccessResponse({
                exam_id,
                exam_name: exam.title,
                students_to_grade: [],
            }, 'No attempts found for this exam.'));
        }

        const openAnswers = await prisma.student_open_answers.findMany({
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
            return res.status(200).json(createSuccessResponse({
                exam_id,
                exam_name: exam.title,
                students_to_grade: [],
            }, 'No open answers to grade found for this exam.'));
        }

        const attemptsMap: Map<string, StudentToGrade> = new Map();

        openAnswers.forEach(answer => {
            const attemptId = uuidStringify(answer.attempt_id);

            if (!attemptsMap.has(attemptId)) {
                const attempt = attempts.find(attempt =>  uuidStringify(attempt.id) === attemptId);

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


        const attemptsToGrade: StudentToGrade[] = Array.from(attemptsMap.values());


        const responsePayload = {
            exam_id,
            exam_name: exam.title,
            exam_title: 'abc',
            students_to_grade: attemptsToGrade,
        };

        return res.status(200).json(createSuccessResponse(responsePayload, 'Students to grade fetched successfully.'));
    } catch (error) {
        console.error('Error fetching students to grade:', error);
        return res.status(500).json(createErrorResponse('An unexpected error occurred.'));
    }
};

export const gradeOpenAnswers = async (req: Request, res: Response) => {
    const grades: GradeOpenAnswerInput[] = req.body;

    if (!Array.isArray(grades) || grades.length === 0) {
        return res.status(400).json({ error: 'Request body must be a non-empty array of grade objects.' });
    }

    try {
        for (const grade of grades) {
            if (!grade.student_open_answer_id || !isUUID(grade.student_open_answer_id)) {
                return res.status(400).json({ error: `Invalid or missing student_open_answer_id: ${grade.student_open_answer_id}` });
            }

            if (typeof grade.score !== 'number' || grade.score < 0) {
                return res.status(400).json({ error: `Invalid score for student_open_answer_id ${grade.student_open_answer_id}. Score must be a non-negative number.` });
            }

        }

        const gradeData = grades.map(grade => ({
            student_open_answer_id: Buffer.from(uuidParse(grade.student_open_answer_id)),
            score: grade.score
        }));

        const attemptsToCheck = new Set<string>();
        const gradingService = new GradingService();

        await prisma.$transaction(async (prismaTransaction) => {
            for (const grade of gradeData) {
                const studentOpenAnswer = await prismaTransaction.student_open_answers.findUnique({
                    where: { id: grade.student_open_answer_id },
                    include: {
                        open_questions: true,
                        attempts: true,
                    },
                });

                if (!studentOpenAnswer) {
                    throw new Error(`Student open answer not found for ID: ${uuidStringify(grade.student_open_answer_id)}`);
                }
                const maxScore = studentOpenAnswer.open_questions.score;
                if (grade.score > maxScore) {
                    throw new Error(`Score for student open answer ID ${uuidStringify(grade.student_open_answer_id)} exceeds maximum allowed score of ${maxScore}.`);
                }

                await prismaTransaction.student_open_answers.update({
                    where: { id: grade.student_open_answer_id },
                    data: {
                        score: grade.score
                    },
                });

                const attemptId = uuidStringify(studentOpenAnswer.attempt_id);
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
                        attempt_id: Buffer.from(uuidParse(attemptId)),
                        score: null,
                    },
                });
                console.log(ungradedOpenAnswers)
                
                if (!ungradedOpenAnswers) {
                    console.log("weszlo");
                    await prismaTransaction.attempts.update({
                        where: { id: Buffer.from(uuidParse(attemptId)) },
                        data: {
                            graded: true,
                        },
                    });
                }
            }
        });

        return res.status(200).json({ message: 'Open answers graded successfully.' });
    } catch (error: any) {
        console.error('Error grading open answers:', error);
        return res.status(500).json({ error: 'An unexpected error occurred while grading open answers.' });
    }
};

export const getExamResults = async (req: Request, res: Response) => {
    try {
        const { exam_id } = req.params;

        if (!exam_id || !isUUID(exam_id)) {
            return res.status(400).json(createErrorResponse('Invalid exam ID format.'));
        }

        const examIdBuffer = Buffer.from(uuidParse(exam_id));

        const examExists = await prisma.exams.findUnique({
            where: { id: examIdBuffer },
        });

        if (!examExists) {
            return res.status(404).json(createErrorResponse('Exam not found.'));
        }

        const attempts = await prisma.attempts.findMany({
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

        const formattedStudents: ParticipantAttempt[] = [];
        const attemptsByStudent: { [key: string]: typeof attempts } = {};

        attempts.forEach(attempt => {
            if (!attemptsByStudent[uuidStringify(attempt.student_id)]) {
                attemptsByStudent[uuidStringify(attempt.student_id)] = [];
            }
            attemptsByStudent[uuidStringify(attempt.student_id)].push(attempt);
        });

        for (const studentId in attemptsByStudent) {
            const studentAttempts = attemptsByStudent[studentId];
            let selectedAttempt;

            if (examExists.best_attempt_counts) {
                selectedAttempt = studentAttempts.reduce((prev, current) => {
                    return (prev.total_score || 0) > (current.total_score || 0) ? prev : current;
                }, studentAttempts[0]);
            } else {
                selectedAttempt = studentAttempts.reduce((prev, current) => {
                    return (prev.end_time || new Date(0)) > (current.end_time || new Date(0)) ? prev : current;
                }, studentAttempts[0]);
            }

            formattedStudents.push({
                    attempt_id: uuidStringify(selectedAttempt.id),
                    attempt_number: selectedAttempt.attempt_number,
                    start_time: selectedAttempt.start_time.toISOString(),
                    end_time: selectedAttempt.end_time?.toISOString(),
                    first_name: selectedAttempt.students.first_name,
                    last_name: selectedAttempt.students.last_name,
                    total_score: selectedAttempt.total_score ?? undefined,
                    max_score: selectedAttempt.max_score ?? 0 ,
                });
        }

        const closedQuestionsStatistics = await getClosedQuestionsStatistics(examIdBuffer);

        const openQuestionsStatistics = await getOpenQuestionsStatistics(examIdBuffer);

        const scoreDistribution: ScoreDistribution[] = await calculateScoreDistribution(formattedStudents);


        const examStatistics: ExamStatistics = {
            exam_title: examExists.title,
            Students: formattedStudents,
            Statistics: {
                closedQuestions: closedQuestionsStatistics,
                openQuestions: openQuestionsStatistics,
                scoreDistribution,
            },
        };

        return res.status(200).json(createSuccessResponse(examStatistics, 'Participants and statistics fetched successfully.'));
    } catch (error) {
        console.error('Error fetching exam participants attempts and statistics:', error);
        return res.status(500).json(createErrorResponse('An unexpected error occurred while fetching exam participants attempts and statistics.'));
    }
};

export const checkExamState = async (req: Request, res: Response) => {
  const { exam_id } = req.params;



  try {
    const examIdBuffer = Buffer.from(uuidParse(exam_id));

    const exam = await prisma.exams.findUnique({
      where: { id: examIdBuffer },
    });

    if (!exam) {
      return res.status(404).json({ message: 'Exam not found.' });
    }

    const currentTime = new Date();

    if (exam.end_date_time > currentTime) {
      return res.status(200).json({ message: 'The exam has not yet ended.' });
    }

    const ungradedAttempts = await prisma.attempts.findMany({
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

    const allStudents = await prisma.attempts.findMany({
        where: { exam_id: examIdBuffer },
        select: { student_id: true },
        distinct: ['student_id'],
      });
  
    const totalStudents = allStudents.length;
  
    const gradedStudents = await prisma.grades_exams.findMany({
        where: { exam_id: examIdBuffer },
        select: { student_id: true },
        distinct: ['student_id'],
    });
  
    const totalGradedStudents = gradedStudents.length;
  
    if (totalGradedStudents === totalStudents && totalStudents > 0) {
        return res.status(200).json({ message: 'All students have been graded.' });
    } else {
        return res.status(200).json({ message: 'The exam can be graded.' });
    }


  } catch (error) {
    console.error('Error checking grading status:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

export const gradeExam = async (req: Request, res: Response) => {
    const { exam_id } = req.params;
    const { mode } = req.body;
  
    if (!isUUID(exam_id)) {
      return res.status(400).json({ error: 'Invalid exam_id format.' });
    }
  
    if (mode !== 'grade' && mode !== 'regrade') {
      return res.status(400).json({ error: 'Invalid mode. Expected "grade" or "regrade".' });
    }
  
    try {
      const examIdBuffer = Buffer.from(uuidParse(exam_id));
  
      const exam = await prisma.exams.findUnique({
        where: { id: examIdBuffer },
      });
  
      if (!exam) {
        return res.status(404).json({ error: 'Exam not found.' });
      }
  
      const gradingScales = await prisma.grading_scale.findMany({
        orderBy: { min_score: 'asc' },
      });
  
      if (gradingScales.length === 0) {
        return res.status(400).json({ error: 'Grading scale is not defined.' });
      }
  
      const attempts = await prisma.attempts.findMany({
        where: { exam_id: examIdBuffer },
        include: { students: true },
      });
  
      if (attempts.length === 0) {
        return res.status(400).json({ error: 'No attempts found for this exam.' });
      }
  
      const existingGrades = await prisma.grades_exams.findMany({
        where: { exam_id: examIdBuffer },
        include: { students: true },
      });
  
      const studentGradesMap = new Map<string, any>();
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
      }, {} as Record<string, typeof attempts[0][]>);
  
      const gradesToInsert: GradeToInsert[] = [];
      const gradesToUpdate: Array<{ existingGrade: any; newGrade: string }> = [];
  
      for (const [studentIdHex, studentAttempts] of Object.entries(attemptsByStudent)) {
        const studentIdBuffer = Buffer.from(studentIdHex, 'hex');
  
        let selectedAttempt: typeof studentAttempts[0] | null = null;
  
        if (exam.best_attempt_counts) {
          selectedAttempt = studentAttempts.reduce((best, current) => {
            if (current.total_score === null) return best;
            if (!best || current.total_score > (best.total_score || 0)) {
              return current;
            }
            return best;
          }, null as typeof studentAttempts[0] | null);
        } else if (exam.latest_attempt_counts) {
          selectedAttempt = studentAttempts.reduce((latest, current) => {
            if (!latest || current.attempt_number > latest.attempt_number) {
              return current;
            }
            return latest;
          }, null as typeof studentAttempts[0] | null);
        } else {
          selectedAttempt = studentAttempts.reduce((latest, current) => {
            if (!latest || current.attempt_number > latest.attempt_number) {
              return current;
            }
            return latest;
          }, null as typeof studentAttempts[0] | null);
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
              id: Buffer.from(uuidParse(uuidv4())),
              student_id: studentIdBuffer,
              attempt_id: selectedAttempt.id,
              exam_id: examIdBuffer,
              grade: expectedGrade,
              description: "Results from exam: " + exam.title,
            });
          }
        } else if (mode === 'regrade') {
          if (!studentGradesMap.has(studentIdHex)) {
            gradesToInsert.push({
              id: Buffer.from(uuidParse(uuidv4())),
              student_id: studentIdBuffer,
              attempt_id: selectedAttempt.id,
              exam_id: examIdBuffer,
              grade: expectedGrade,
              description: "Results from exam: " + exam.title,
            });
          } else {
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
  
      const transactionOperations: any[] = [];
  
      gradesToInsert.forEach(gradeEntry => {
        transactionOperations.push(
          prisma.grades_exams.create({
            data: {
              id: gradeEntry.id,
              student_id: gradeEntry.student_id,
              attempt_id: gradeEntry.attempt_id,
              exam_id: gradeEntry.exam_id,
              grade: gradeEntry.grade,
              description: gradeEntry.description || '',
            },
          })
        );
  
        transactionOperations.push(
          prisma.notifications.create({
            data: {
              id: Buffer.from(uuidParse(uuidv4())),
              student_id: gradeEntry.student_id,
              description: `You have been graded on exam '${exam.title}'.`,
              exam_id: examIdBuffer,
            },
          })
        );
      });
  
      gradesToUpdate.forEach(({ existingGrade, newGrade }) => {
        transactionOperations.push(
          prisma.grades_exams.update({
            where: { id: existingGrade.id },
            data: { grade: newGrade },
          })
        );
  
        transactionOperations.push(
          prisma.notifications.create({
            data: {
              id: Buffer.from(uuidParse(uuidv4())),
              student_id: existingGrade.student_id,
              description: `You have been regraded on exam '${exam.title}'.`,
              exam_id: examIdBuffer,
            },
          })
        );
      });
  
      if (transactionOperations.length === 0) {
        if (mode === 'grade') {
          return res.status(200).json({ message: 'All students have already been graded.' });
        } else if (mode === 'regrade') {
          return res.status(200).json({ message: 'All student grades are up-to-date.' });
        }
      }
  
      await prisma.$transaction(transactionOperations);
  
      if (mode === 'grade') {
        return res.status(200).json({ message: 'Grades have been successfully recorded and notifications sent.' });
      } else if (mode === 'regrade') {
        return res.status(200).json({ message: 'Grades have been successfully regraded and notifications sent.' });
      }
  
    } catch (error) {
      console.error('Error grading exam:', error);
      return res.status(500).json({ error: 'Internal server error.' });
    }
};