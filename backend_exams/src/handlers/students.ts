import { Request, Response } from 'express';
import { signUp } from './users.js';
import prisma from '../db';
import { createErrorResponse, createSuccessResponse } from '../interfaces/responseInterfaces';
import { convertBuffersToUUIDs } from '../utils/uuidUtils.js';
import { UserType } from '../enums/userTypes.js';
export const signUpStudent = (req: Request, res: Response) => {
    return signUp(req, res, UserType.Student);
};

export const getAllStudents = async (req: Request, res: Response) => {
    try {
        const students = await prisma.students.findMany({
            select: {
                id: true,
                pesel: true,
                email: true,
                phone_number: true,
                first_name: true,
                last_name: true,
                reset_password_token: true,
                reset_password_expires: true,
                class_id: true,
            },
        });

        const convertedStudents = convertBuffersToUUIDs(students);

        return res.status(200).json(createSuccessResponse(convertedStudents, 'Students retrieved successfully.'));
    } catch (error) {
        console.error('Error fetching students:', error);
        return res.status(500).json(createErrorResponse('An unexpected error occurred while fetching the students. Please try again later.'));
    }
};