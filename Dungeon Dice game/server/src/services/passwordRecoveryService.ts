import { createHash, randomBytes } from 'node:crypto';
import bcrypt from 'bcrypt';

import { AppError } from '../errors/AppError.js';
import { PasswordResetRepository } from '../repositories/passwordResetRepository.js';
import { UserRepository } from '../repositories/userRepository.js';
import type { EmailSender } from './emailSender.js';

const SALT_ROUNDS = 12;
const RESET_TOKEN_LIFETIME_MS = 60 * 60 * 1000;

const GENERIC_RECOVERY_MESSAGE = 'If an account matches that email address, instructions will be sent to it.';

function generateToken(): string {
    return randomBytes(32).toString('base64url');
}

function hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
}

function normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
}

export class PasswordRecoveryService {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly passwordResetRepository: PasswordResetRepository,
        private readonly emailSender: EmailSender,
        private readonly frontendOrigin: string,
    ) { }

    async requestPasswordReset(emailInput: string): Promise<string> {
        // Check provider readiness before looking up the email. This keeps
        // the response the same for known and unknown addresses.
        this.ensureEmailDeliveryConfigured();

        const email = normalizeEmail(emailInput);
        const user = this.userRepository.findByEmail(email);

        if (!user || !user.email) {
            return GENERIC_RECOVERY_MESSAGE;
        }

        const token = generateToken();
        const tokenHash = hashToken(token);
        const now = new Date();
        const expiresAt = new Date(
            now.getTime() + RESET_TOKEN_LIFETIME_MS,
        );

        this.passwordResetRepository.replaceTokenForUser({
            userId: user.id,
            tokenHash,
            expiresAt: expiresAt.toISOString(),
            now: now.toISOString(),
        });

        const resetUrl = new URL('/reset-password', this.frontendOrigin);
        resetUrl.searchParams.set('token', token);

        try {
            await this.emailSender.sendPasswordResetEmail({
                to: user.email,
                resetUrl: resetUrl.toString(),
            });
        } catch {
            // Never leave a usable reset token behind if delivery fails.
            this.passwordResetRepository.invalidateToken(
                tokenHash,
                new Date().toISOString(),
            );

            // Keep the public response generic to avoid account enumeration.
            return GENERIC_RECOVERY_MESSAGE;
        }

        return GENERIC_RECOVERY_MESSAGE;
    }

    async resetPassword(token: string, newPassword: string): Promise<void> {
        if (newPassword.length === 0) {
            throw new AppError(400, 'A new password is required.');
        }

        const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

        const resetSucceeded = this.passwordResetRepository.resetPassword(
            hashToken(token),
            passwordHash,
            new Date().toISOString(),
        );

        if (!resetSucceeded) {
            throw new AppError(
                400,
                'The password-reset link is invalid, expired, or has already been used.',
            );
        }
    }

    async recoverUsername(emailInput: string): Promise<string> {
        this.ensureEmailDeliveryConfigured();

        const email = normalizeEmail(emailInput);
        const user = this.userRepository.findByEmail(email);

        if (!user || !user.email) {
            return GENERIC_RECOVERY_MESSAGE;
        }

        try {
            await this.emailSender.sendUsernameRecoveryEmail({
                to: user.email,
                username: user.username,
            });
        } catch {
            // Do not reveal whether the account exists or delivery failed.
        }

        return GENERIC_RECOVERY_MESSAGE;
    }

    private ensureEmailDeliveryConfigured(): void {
        if (!this.emailSender.isConfigured()) {
            throw new AppError(
                503,
                'Email delivery is not configured.',
            );
        }
    }
}
