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
import { UserType } from '../enums/userTypes';


export const getExam = async (req: Request, res: Response) => {
    try {
        const { exam_id } = req.params;

        if (!isUUID(exam_id)) {
            return res.status(400).json(createErrorResponse('Invalid exam ID format.'));
        }

        const exam = await prisma.exams.findUnique({
            where: { id: Buffer.from(uuidParse(exam_id)) },
        });

        if (!exam) {
            return res.status(404).json(createErrorResponse('Exam not found.'));
        }
        const user = req.user;
        if (!user) {
            return res.status(401).json(createErrorResponse('Unauthorized'));
        }
        const gradebook_exam = await prisma.gradebook_exams.findFirst({
            where: { lesson_id: exam.lesson_id },
        });
        if (user.role === UserType.Student) {

            const responseData = {
                id: uuidStringify(exam.id),
                start_date_time: exam.start_date_time,
                gradebook_exam: gradebook_exam?.topic,
                end_date_time: exam.end_date_time,
                duration: exam.duration,
                number_of_questions : exam.number_of_questions,
                description: exam.description,
                allow_review: exam.allow_review,
                hide_results: exam.hide_results,
                title: exam.title,
            };
            return res.status(200).json(createSuccessResponse(responseData, 'Exam retrieved successfully.'));
        } else {
            const responseData = {
                ...convertBuffersToUUIDs(exam),
                gradebook_exam: gradebook_exam?.topic,
                start_date_time: new Date(exam.start_date_time),
                end_date_time: new Date(exam.end_date_time),
            };
            console.log(responseData)
            return res.status(200).json(createSuccessResponse(responseData, 'Exam retrieved successfully.'));

        }

    } catch (error) {
        console.error('Error fetching exam:', error);
        return res.status(500).json(createErrorResponse('An unexpected error occurred while fetching the exam. Please try again later.'));
    }
};

export const getExams = async (req: Request, res: Response) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json(createErrorResponse('Unauthorized'));
        }

        let exams;

        if (user.role === UserType.Student) {
            const studentIdBuffer = Buffer.from(uuidParse(user.userId));
            console.log(user.userId)
            const student = await prisma.students.findUnique({
                where: { id: studentIdBuffer },
                select: { class_id: true },
            });

            if (!student) {
                return res.status(404).json(createErrorResponse('Student not found.'));
            }

            const classIdBuffer = student.class_id;

            const orConditions: any[] = [
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

            exams = await prisma.exams.findMany({
                where: {
                    OR: orConditions,
                },
            });
        } else if (user.role === UserType.Teacher) {
            const teacherIdBuffer = Buffer.from(uuidParse(user.userId));
            exams = await prisma.exams.findMany({
                where: {
                    teacher_id: teacherIdBuffer,
                },
            });
        } else if (user.role === UserType.Administrator) {
            exams = await prisma.exams.findMany();
        } else {
            return res.status(403).json(createErrorResponse('Forbidden'));
        }


        


        const responseData = exams.map(exam => ({
            id: uuidStringify(exam.id),
            start_date_time: exam.start_date_time,
            end_date_time: exam.end_date_time,
            duration: exam.duration,
            questionsCount : exam.number_of_questions,
            description: exam.description,
            title: exam.title,
        }));

        return res.status(200).json(createSuccessResponse(responseData, 'Exams retrieved successfully.'));
    } catch (error) {
        console.error('Error fetching exams:', error);
        return res.status(500).json(createErrorResponse('An unexpected error occurred while fetching exams. Please try again later.'));
    }
};

