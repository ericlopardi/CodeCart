import { Request, Response } from 'express';
import { z } from 'zod';
import { 
    PASSWORD_REGEX, 
    PHONE_NUMBER_REGEX, 
    STATUS_CODE, 
    MIN_PASSWORD_LENGTH, 
    MIN_NAME_LENGTH, 
    MAX_NAME_LENGTH, 
    MAX_PHONE_NUMBER_LENGTH,
    MIN_PHONE_NUMBER_LENGTH,
    BIRTH_DATE_REGEX
} from '../../utils/constants';
import { initRegister } from '../../services/auth/registerService';

const registerSchema = z.object({
    email: z.email(),
    password: z.string().min(MIN_PASSWORD_LENGTH).regex(PASSWORD_REGEX),
    firstName: z.string().min(MIN_NAME_LENGTH).max(MAX_NAME_LENGTH),
    lastName: z.string().min(MIN_NAME_LENGTH).max(MAX_NAME_LENGTH),
    phoneNumber: z.string().min(MIN_PHONE_NUMBER_LENGTH).max(MAX_PHONE_NUMBER_LENGTH).regex(PHONE_NUMBER_REGEX).optional(),
    birthDate: z.string()
        .regex(BIRTH_DATE_REGEX, "Birth date must be in YYYYMMDD format")
        .transform((dateStr) => {
            const year = parseInt(dateStr.substring(0, 4));
            const month = parseInt(dateStr.substring(4, 6)) - 1; // month is 0-indexed in javascript
            const day = parseInt(dateStr.substring(6, 8));
            return new Date(year, month, day);
        })
        .refine((date) => date >= new Date(1900, 0, 1), "Birth date must be after 1900")
        .optional()
})

export const handleRegister = async (req: Request, res: Response) => {
    const validation = registerSchema.safeParse(req.body);
    if (!validation.success) {
        const message = validation.error.issues.map(issue => issue.message).join(', ');
        return res.status(STATUS_CODE.HTTP_BAD_REQUEST).json({
            error: `Validation failed: ${message}`
        });
    }
    try {
        const registerResult = await initRegister(req);
        return res.status(STATUS_CODE.HTTP_OK).json({
            id: registerResult.id,
            email: registerResult.email,
            accessToken: registerResult.accessToken,
            refreshToken: registerResult.refreshToken,
            expiresIn: registerResult.expiresIn
        });
    } catch (error) {
        res.status(STATUS_CODE.HTTP_INTERNAL_SERVER_ERROR).json({
            error: error.message
        });
    }
}