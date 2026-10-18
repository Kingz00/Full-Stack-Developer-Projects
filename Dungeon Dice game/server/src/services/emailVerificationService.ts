import { createHash, randomBytes } from 'node:crypto';

import { AppError } from '../errors/AppError.js';
import { EmailVerificationRepository } from '../repositories/emailVerificationRepository.js';
import { UserRepository } from '../repositories/userRepository.js';
import type { EmailSender } from './emailSender.js';

const TOKEN_LIFETIME_MS = 24 * 60 * 60 * 1000;

function generateToken(): string {
    return randomBytes(32).toString('base64url');
}

function hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
}

export class EmailVerificationService {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly verificationRepository: EmailVerificationRepository,
        private readonly emailSender: EmailSender,
        private readonly frontendOrigin: string,
    ) { }

    async requestVerification(userId: number): Promise<void> {
        const user = this.userRepository.findById(userId);

        if (!user) {
            throw new AppError(404, 'User not found.');
        }

        // Legacy users without an email and users who have already
        // verified their address do not need another verification.
        if (!user.email || user.emailVerifiedAt !== null) {
            return;
        }

        if (!this.emailSender.isConfigured()) {
            throw new AppError(
                503,
                'Email delivery is not configured.',
            );
        }

        const token = generateToken();
        const tokenHash = hashToken(token);
        const now = new Date();
        const expiresAt = new Date(
            now.getTime() + TOKEN_LIFETIME_MS,
        );

        this.verificationRepository.replaceTokenForUser({
            userId,
            tokenHash,
            expiresAt: expiresAt.toISOString(),
            now: now.toISOString(),
        });

        const verificationUrl = new URL('/verify-email', this.frontendOrigin,);

        verificationUrl.searchParams.set('token', token);

        try {
            await this.emailSender.sendVerificationEmail({
                to: user.email,
                verificationUrl: verificationUrl.toString()
            });
        } catch (error) {
            // Do not leave a usable token behind when delivery fails.
            this.verificationRepository.invalidateToken(
                tokenHash,
                new Date().toISOString()
            );

            throw error;
        }
    }

    verifyEmail(token: string): void {
        const tokenHash = hashToken(token);
        const verified = this.verificationRepository.verifyToken(
            tokenHash,
            new Date().toISOString(),
        );

        if (!verified) {
            throw new AppError(
                400,
                'The verification link is invalid, expired, or has already been used.',
            );
        }
    }
}
