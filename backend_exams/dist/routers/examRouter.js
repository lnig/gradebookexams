"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_js_1 = require("../modules/auth.js");
const questions_1 = require("../handlers/questions");
const questionsValidation_1 = require("../validations/questionsValidation");
const assignParticipantsToExamValidation_js_1 = require("../validations/assignParticipantsToExamValidation.js");
const examValidation_js_1 = require("../validations/examValidation.js");
const attemptValidation_js_1 = require("../validations/attemptValidation.js");
const exams_js_1 = require("../handlers/exams.js");
const attempts_js_1 = require("../handlers/attempts.js");
const grading_js_1 = require("../handlers/grading.js");
const middleware_1 = require("../modules/middleware");
const exams_js_2 = require("../handlers/exams.js");
const gradingValidation_js_1 = require("../validations/gradingValidation.js");
const userTypes_js_1 = require("../enums/userTypes.js");
const examRouter = (0, express_1.Router)();
examRouter.post('/createExam', auth_js_1.authenticate, (0, auth_js_1.authorize)([userTypes_js_1.UserType.Teacher]), (0, examValidation_js_1.validateCreateExam)(), middleware_1.handleInputErrors, exams_js_1.createExam);
examRouter.get('/NewExamParticipants', auth_js_1.authenticate, (0, auth_js_1.authorize)([userTypes_js_1.UserType.Administrator, userTypes_js_1.UserType.Teacher]), 
// validateGetExam(),
middleware_1.handleInputErrors, exams_js_1.getExamParticipantsForNewExam);
examRouter.get('/checkAttemptEligibility/:exam_id', auth_js_1.authenticate, (0, auth_js_1.authorize)([userTypes_js_1.UserType.Student]), 
// validateGetExam(),
middleware_1.handleInputErrors, attempts_js_1.checkAttemptEligibility);
examRouter.get('/getGradebookExams', auth_js_1.authenticate, (0, auth_js_1.authorize)([userTypes_js_1.UserType.Teacher, userTypes_js_1.UserType.Administrator]), 
// validateGetExam(),
middleware_1.handleInputErrors, exams_js_1.getGradebookExams);
examRouter.get('/getExams', auth_js_1.authenticate, (0, auth_js_1.authorize)([userTypes_js_1.UserType.Student, userTypes_js_1.UserType.Administrator, userTypes_js_1.UserType.Teacher]), 
// validateGetExam(),
middleware_1.handleInputErrors, exams_js_1.getExams);
examRouter.get('/:exam_id/getExamQuestions', auth_js_1.authenticate, (0, auth_js_1.authorize)([userTypes_js_1.UserType.Administrator, userTypes_js_1.UserType.Teacher]), 
// validateGetExam(),
middleware_1.handleInputErrors, exams_js_1.getAllExamQuestions);
examRouter.get('/:exam_id/getAllAttemptsToGrade', auth_js_1.authenticate, (0, auth_js_1.authorize)([userTypes_js_1.UserType.Administrator, userTypes_js_1.UserType.Teacher]), 
// validateGetExam(),
middleware_1.handleInputErrors, grading_js_1.getAllAttemptsToGrade);
examRouter.get('/getMyAttempts/:exam_id', auth_js_1.authenticate, (0, auth_js_1.authorize)([userTypes_js_1.UserType.Student]), 
// validateGetExam(),
middleware_1.handleInputErrors, attempts_js_1.getUserAttempts);
examRouter.get('/:exam_id', auth_js_1.authenticate, (0, auth_js_1.authorize)([userTypes_js_1.UserType.Student, userTypes_js_1.UserType.Administrator, userTypes_js_1.UserType.Teacher]), (0, examValidation_js_1.validateGetExam)(), middleware_1.handleInputErrors, exams_js_1.getExam);
examRouter.get('/:exam_id/getParticipants', auth_js_1.authenticate, (0, auth_js_1.authorize)([userTypes_js_1.UserType.Administrator, userTypes_js_1.UserType.Teacher]), 
// validateGetExam(),
middleware_1.handleInputErrors, exams_js_1.getExamParticipants);
examRouter.put('/update/:exam_id', auth_js_1.authenticate, (0, auth_js_1.authorize)([userTypes_js_1.UserType.Teacher, userTypes_js_1.UserType.Administrator]), (0, examValidation_js_1.validateUpdateExam)(), middleware_1.handleInputErrors, exams_js_1.updateExam);
examRouter.delete('/:exam_id', auth_js_1.authenticate, (0, auth_js_1.authorize)([userTypes_js_1.UserType.Administrator, userTypes_js_1.UserType.Teacher]), (0, examValidation_js_1.validateDeleteExam)(), middleware_1.handleInputErrors, exams_js_1.deleteExam);
examRouter.post('/:exam_id/participants', auth_js_1.authenticate, (0, auth_js_1.authorize)([userTypes_js_1.UserType.Administrator, userTypes_js_1.UserType.Teacher]), (0, assignParticipantsToExamValidation_js_1.validateAssignParticipants)(), middleware_1.handleInputErrors, exams_js_2.assignParticipantsToExam);
examRouter.delete('/:exam_id/deleteparticipants', auth_js_1.authenticate, (0, auth_js_1.authorize)([userTypes_js_1.UserType.Administrator, userTypes_js_1.UserType.Teacher]), (0, assignParticipantsToExamValidation_js_1.validateRemoveParticipants)(), middleware_1.handleInputErrors, exams_js_1.removeParticipantsFromExam);
examRouter.post('/:exam_id/addquestions', auth_js_1.authenticate, (0, auth_js_1.authorize)([userTypes_js_1.UserType.Administrator, userTypes_js_1.UserType.Teacher]), (0, questionsValidation_1.validateAddQuestions)(), middleware_1.handleInputErrors, questions_1.addQuestionsToExam);
examRouter.post('/:exam_id/upsertQuestionsToExam', auth_js_1.authenticate, (0, auth_js_1.authorize)([userTypes_js_1.UserType.Administrator, userTypes_js_1.UserType.Teacher]), 
// validateAddQuestions(),
middleware_1.handleInputErrors, questions_1.upsertQuestionsToExam);
examRouter.get('/:exam_id/startAttempt', auth_js_1.authenticate, (0, auth_js_1.authorize)([userTypes_js_1.UserType.Student]), (0, examValidation_js_1.validateStartExamAttempt)(), middleware_1.handleInputErrors, attempts_js_1.startExamAttempt);
examRouter.post('/saveAttempt/:attempt_id', auth_js_1.authenticate, (0, auth_js_1.authorize)([userTypes_js_1.UserType.Student]), (0, attemptValidation_js_1.validateSaveAttempt)(), middleware_1.handleInputErrors, attempts_js_1.saveAttempt);
examRouter.get('/checkExamState/:exam_id', auth_js_1.authenticate, (0, auth_js_1.authorize)([userTypes_js_1.UserType.Administrator, userTypes_js_1.UserType.Teacher]), 
// validateSaveAttempt(),
middleware_1.handleInputErrors, grading_js_1.checkExamState);
examRouter.get('/showOpenAnswersToGrade/:attempt_id', auth_js_1.authenticate, (0, auth_js_1.authorize)([userTypes_js_1.UserType.Administrator, userTypes_js_1.UserType.Teacher]), (0, examValidation_js_1.validateShowOpenAnswersToGrade)(), middleware_1.handleInputErrors, grading_js_1.showOpenAnswersToGrade);
examRouter.get('/showAllOpenAnswersToGrade/:exam_id', auth_js_1.authenticate, (0, auth_js_1.authorize)([userTypes_js_1.UserType.Administrator, userTypes_js_1.UserType.Teacher]), (0, examValidation_js_1.validateShowAllOpenAnswersToGrade)(), middleware_1.handleInputErrors, grading_js_1.showAllOpenAnswersToGrade);
examRouter.post('/gradeOpenAnswers', auth_js_1.authenticate, (0, auth_js_1.authorize)([userTypes_js_1.UserType.Administrator, userTypes_js_1.UserType.Teacher]), (0, gradingValidation_js_1.validateGradeAttempt)(), middleware_1.handleInputErrors, grading_js_1.gradeOpenAnswers);
examRouter.get('/:exam_id/results', auth_js_1.authenticate, (0, auth_js_1.authorize)([userTypes_js_1.UserType.Administrator, userTypes_js_1.UserType.Teacher]), (0, examValidation_js_1.validateGetExamResults)(), middleware_1.handleInputErrors, grading_js_1.getExamResults);
examRouter.get('/getAttemptDetails/:attemptId', auth_js_1.authenticate, (0, auth_js_1.authorize)([userTypes_js_1.UserType.Administrator, userTypes_js_1.UserType.Teacher, userTypes_js_1.UserType.Student]), (0, attemptValidation_js_1.validateGetAttemptDetails)(), middleware_1.handleInputErrors, attempts_js_1.getAttemptDetails);
examRouter.post('/gradeExam/:exam_id', auth_js_1.authenticate, (0, auth_js_1.authorize)([userTypes_js_1.UserType.Administrator, userTypes_js_1.UserType.Teacher]), 
// validateGetAttemptDetails(),
middleware_1.handleInputErrors, grading_js_1.gradeExam);
exports.default = examRouter;
