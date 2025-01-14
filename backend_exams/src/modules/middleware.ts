import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';

export const handleInputErrors = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.error("Validation errors:", errors.array());
        return res.status(400).json({
            errors: errors.array(),
            message: 'Validation failed.',
        });
    }
    next();
}