export const createExam = async (req: Request, res: Response) => {
  try {
      const {
          title,
          lesson_id,
          start_date_time,
          end_date_time,
          visibility = false,
          number_of_questions,
          duration,
          description,
          number_of_tries = 1,
          multiple_tries = false,
          randomise_answers = false,
          time_limit_for_each_question = false,
          randomise_questions = false,
          end_test_after_leaving_window = false,
          block_copying_pasting = false,
          latest_attempt_counts = true,
          best_attempt_counts = false,
          hide_results = true,
          display_points_per_question = false,
          show_correct_answers = false,
          allow_navigation = false,
          allow_review = false,
      }: CreateExamInput = req.body;

    const user = req.user;
    if (!user) {
        return res.status(401).json(createErrorResponse('Unauthorized'));
    }
    const teacher_id = user.userId;

      if (!isUUID(teacher_id)) {
          return res.status(400).json(createErrorResponse('Invalid teacher ID format.'));
      }

      const teacherIdBuffer = Buffer.from(uuidParse(teacher_id));

      const teacher = await prisma.teachers.findUnique({
          where: { id: teacherIdBuffer },
      });

      if (!teacher) {
        return res.status(404).json(createErrorResponse('Teacher not found.'));
      }   

      const lessonIdBuffer = Buffer.from(uuidParse(lesson_id));

      const lesson = await prisma.lessons.findUnique({
          where: { id: lessonIdBuffer },
      });

      if (!lesson){
        return res.status(404).json(createErrorResponse('Lesson not found.'));
      }

   

      if (number_of_questions === undefined || typeof number_of_questions !== 'number') {
          return res.status(400).json(createErrorResponse('number_of_questions is required and must be a number.'));
      }

      const newExam = await prisma.exams.create({
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
              number_of_tries : number_of_tries,
              multiple_tries: multiple_tries,
              time_limit_for_each_question: time_limit_for_each_question,
              randomise_questions: randomise_questions,
              end_test_after_leaving_window: end_test_after_leaving_window,
              block_copying_pasting: block_copying_pasting,
              randomise_answers : randomise_answers,
              latest_attempt_counts : latest_attempt_counts,
              best_attempt_counts : best_attempt_counts,
              hide_results: hide_results,
              display_points_per_question: display_points_per_question,
              show_correct_answers: show_correct_answers,
              allow_navigation: allow_navigation,
              allow_review: allow_review,
          },
      });

      const examUUID = uuidStringify(newExam.id); 

      return res.status(201).json(createSuccessResponse({ id: examUUID }, 'Exam created successfully.'));
  } catch (error) {
      console.error('Error creating exam:', error);
      return res.status(500).json(createErrorResponse('An unexpected error occurred while creating the exam. Please try again later.'));
  }
};

