import { Request, Response } from 'express';
import { signUp } from './users.js';
import { UserType } from '../enums/userTypes.js';

export const signUpAdministrator = (req: Request, res: Response) => {
    return signUp(req, res, UserType.Administrator);
};