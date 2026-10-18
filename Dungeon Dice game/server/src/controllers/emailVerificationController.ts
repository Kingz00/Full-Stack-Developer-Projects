import type { Request, Response, NextFunction } from 'express';

import { AppError } from '../errors/AppError.js';
import { EmailVerificationService } from '../services/emailVerificationService.js';

export class EmailVerificationController {
    constructor(
        private readonly emailVerificationService: EmailVerificationService,
    ) { }

    async requestVerification(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.session.userId;

            if (userId === undefined) {
                throw new AppError(401, 'Authentication required.');
            }

            await this.emailVerificationService.requestVerification(
                userId,
            );

            res.status(202).json({
                message:
                    'If your account needs email verification, instructions will be sent to its registered email address.',
            });
        } catch (error) {
            next(error);
        }
    }

    verifyEmail(req: Request, res: Response, next: NextFunction): void {
        try {
            const { token } = req.body ?? {};

            // A 32-byte base64url token is 43 characters long.
            if (
                typeof token !== 'string' ||
                !/^[A-Za-z0-9_-]{43}$/.test(token)
            ) {
                throw new AppError(
                    400,
                    'The verification link is invalid, expired, or has already been used.',
                );
            }

            this.emailVerificationService.verifyEmail(token);

            res.status(200).json({
                message: 'Email address verified successfully.',
            });
        } catch (error) {
            next(error);
        }
    }
}
