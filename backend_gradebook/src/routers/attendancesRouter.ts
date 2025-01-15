import { Router } from 'express';
import { handleInputErrors } from '../modules/middleware.js';
import { createAttendances, getLessonAttendances, getAttendancesStatistics, getClassAttendances, getStudentAttendances, getStudentAttendancesByDate, excuseAbsencesForStudent, updateAttendance, excuseAbsencesForStudentByDate } from '../handlers/attendances.js';
import { authenticate, authorize } from '../modules/auth.js';
import { validateCreateAttendances, validateGetAttendances, validateGetAttendancesByDate, validateGetClassAttendances, validateStudentId, validateUpdateAttendance } from '../validations/attendancesValidation.js';
import { UserType } from '../enums/userTypes.js';

const attendancesRouter = Router();

attendancesRouter.get('/student/:studentId/by-date/:date',
    authenticate,
    authorize([UserType.Administrator, UserType.Teacher, UserType.Parent, UserType.Student]),
    validateGetAttendancesByDate(),
    handleInputErrors,
    getStudentAttendancesByDate
);

attendancesRouter.get('/student/:studentId',
    authenticate,
    authorize([UserType.Administrator, UserType.Teacher, UserType.Parent, UserType.Student]),
    validateStudentId(),
    handleInputErrors,
    getStudentAttendances
);

attendancesRouter.patch('/excuse/:studentId/by-date/:date',
    authenticate,
    authorize([UserType.Administrator, UserType.Teacher, UserType.Parent]),
    validateUpdateAttendance(),
    excuseAbsencesForStudentByDate
);

attendancesRouter.patch('/excuse/:studentId',
    authenticate,
    authorize([UserType.Administrator, UserType.Teacher, UserType.Parent]),
    validateUpdateAttendance(),
    excuseAbsencesForStudent
);

attendancesRouter.patch('/:attendanceId',
    authenticate,
    authorize([UserType.Administrator, UserType.Teacher]),
    validateUpdateAttendance(),
    handleInputErrors,
    updateAttendance
);

attendancesRouter.post('',
    authenticate,
    authorize([UserType.Administrator, UserType.Teacher]),
    validateCreateAttendances(),
    handleInputErrors,
    createAttendances
);

attendancesRouter.get('/:lessonId',
    authenticate,
    authorize([UserType.Administrator, UserType.Teacher]),
    validateGetAttendances(),
    handleInputErrors,
    getLessonAttendances
);

attendancesRouter.get('/statistics/:studentId',
    authenticate,
    authorize([UserType.Administrator, UserType.Teacher, UserType.Parent, UserType.Student]),
    validateStudentId(),
    handleInputErrors,
    getAttendancesStatistics
);

attendancesRouter.get('/class/:classId',
    authenticate,
    authorize([UserType.Administrator, UserType.Teacher, UserType.Student]),
    validateGetClassAttendances(),
    handleInputErrors,
    getClassAttendances
);

export default attendancesRouter;