export const updateExam = async (req: Request, res: Response) => {
    try {
        const { exam_id } = req.params;
        const {
            title,
            lesson_id,
            start_date_time,
            end_date_time,
            visibility,
            number_of_questions,
            duration,
            description,
            number_of_tries,
            multiple_tries,
            randomise_answers,
            randomise_questions,
            block_copying_pasting,
            time_limit_for_each_question,
            end_test_after_leaving_window,
            latest_attempt_counts,
            best_attempt_counts,
            hide_results,
            display_points_per_question,
            show_correct_answers,
            allow_navigation,
            allow_review,
        }: CreateExamInput = req.body;

        console.log(lesson_id);
        console.log("11111111")
        const examIdBuffer = Buffer.from(uuidParse(exam_id));

        const existingExam = await prisma.exams.findUnique({
            where: { id: examIdBuffer },
        });

        if (!existingExam) {
            return res.status(404).json(createErrorResponse('Exam not found.'));
        }
        console.log(lesson_id);
        const lessonIdBuffer = Buffer.from(uuidParse(lesson_id));

        console.log("33333333333")
        const existingLesson = await prisma.lessons.findUnique({
            where: { id: lessonIdBuffer },
        });

        console.log("00000000")
        if (!existingLesson) {
            return res.status(404).json(createErrorResponse('Lesson not found.'));
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
            time_limit_for_each_question : time_limit_for_each_question,
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
        console.log("111111")

        const updatedExam = await prisma.exams.update({
            where: { id: examIdBuffer },
            data: updateData,
        });
        console.log("22222222")

        const existing1Exam = await prisma.exams.findUnique({
            where: { id: examIdBuffer },
        });
        // console.log(existing1Exam);

        const examUUID = uuidStringify(updatedExam.id);

        return res.status(200).json(createSuccessResponse({ id: examUUID }, 'Exam updated successfully.'));
    } catch (error) {
        console.error('Error updating exam:', error);
        return res.status(500).json(createErrorResponse('An unexpected error occurred while updating the exam. Please try again later.'));
    }
};

export const deleteExam = async (req: Request, res: Response) => {
    try {
        const { exam_id } = req.params;

        if (!isUUID(exam_id)) {
            return res.status(400).json(createErrorResponse('Invalid exam ID format.'));
        }

        const examIdBuffer = Buffer.from(uuidParse(exam_id));

        const exam = await prisma.exams.findUnique({
            where: { id: examIdBuffer },
        });

        if (!exam) {
            return res.status(404).json(createErrorResponse('Exam not found.'));
        }

        const attempts = await prisma.attempts.findMany({
            where: { exam_id: examIdBuffer },
            select: { id: true },
        });
        const attemptIds = attempts.map(a => a.id);

        await prisma.attempt_questions.deleteMany({
            where: { attempt_id: { in: attemptIds } },
        });

        await prisma.student_closed_answers.deleteMany({
            where: { attempt_id: { in: attemptIds } },
        });

        await prisma.student_open_answers.deleteMany({
            where: { attempt_id: { in: attemptIds } },
        });

        await prisma.closed_answers.deleteMany({
            where: { closed_question_id: { in: (await prisma.closed_questions.findMany({ where: { exam_id: examIdBuffer } })).map(cq => cq.id) } },
        });

        await prisma.closed_questions.deleteMany({
            where: { exam_id: examIdBuffer },
        });

        await prisma.open_answers.deleteMany({
            where: { open_question_id: { in: (await prisma.open_questions.findMany({ where: { exam_id: examIdBuffer } })).map(oq => oq.id) } },
        });

        await prisma.open_questions.deleteMany({
            where: { exam_id: examIdBuffer },
        });

        await prisma.grades_exams.deleteMany({
            where: { exam_id: examIdBuffer },
        });

        await prisma.files_repository.deleteMany({
            where: { exam_id: examIdBuffer },
        });

        await prisma.classes_exams.deleteMany({
            where: { exam_id: examIdBuffer },
        });

        await prisma.students_exams.deleteMany({
            where: { exam_id: examIdBuffer },
        });

        await prisma.attempts.deleteMany({
            where: { exam_id: examIdBuffer },
        });

        await prisma.exams.delete({
            where: { id: examIdBuffer },
        });

        return res.status(200).json(createSuccessResponse(null, 'Exam deleted successfully.'));
    } catch (error) {
        console.error('Error deleting exam:', error);
        return res.status(500).json(createErrorResponse('An unexpected error occurred while deleting the exam. Please try again later.'));
    }
};

export const getGradebookExams = async (req: Request, res: Response) => {
    const user = req.user;
    const teacher_id = user?.userId;

    if (!user || user.role !== UserType.Teacher) {
        return res.status(401).json(createErrorResponse('Unauthorized'));
    }

    if (!teacher_id || typeof teacher_id !== 'string' || !isUUID(teacher_id)) {
        return res.status(400).json(createErrorResponse('Invalid teacher ID.'));
    }

    try {
        const teacherIdBuffer = Buffer.from(uuidParse(teacher_id));

        const teacher = await prisma.teachers.findUnique({
            where: { id: teacherIdBuffer },
        });

        if (!teacher) {
            return res.status(404).json(createErrorResponse('Teacher not found.'));
        }

        const gradebookExams = await prisma.gradebook_exams.findMany({
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

        const formattedGradebookExams = gradebookExams.map(exam => ({
            lesson_id: uuidStringify(exam.lesson_id),
            topic: exam.topic,
        }));

        return res.status(200).json(createSuccessResponse(formattedGradebookExams, 'Gradebook exams retrieved successfully.'));
    } catch (error) {
        console.error('Error fetching gradebook exams:', error);
        return res.status(500).json(createErrorResponse('Internal server error.'));
    }
};

export const getExamParticipants = async (req: Request, res: Response) => {
  try {
    const { exam_id } = req.params;

    const user = req.user;

    if (!isUUID(exam_id)) {
      return res.status(400).json(createErrorResponse('Invalid exam ID format.'));
    }

    if (!user) {
        return res.status(401).json(createErrorResponse('Unauthorized.'));
    }

    const exam = await prisma.exams.findUnique({
      where: { id: Buffer.from(uuidParse(exam_id)) },
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
      return res.status(404).json(createErrorResponse('Exam not found.'));
    }

    const studentsParticipants: Student[] = exam.students_exams.map((se) => {
        const student = se.students;
        return {
          id: uuidStringify(student.id as Buffer),
          first_name: student.first_name,
          last_name: student.last_name,
          class_id: student.class_id ? uuidStringify(student.class_id as Buffer) : null,
        };
      });

      const classesParticipants: Class[] = exam.classes_exams.map((ce) => {
        const cls = ce.classes;
        return {
          id: uuidStringify(cls.id as Buffer),
          name: cls.class_names.name,
          teacher_id: cls.teacher_id ? uuidStringify(cls.teacher_id as Buffer) : null,
        };
      });

    const studentsParticipantsIds = studentsParticipants.map((sp) => sp.id);
    const classesParticipantsIds = classesParticipants.map((cp) => cp.id);

    if (user.role === UserType.Administrator) {
  
        const classesRaw = await prisma.classes.findMany(
            {
                include: {
                class_names: {
                    select: {
                    name: true,
                    },
              },
            }
        }
        );
        const classes = classesRaw
          .map(cls => ({
            id: uuidStringify(cls.id),
            name: cls.class_names.name,
            teacher_id: cls.teacher_id ? uuidStringify(cls.teacher_id) : null,
          }))
          .filter(cls => !classesParticipantsIds.includes(cls.id));
  
        const studentsRaw = await prisma.students.findMany();
        const students = studentsRaw
          .map(student => ({
            id: uuidStringify(student.id),
            first_name: student.first_name,
            last_name: student.last_name,
            class_id: student.class_id ? uuidStringify(student.class_id) : null,
          }))
          .filter(student => !studentsParticipantsIds.includes(student.id));
  
        const responseData = {
          studentsParticipants,
          classesParticipants,
          students,
          classes,
        };
  
        return res.status(200).json(createSuccessResponse(responseData,'Exam participants retrieved successfully.'));
  
      } else if (user.role === UserType.Teacher) {
        const teacher_id = user.userId;
  
        const teacherClassesRaw = await getClassesByTeacher(teacher_id);
        const teacherClasses = teacherClassesRaw.map((cls: any) => ({
            id: cls.id,
            name: cls.name,
            yearbook: cls.yearbook,
            teacher_id: cls.teacher_id ? cls.teacher_id : null,
          }));
  
        const classes = teacherClasses.filter(
          (cls) => !classesParticipantsIds.includes(cls.id)
        );
        const teacherClassIdsBuffers = teacherClassesRaw.map((cls) => Buffer.from(uuidParse(cls.id as string)));
        const studentsInTeacherClassesRaw = await prisma.students.findMany({
            where: {
              class_id: {
                in: teacherClassIdsBuffers,
              },
            },
          });
  
        const studentsInTeacherClasses: Student[] = studentsInTeacherClassesRaw.map(
            (student: any) => ({
              id: uuidStringify(student.id),
              first_name: student.first_name,
              last_name: student.last_name,
              class_id: student.class_id ? uuidStringify(student.class_id) : null,
            })
          );
          
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
  
        return res.status(200).json(createSuccessResponse(responseData,'Exam participants retrieved successfully.'));
  
      
    }
  } catch (error) {
    console.error('Error fetching exam participants:', error);
    return res.status(500).json(createErrorResponse('An unexpected error occurred while fetching the exam participants. Please try again later.'));
  }
};

export const getExamParticipantsForNewExam = async (req: Request, res: Response) => {
    try {
  
      const user = req.user;
  
      if (!user) {
          return res.status(401).json(createErrorResponse('Unauthorized.'));
      }

      if (user.role === UserType.Administrator) {
    
        const classesRaw = await prisma.classes.findMany(
            {
                include: {
                class_names: {
                    select: {
                    name: true,
                    },
              },
            }
        }
        );
          const classes = classesRaw
            .map(cls => ({
              id: uuidStringify(cls.id),
              name: cls.class_names.name,
              teacher_id: cls.teacher_id ? uuidStringify(cls.teacher_id) : null,
            }));
    
          const studentsRaw = await prisma.students.findMany();
          const students = studentsRaw
            .map(student => ({
              id: uuidStringify(student.id),
              first_name: student.first_name,
              last_name: student.last_name,
              class_id: student.class_id ? uuidStringify(student.class_id) : null,
            }));
    
          const responseData = {
            students,
            classes,
          };
    
          return res.status(200).json(createSuccessResponse(responseData,'Exam participants retrieved successfully.'));
    
        } else if (user.role === UserType.Teacher) {
    
          const teacher_id = user.userId;
    
          const teacherClassesRaw = await getClassesByTeacher(teacher_id);
          console.log(teacherClassesRaw);
          const classes = teacherClassesRaw.map((cls: any) => ({
              id: cls.id,
              name: cls.name,
              yearbook: cls.yearbook,
              teacher_id: cls.teacher_id ? cls.teacher_id : null,
            }));
    
          const teacherClassIdsBuffers = teacherClassesRaw.map((cls) => Buffer.from(uuidParse(cls.id as string)));
          const studentsInTeacherClassesRaw = await prisma.students.findMany({
              where: {
                class_id: {
                  in: teacherClassIdsBuffers,
                },
              },
            });
    
          const students: Student[] = studentsInTeacherClassesRaw.map(
              (student: any) => ({
                id: uuidStringify(student.id),
                first_name: student.first_name,
                last_name: student.last_name,
                class_id: student.class_id ? uuidStringify(student.class_id) : null,
              })
            );
            const responseData = {
                students,
                classes,
            };
            console.log(responseData);
            return res.status(200).json(createSuccessResponse(responseData,'Exam participants retrieved successfully.'));

          };
      } catch (error) {
      console.error('Error fetching exam participants:', error);
      return res.status(500).json(createErrorResponse('An unexpected error occurred while fetching the exam participants. Please try again later.'));
    }
};

export const assignParticipantsToExam = async (req: Request, res: Response) => {
    try {
        const { exam_id } = req.params;
        const { classes, students } = req.body;
  
        let examIdBuffer: Buffer;
        try {
            if (!isUUID(exam_id)) throw new Error('Invalid UUID');
            const uuidBytes = uuidParse(exam_id);
            examIdBuffer = Buffer.from(uuidBytes);
        } catch (e) {
            return res.status(400).json(createErrorResponse('Invalid exam ID format.'));
        }
  
        const exam = await prisma.exams.findUnique({
            where: { id: examIdBuffer },
        });
  
        if (!exam) {
            return res.status(404).json(createErrorResponse('Exam not found.'));
        }
  
        const alreadyAssignedClasses = await prisma.classes_exams.findMany({
            where: { exam_id: examIdBuffer },
            select: { class_id: true },
        });
  
        const alreadyAssignedClassIdBuffers = alreadyAssignedClasses.map(entry => entry.class_id);
  
        const assignedClassIdBuffers: Buffer[] = [...alreadyAssignedClassIdBuffers];
  
        const operations: any[] = [];
  
        if (classes && Array.isArray(classes)) {
            for (const classId of classes) {
                let classIdBuffer: Buffer;
                try {
                    if (!isUUID(classId)) throw new Error('Invalid UUID');
                    const uuidBytes = uuidParse(classId);
                    classIdBuffer = Buffer.from(uuidBytes);
                } catch (e) {
                    return res.status(400).json(createErrorResponse(`Invalid class ID format: ${classId}`));
                }
  
                const classExists = await prisma.classes.findUnique({
                    where: { id: classIdBuffer },
                });
  
                if (!classExists) {
                    return res.status(404).json(createErrorResponse(`Class not found: ${classId}`));
                }
  
                const isAlreadyAssigned = alreadyAssignedClassIdBuffers.some(existingClassIdBuffer => existingClassIdBuffer.equals(classIdBuffer));
  
                if (!isAlreadyAssigned) {
                    operations.push(
                        prisma.classes_exams.create({
                            data: {
                                class_id: classIdBuffer,
                                exam_id: examIdBuffer,
                            },
                        })
                    );
                    assignedClassIdBuffers.push(classIdBuffer);
                }
            }
  
            if (assignedClassIdBuffers.length > 0) {
                const studentsInClasses = await prisma.students.findMany({
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
                    operations.push(
                        prisma.students_exams.deleteMany({
                            where: {
                                students_id: {
                                    in: studentIdsToRemove,
                                },
                                exam_id: examIdBuffer,
                            },
                        })
                    );
                }
            }
        }
  
        if (students && Array.isArray(students)) {
            for (const studentId of students) {
                let studentIdBuffer: Buffer;
                try {
                    if (!isUUID(studentId)) throw new Error('Invalid UUID');
                    const uuidBytes = uuidParse(studentId);
                    studentIdBuffer = Buffer.from(uuidBytes);
                } catch (e) {
                    return res.status(400).json(createErrorResponse(`Invalid student ID format: ${studentId}`));
                }
  
                const studentRecord = await prisma.students.findUnique({
                    where: { id: studentIdBuffer },
                    select: {
                        id: true,
                        class_id: true,
                    },
                });
  
                if (!studentRecord) {
                    return res.status(404).json(createErrorResponse(`Student not found: ${studentId}`));
                }
  
                let isStudentInAssignedClass = false;
                if (studentRecord.class_id !== null) {
                    isStudentInAssignedClass = assignedClassIdBuffers.some(classIdBuffer => classIdBuffer.equals(studentRecord.class_id!));
                }
                
  
                if (isStudentInAssignedClass) {
                    continue;
                }
  
                const existingStudentExam = await prisma.students_exams.findUnique({
                    where: {
                        students_id_exam_id: {
                            students_id: studentIdBuffer,
                            exam_id: examIdBuffer,
                        },
                    },
                });
  
                if (!existingStudentExam) {
                    operations.push(
                        prisma.students_exams.create({
                            data: {
                                students_id: studentIdBuffer,
                                exam_id: examIdBuffer,
                            },
                        })
                    );
                }
            }
        }
  
        if (operations.length > 0) {
            await prisma.$transaction(operations);
        }
  
        return res.status(200).json(createSuccessResponse(null, 'Participants assigned to exam successfully.'));
    } catch (error) {
        console.error('Error assigning participants to exam:', error);
        return res.status(500).json(createErrorResponse('An unexpected error occurred while assigning participants to the exam. Please try again later.'));
    }
};

export const removeParticipantsFromExam = async (req: Request, res: Response) => {
  try {
      const { exam_id } = req.params;
      const { classes, students } = req.body;

      let examIdBuffer: Buffer;
      try {
          if (!isUUID(exam_id)) throw new Error('Invalid UUID');
          const uuidBytes = uuidParse(exam_id);
          examIdBuffer = Buffer.from(uuidBytes);
      } catch (e) {
          return res.status(400).json(createErrorResponse('Invalid exam ID format.'));
      }

      const exam = await prisma.exams.findUnique({
          where: { id: examIdBuffer },
      });

      if (!exam) {
          return res.status(404).json(createErrorResponse('Exam not found.'));
      }

      const operations: any[] = [];

      if (classes && Array.isArray(classes)) {
          for (const classId of classes) {
              let classIdBuffer: Buffer;
              try {
                  if (!isUUID(classId)) throw new Error('Invalid UUID');
                  const uuidBytes = uuidParse(classId);
                  classIdBuffer = Buffer.from(uuidBytes);
              } catch (e) {
                  return res.status(400).json(createErrorResponse(`Invalid class ID format: ${classId}`));
              }

              const classExists = await prisma.classes.findUnique({
                  where: { id: classIdBuffer },
              });

              if (!classExists) {
                  return res.status(404).json(createErrorResponse(`Class not found: ${classId}`));
              }

              const existingClassExam = await prisma.classes_exams.findUnique({
                  where: {
                      class_id_exam_id: {
                          class_id: classIdBuffer,
                          exam_id: examIdBuffer,
                      },
                  },
              });

              if (existingClassExam) {
                  operations.push(
                      prisma.classes_exams.delete({
                          where: {
                              class_id_exam_id: {
                                  class_id: classIdBuffer,
                                  exam_id: examIdBuffer,
                              },
                          },
                      })
                  );
              }
          }
      }

      if (students && Array.isArray(students)) {
          for (const studentId of students) {
              let studentIdBuffer: Buffer;
              try {
                  if (!isUUID(studentId)) throw new Error('Invalid UUID');
                  const uuidBytes = uuidParse(studentId);
                  studentIdBuffer = Buffer.from(uuidBytes);
              } catch (e) {
                  return res.status(400).json(createErrorResponse(`Invalid student ID format: ${studentId}`));
              }

              const studentExists = await prisma.students.findUnique({
                  where: { id: studentIdBuffer },
              });

              if (!studentExists) {
                  return res.status(404).json(createErrorResponse(`Student not found: ${studentId}`));
              }

              const existingStudentExam = await prisma.students_exams.findUnique({
                  where: {
                      students_id_exam_id: {
                          students_id: studentIdBuffer,
                          exam_id: examIdBuffer,
                      },
                  },
              });

              if (existingStudentExam) {
                  operations.push(
                      prisma.students_exams.delete({
                          where: {
                              students_id_exam_id: {
                                  students_id: studentIdBuffer,
                                  exam_id: examIdBuffer,
                              },
                          },
                      })
                  );
              }
          }
      }

      if (operations.length > 0) {
          await prisma.$transaction(operations);
      }

      return res.status(200).json(createSuccessResponse(null, 'Participants removed from exam successfully.'));
  } catch (error) {
      console.error('Error removing participants from exam:', error);
      return res.status(500).json(createErrorResponse('An unexpected error occurred while removing participants from the exam. Please try again later.'));
  }
};

export const getAllExamQuestions = async (req: Request, res: Response) => {
    try {
        const { exam_id } = req.params;

        if (!exam_id || !isUUID(exam_id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid exam ID format.',
            });
        }

        const examIdBuffer = Buffer.from(uuidParse(exam_id));

        const exam = await prisma.exams.findUnique({
            where: { id: examIdBuffer },
        });

        if (!exam) {
            return res.status(404).json({
                success: false,
                message: 'Exam not found.',
            });
        }

        const openQuestions = await prisma.open_questions.findMany({
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


        const closedQuestions = await prisma.closed_questions.findMany({
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

        const mappedOpenQuestions: SelectedQuestion[] = openQuestions.map(q => ({
            id: uuidStringify(q.id),
            description: q.description || '',
            type: 'OPEN',
            score: q.score,
            is_multiple: null,
            auto_check: q.auto_check || '',
            answers: q.open_answers.map(a => ({
                id: uuidStringify(a.id),
                description: a.description || '',
            })),
        }));

        const mappedClosedQuestions: SelectedQuestion[] = closedQuestions.map(q => ({
            id: uuidStringify(q.id),
            description: q.description || '',
            type: 'CLOSED',
            score: q.score || undefined,
            is_multiple: q.is_multiple,
            answers: q.closed_answers.map(a => ({
                id: uuidStringify(a.id),
                description: a.description || '',
                is_correct: a.is_correct,
            })),
        }));

        const allQuestions: SelectedQuestion[] = [
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

    } catch (error) {
        console.error('Error fetching exam questions:', error);
        return res.status(500).json({
            success: false,
            message: 'An unexpected error occurred while fetching the exam questions. Please try again later.',
        });
    }
};

