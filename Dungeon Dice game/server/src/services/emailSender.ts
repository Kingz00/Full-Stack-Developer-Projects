import { AppError } from '../errors/AppError.js';

export interface VerificationEmail {
    to: string;
    verificationUrl: string;
}

export interface PasswordResetEmail {
    to: string;
    resetUrl: string;
}

export interface UsernameRecoveryEmail {
    to: string;
    username: string;
}

export interface EmailSender {
    isConfigured(): boolean;

    sendVerificationEmail(email: VerificationEmail): Promise<void>;

    sendPasswordResetEmail(email: PasswordResetEmail): Promise<void>;

    sendUsernameRecoveryEmail(email: UsernameRecoveryEmail): Promise<void>;
}

interface BrevoEmail {
    to: string;
    subject: string;
    textContent: string;
    htmlContent: string;
}

interface BrevoEmailSenderConfig {
    apiKey: string;
    senderEmail: string;
    senderName: string;
}

type FetchFunction = typeof fetch;

function escapeHtml(value: string): string {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

export class BrevoEmailSender implements EmailSender {
    private readonly config: BrevoEmailSenderConfig;
    private readonly fetchImpl: FetchFunction;

    constructor(
        config: Partial<BrevoEmailSenderConfig> = {
            apiKey: process.env.BREVO_API_KEY,
            senderEmail: process.env.EMAIL_FROM_ADDRESS,
            senderName: process.env.EMAIL_FROM_NAME,
        },
        fetchImpl: FetchFunction = fetch,
    ) {
        this.config = {
            apiKey: config.apiKey?.trim() ?? '',
            senderEmail: config.senderEmail?.trim() ?? '',
            senderName: config.senderName?.trim() || 'Dungeon Dice Duel',
        };

        this.fetchImpl = fetchImpl;
    }

    isConfigured(): boolean {
        return Boolean(
            this.config.apiKey &&
            this.config.senderEmail &&
            this.config.senderName,
        );
    }

    async sendVerificationEmail(email: VerificationEmail): Promise<void> {
        await this.sendEmail({
            to: email.to,
            subject: 'Verify your Dungeon Dice Duel email',
            textContent: [
                'You requested to verify your email address for Dungeon Dice Duel.',
                '',
                `Verify your email: ${email.verificationUrl}`,
                '',
                'If you did not request this, you can ignore this email.',
            ].join('\n'),
            htmlContent: `
                <h1>Verify your email address</h1>
                <p>You requested to verify your email address for Dungeon Dice Duel.</p>
                <p>
                    <a href="${escapeHtml(email.verificationUrl)}">
                        Verify email address
                    </a>
                </p>
                <p>If you did not request this, you can ignore this email.</p>
            `,
        });
    }

    async sendPasswordResetEmail(email: PasswordResetEmail): Promise<void> {
        await this.sendEmail({
            to: email.to,
            subject: 'Reset your Dungeon Dice Duel password',
            textContent: [
                'You requested to reset your Dungeon Dice Duel password.',
                '',
                `Reset your password: ${email.resetUrl}`,
                '',
                'This link expires after one hour.',
                'If you did not request this, you can ignore this email.',
            ].join('\n'),
            htmlContent: `
                <h1>Reset your password</h1>
                <p>You requested to reset your Dungeon Dice Duel password.</p>
                <p>
                    <a href="${escapeHtml(email.resetUrl)}">
                        Reset password
                    </a>
                </p>
                <p>This link expires after one hour.</p>
                <p>If you did not request this, you can ignore this email.</p>
            `,
        });
    }

    async sendUsernameRecoveryEmail(email: UsernameRecoveryEmail): Promise<void> {
        const username = email.username;

        await this.sendEmail({
            to: email.to,
            subject: 'Your Dungeon Dice Duel username',
            textContent: [
                'You requested your Dungeon Dice Duel username.',
                '',
                `Username: ${username}`,
                '',
                'If you did not request this, you can ignore this email.',
            ].join('\n'),
            htmlContent: `
                <h1>Your username</h1>
                <p>You requested your Dungeon Dice Duel username.</p>
                <p>
                    Username:
                    <strong>${escapeHtml(username)}</strong>
                </p>
                <p>If you did not request this, you can ignore this email.</p>
            `,
        });
    }

    private async sendEmail(email: BrevoEmail): Promise<void> {
        if (!this.isConfigured()) {
            throw new AppError(
                503,
                'Email delivery is not configured.',
            );
        }

        let response: Response;

        try {
            response = await this.fetchImpl('https://api.brevo.com/v3/smtp/email',
                {
                    method: 'POST',
                    headers: {
                        'api-key': this.config.apiKey,
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                    },
                    body: JSON.stringify({
                        sender: {
                            name: this.config.senderName,
                            email: this.config.senderEmail,
                        },
                        to: [{ email: email.to }],
                        subject: email.subject,
                        textContent: email.textContent,
                        htmlContent: email.htmlContent,
                    }),
                    signal: AbortSignal.timeout(10_000),
                },
            );
        } catch {
            throw new AppError(
                502,
                'The email provider could not be reached.',
            );
        }

        if (!response.ok) {
            throw new AppError(
                502,
                'The email provider rejected the message.',
            );
        }
    }
}

/**
 * Retained as a safe fallback for tests or deployments
 * where email delivery has not been configured.
 */
export class UnconfiguredEmailSender implements EmailSender {
    isConfigured(): boolean {
        return false;
    }

    async sendVerificationEmail(_email: VerificationEmail): Promise<void> {
        throw new AppError(503, 'Email delivery is not configured.');
    }

    async sendPasswordResetEmail(_email: PasswordResetEmail): Promise<void> {
        throw new AppError(503, 'Email delivery is not configured.');
    }

    async sendUsernameRecoveryEmail(_email: UsernameRecoveryEmail): Promise<void> {
        throw new AppError(503, 'Email delivery is not configured.');
    }
}
