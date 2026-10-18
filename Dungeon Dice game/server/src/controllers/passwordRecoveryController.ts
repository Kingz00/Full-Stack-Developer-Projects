import type { Request, Response, NextFunction } from 'express';

import { AppError } from '../errors/AppError.js';
import { PasswordRecoveryService } from '../services/passwordRecoveryService.js';

export class PasswordRecoveryController {
    constructor(
        private readonly passwordRecoveryService: PasswordRecoveryService,
    ) { }

    async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const email = req.body?.email;

            if (
                typeof email !== 'string' ||
                email.trim() === '' ||
                email.length > 254 ||
                !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
            ) {
                throw new AppError(400, 'A valid email address is required.');
            }

            const message = await this.passwordRecoveryService.requestPasswordReset(email);

            res.status(202).json({ message });
        } catch (error) {
            next(error);
        }
    }

    async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { token, password } = req.body ?? {};

            if (
                typeof token !== 'string' ||
                !/^[A-Za-z0-9_-]{43}$/.test(token)
            ) {
                throw new AppError(
                    400,
                    'The password-reset link is invalid, expired, or has already been used.',
                );
            }

            if (
                typeof password !== 'string' ||
                password.length === 0
            ) {
                throw new AppError(400, 'A new password is required.');
            }

            await this.passwordRecoveryService.resetPassword(token, password);

            res.status(200).json({
                message: 'Password has been reset successfully.',
            });
        } catch (error) {
            next(error);
        }
    }

    async forgotUsername(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const email = req.body?.email;

            if (
                typeof email !== 'string' ||
                email.trim() === '' ||
                email.length > 254 ||
                !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
            ) {
                throw new AppError(400, 'A valid email address is required.');
            }

            const message = await this.passwordRecoveryService.recoverUsername(email);

            res.status(202).json({ message });
        } catch (error) {
            next(error);
        }
    }
}
