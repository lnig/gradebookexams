import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { parse as uuidParse, stringify as uuidStringify } from "uuid";
import { createErrorResponse, createSuccessResponse } from '../interfaces/responseInterfaces';
import prisma from "../db";
import { UserType } from "../enums/userTypes";



export const getNotifications = async (req: Request, res: Response) => {
    const user = req.user;
    const student_id = user?.userId;

    if (!user || user.role != UserType.Student) {
        return res.status(401).json(createErrorResponse('Unauthorized'));
    }

    if (!student_id) {
        return res.status(400).json(createErrorResponse('Invalid student ID.'));
    }


    try {
        const studentIdBuffer = Buffer.from(uuidParse(student_id));

        const student = await prisma.students.findUnique({
            where: { id: studentIdBuffer },
            include: {
                classes: true,
            }
        });

        if (!student) {
            return res.status(404).json(createErrorResponse('Student not found.'));
        }


        const notifications = await prisma.notifications.findMany({
            where: {student_id : studentIdBuffer},
            orderBy: {
                notification_date: 'desc',
            },
        });
        const formattedNotifications = notifications.map(notification => ({
            id: uuidStringify(notification.id),
            student_id: uuidStringify(notification.student_id),
            description: notification.description,
            notification_date: notification.notification_date,
            is_read: notification.is_read,
            exam_id: notification.exam_id ? uuidStringify(notification.exam_id) : null,
        }));

        return res.status(200).json({ notifications: formattedNotifications });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        return res.status(500).json(createErrorResponse('Internal server error.'));
    }
};


export const markNotificationsAsRead = async (req: Request, res: Response) => {
    const user = req.user;
    const student_id = user?.userId;

    if (!user || user.role !== UserType.Student) {
        return res.status(401).json(createErrorResponse('Unauthorized'));
    }

    if (!student_id || typeof student_id !== 'string') {
        return res.status(400).json(createErrorResponse('Invalid student ID.'));
    }

    const { notification_ids } = req.body;

    if (!Array.isArray(notification_ids) || notification_ids.length === 0) {
        return res.status(400).json(createErrorResponse('Invalid notification_ids. It should be a non-empty array of UUIDs.'));
    }

    for (const id of notification_ids) {
        if (typeof id !== 'string') {
            return res.status(400).json(createErrorResponse(`Invalid notification ID format: ${id}`));
        }
    }

    try {
        const studentIdBuffer = Buffer.from(uuidParse(student_id));
        const notificationIdBuffers = notification_ids.map(id => Buffer.from(uuidParse(id)));

        const student = await prisma.students.findUnique({
            where: { id: studentIdBuffer },
            include: {
                classes: true,
            }
        });

        if (!student) {
            return res.status(404).json(createErrorResponse('Student not found.'));
        }

        const updateResult = await prisma.notifications.updateMany({
            where: {
                id: { in: notificationIdBuffers },
                student_id: studentIdBuffer,
                is_read: false,
            },
            data: {
                is_read: true,
            },
        });

        return res.status(200).json(createSuccessResponse({ updatedCount: updateResult.count },"Notifications updated successfully."));
    } catch (error) {
        console.error('Error marking notifications as read:', error);
        return res.status(500).json(createErrorResponse('Internal server error.'));
    }
};