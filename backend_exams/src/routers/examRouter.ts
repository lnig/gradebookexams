import { Router } from 'express';
import { authenticate, authorize } from '../modules/auth.js';
import { addQuestionsToExam, upsertQuestionsToExam } from '../handlers/questions';
import { validateAddQuestions } from '../validations/questionsValidation';
import { validateAssignParticipants, validateRemoveParticipants } from '../validations/assignParticipantsToExamValidation.js';
import { validateCreateExam, validateDeleteExam, validateGetExam, validateStartExamAttempt, validateUpdateExam, validateGetExamResults, validateShowOpenAnswersToGrade, validateShowAllOpenAnswersToGrade } from '../validations/examValidation.js';
import { validateSaveAttempt, validateGetAttemptDetails } from '../validations/attemptValidation.js';
import { createExam, getExam, getExams, getExamParticipants, getExamParticipantsForNewExam, deleteExam, removeParticipantsFromExam, getAllExamQuestions, updateExam, getGradebookExams } from '../handlers/exams.js';
import { getUserAttempts, startExamAttempt, saveAttempt, getAttemptDetails } from '../handlers/attempts.js';
import { getAllAttemptsToGrade, showOpenAnswersToGrade, showAllOpenAnswersToGrade, gradeOpenAnswers, getExamResults, checkExamState, gradeExam} from '../handlers/grading.js';
import { handleInputErrors } from '../modules/middleware';
import { assignParticipantsToExam } from '../handlers/exams.js';
import { validateGradeAttempt } from '../validations/gradingValidation.js';
import { UserType } from '../enums/userTypes.js';

const examRouter = Router();

examRouter.post('/createExam',
    authenticate,
    authorize([UserType.Teacher]),
    validateCreateExam(),
    handleInputErrors,
    createExam
);

examRouter.get('/NewExamParticipants',
    authenticate,
    authorize([UserType.Administrator, UserType.Teacher]),
    // validateGetExam(),
    handleInputErrors,
    getExamParticipantsForNewExam
);
//  nowy endpoint //////////////////////////////////
examRouter.get('/getGradebookExams',
    authenticate,
    authorize([UserType.Teacher]),
    // validateGetExam(),
    handleInputErrors,
    getGradebookExams
);

examRouter.get('/getExams',
    authenticate,
    authorize([UserType.Student,UserType.Administrator, UserType.Teacher]),
    // validateGetExam(),
    handleInputErrors,
    getExams
);

examRouter.get('/:exam_id/getExamQuestions',
    authenticate,
    authorize([UserType.Administrator, UserType.Teacher]),
    // validateGetExam(),
    handleInputErrors,
    getAllExamQuestions
);

examRouter.get('/:exam_id/getAllAttemptsToGrade',
    authenticate,
    authorize([UserType.Administrator, UserType.Teacher]),
    // validateGetExam(),
    handleInputErrors,
    getAllAttemptsToGrade
);

examRouter.get('/getMyAttempts/:exam_id',
    authenticate,
    authorize([UserType.Student]),
    // validateGetExam(),
    handleInputErrors,
    getUserAttempts
);

examRouter.get('/:exam_id',
    authenticate,
    authorize([UserType.Student,UserType.Administrator, UserType.Teacher]),
    validateGetExam(),
    handleInputErrors,
    getExam
);


examRouter.get('/:exam_id/getParticipants',
    authenticate,
    authorize([UserType.Administrator, UserType.Teacher]),
    // validateGetExam(),
    handleInputErrors,
    getExamParticipants
);



examRouter.put('/update/:exam_id',
    authenticate,
    authorize([UserType.Teacher]),
    validateUpdateExam(),
    handleInputErrors,
    updateExam
);


examRouter.delete('/:exam_id',
    authenticate,
    authorize([UserType.Administrator, UserType.Teacher]),
    validateDeleteExam(),
    handleInputErrors,
    deleteExam
);
examRouter.post('/:exam_id/participants',
    authenticate,
    authorize([UserType.Administrator, UserType.Teacher]),
    validateAssignParticipants(),
    handleInputErrors,
    assignParticipantsToExam
);

examRouter.delete('/:exam_id/deleteparticipants',
    authenticate,
    authorize([UserType.Administrator, UserType.Teacher]),
    validateRemoveParticipants(),
    handleInputErrors,
    removeParticipantsFromExam
);



examRouter.post('/:exam_id/addquestions',
    authenticate,
    authorize([UserType.Administrator, UserType.Teacher]),
    validateAddQuestions(),
    handleInputErrors,
    addQuestionsToExam
);

examRouter.post('/:exam_id/upsertQuestionsToExam',
    authenticate,
    authorize([UserType.Administrator, UserType.Teacher]),
    // validateAddQuestions(),
    handleInputErrors,
    upsertQuestionsToExam
);

examRouter.get('/:exam_id/startAttempt',
    authenticate,
    authorize([UserType.Student]),
    validateStartExamAttempt(),
    handleInputErrors,
    startExamAttempt
);

examRouter.post('/saveAttempt/:attempt_id',
    authenticate,
    authorize([UserType.Student]),
    validateSaveAttempt(),
    handleInputErrors,
    saveAttempt
);

examRouter.get('/checkExamState/:exam_id',
    authenticate,
    authorize([UserType.Administrator, UserType.Teacher]),
    // validateSaveAttempt(),
    handleInputErrors,
    checkExamState
);

examRouter.get('/showOpenAnswersToGrade/:attempt_id', 
    authenticate,
    authorize([UserType.Administrator, UserType.Teacher]),
    validateShowOpenAnswersToGrade(),
    handleInputErrors,
    showOpenAnswersToGrade
);

examRouter.get('/showAllOpenAnswersToGrade/:exam_id', 
    authenticate,
    authorize([UserType.Administrator, UserType.Teacher]),
    validateShowAllOpenAnswersToGrade(),
    handleInputErrors,
    showAllOpenAnswersToGrade
);


examRouter.post('/gradeOpenAnswers', 
    authenticate,
    authorize([UserType.Administrator, UserType.Teacher]),
    validateGradeAttempt(),
    handleInputErrors,
    gradeOpenAnswers
);

examRouter.get('/:exam_id/results',     
    authenticate,
    authorize([UserType.Administrator, UserType.Teacher]),
    validateGetExamResults(),
    handleInputErrors,
    getExamResults
);


examRouter.get('/getAttemptDetails/:attemptId',     
    authenticate,
    authorize([UserType.Administrator, UserType.Teacher, UserType.Student]),
    validateGetAttemptDetails(),
    handleInputErrors,
    getAttemptDetails
);


examRouter.post('/gradeExam/:exam_id',
    authenticate,
    authorize([UserType.Administrator, UserType.Teacher]),
    // validateGetAttemptDetails(),
    handleInputErrors,
    gradeExam
  );

export default examRouter;