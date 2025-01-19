import express from 'express';
import { getNotifications, markNotificationsAsRead } from '../handlers/notifications';
import { authenticate, authorize } from '../modules/auth.js';
import { handleInputErrors } from '../modules/middleware';
import { UserType } from '../enums/userTypes';

const notificationsRouter = express.Router();

notificationsRouter.get('/getNotifications',
    authenticate,
    authorize([UserType.Student]),
    handleInputErrors,
    getNotifications
);

notificationsRouter.post('/markAsRead', 
    authenticate,
    authorize([UserType.Student]),
    handleInputErrors,
    markNotificationsAsRead
);

export default notificationsRouter;