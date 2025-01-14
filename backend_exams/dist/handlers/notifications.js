"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.markNotificationsAsRead = exports.getNotifications = void 0;
const uuid_1 = require("uuid");
const responseInterfaces_1 = require("../interfaces/responseInterfaces");
const db_1 = __importDefault(require("../db"));
const userTypes_1 = require("../enums/userTypes");
const getNotifications = async (req, res) => {
    const user = req.user;
    const student_id = user?.userId;
    if (!user || user.role != userTypes_1.UserType.Student) {
        return res.status(401).json((0, responseInterfaces_1.createErrorResponse)('Unauthorized'));
    }
    if (!student_id) {
        return res.status(400).json((0, responseInterfaces_1.createErrorResponse)('Invalid student ID.'));
    }
    try {
        const studentIdBuffer = Buffer.from((0, uuid_1.parse)(student_id));
        const student = await db_1.default.students.findUnique({
            where: { id: studentIdBuffer },
            include: {
                classes: true,
            }
        });
        if (!student) {
            return res.status(404).json((0, responseInterfaces_1.createErrorResponse)('Student not found.'));
        }
        const notifications = await db_1.default.notifications.findMany({
            where: { student_id: studentIdBuffer },
            orderBy: {
                notification_date: 'desc',
            },
        });
        const formattedNotifications = notifications.map(notification => ({
            id: (0, uuid_1.stringify)(notification.id),
            student_id: (0, uuid_1.stringify)(notification.student_id),
            description: notification.description,
            notification_date: notification.notification_date,
            is_read: notification.is_read,
            exam_id: notification.exam_id ? (0, uuid_1.stringify)(notification.exam_id) : null,
        }));
        return res.status(200).json({ notifications: formattedNotifications });
    }
    catch (error) {
        console.error('Error fetching notifications:', error);
        return res.status(500).json((0, responseInterfaces_1.createErrorResponse)('Internal server error.'));
    }
};
exports.getNotifications = getNotifications;
const markNotificationsAsRead = async (req, res) => {
    const user = req.user;
    const student_id = user?.userId;
    if (!user || user.role !== userTypes_1.UserType.Student) {
        return res.status(401).json((0, responseInterfaces_1.createErrorResponse)('Unauthorized'));
    }
    if (!student_id || typeof student_id !== 'string') {
        return res.status(400).json((0, responseInterfaces_1.createErrorResponse)('Invalid student ID.'));
    }
    const { notification_ids } = req.body;
    if (!Array.isArray(notification_ids) || notification_ids.length === 0) {
        return res.status(400).json((0, responseInterfaces_1.createErrorResponse)('Invalid notification_ids. It should be a non-empty array of UUIDs.'));
    }
    for (const id of notification_ids) {
        if (typeof id !== 'string') {
            return res.status(400).json((0, responseInterfaces_1.createErrorResponse)(`Invalid notification ID format: ${id}`));
        }
    }
    try {
        const studentIdBuffer = Buffer.from((0, uuid_1.parse)(student_id));
        const notificationIdBuffers = notification_ids.map(id => Buffer.from((0, uuid_1.parse)(id)));
        const student = await db_1.default.students.findUnique({
            where: { id: studentIdBuffer },
            include: {
                classes: true,
            }
        });
        if (!student) {
            return res.status(404).json((0, responseInterfaces_1.createErrorResponse)('Student not found.'));
        }
        const updateResult = await db_1.default.notifications.updateMany({
            where: {
                id: { in: notificationIdBuffers },
                student_id: studentIdBuffer,
                is_read: false,
            },
            data: {
                is_read: true,
            },
        });
        return res.status(200).json((0, responseInterfaces_1.createSuccessResponse)({ updatedCount: updateResult.count }, "Notifications updated successfully."));
    }
    catch (error) {
        console.error('Error marking notifications as read:', error);
        return res.status(500).json((0, responseInterfaces_1.createErrorResponse)('Internal server error.'));
    }
};
exports.markNotificationsAsRead = markNotificationsAsRead;
