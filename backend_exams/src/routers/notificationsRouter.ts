import express from 'express';
import { getNotifications, markNotificationsAsRead } from '../handlers/notifications'; // Upewnij się, że ścieżka jest poprawna
import { authenticate, authorize } from '../modules/auth.js';
import { handleInputErrors } from '../modules/middleware';
import { UserType } from '../enums/userTypes';

const notificationsRouter = express.Router();


notificationsRouter.get('/getNotifications',
    authenticate,
    authorize([UserType.Student]),
    // validateCreateExam(),
    handleInputErrors,
    getNotifications
);


notificationsRouter.post('/markAsRead', 
    authenticate,
    authorize([UserType.Student]),
    // validateCreateExam(),
    handleInputErrors,
    markNotificationsAsRead
);


export default notificationsRouter;