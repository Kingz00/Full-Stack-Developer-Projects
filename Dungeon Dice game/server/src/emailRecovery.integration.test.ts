import Database from 'better-sqlite3';
import bcrypt from 'bcrypt';
import { createHash } from 'node:crypto';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createApp } from './app.js';
import { runMigrations } from './db/migrate.js';
import { EmailVerificationRepository } from './repositories/emailVerificationRepository.js';
import { PasswordResetRepository } from './repositories/passwordResetRepository.js';
import { UserRepository } from './repositories/userRepository.js';
import { UnconfiguredEmailSender, type EmailSender, type PasswordResetEmail, type UsernameRecoveryEmail, type VerificationEmail } from './services/emailSender.js';
import { EmailVerificationService } from './services/emailVerificationService.js';

class FakeEmailSender implements EmailSender {
    verificationEmails: VerificationEmail[] = [];
    passwordResetEmails: PasswordResetEmail[] = [];
    usernameRecoveryEmails: UsernameRecoveryEmail[] = [];

    configured = true;
    failDelivery = false;

    isConfigured(): boolean {
        return this.configured;
    }

    async sendVerificationEmail(email: VerificationEmail): Promise<void> {
        this.verificationEmails.push(email);

        if (this.failDelivery) {
            throw new Error('Simulated email delivery failure');
        }
    }

    async sendPasswordResetEmail(email: PasswordResetEmail): Promise<void> {
        this.passwordResetEmails.push(email);

        if (this.failDelivery) {
            throw new Error('Simulated email delivery failure');
        }
    }

    async sendUsernameRecoveryEmail(email: UsernameRecoveryEmail): Promise<void> {
        this.usernameRecoveryEmails.push(email);

        if (this.failDelivery) {
            throw new Error('Simulated email delivery failure');
        }
    }
}

function hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
}

describe('Email verification and password recovery API', () => {
    let db: Database.Database;
    let app: ReturnType<typeof createApp>;
    let sender: FakeEmailSender;
    let users: UserRepository;
    let passwordResetRepository: PasswordResetRepository;
    let emailVerificationService: EmailVerificationService;

    const previousEnv = {
        frontendOrigin: process.env.FRONTEND_ORIGIN,
        sessionSecret: process.env.SESSION_SECRET,
        recaptchaSecret: process.env.RECAPTCHA_SECRET_KEY,
    };

    beforeEach(() => {
        db = new Database(':memory:');
        db.pragma('foreign_keys = ON');
        runMigrations(db);

        process.env.FRONTEND_ORIGIN = 'http://localhost:5173';
        process.env.SESSION_SECRET = 'integration-test-session-secret-at-least-32-bytes';
        process.env.RECAPTCHA_SECRET_KEY = 'integration-test-secret';

        vi.stubGlobal('fetch',
            vi.fn().mockResolvedValue({
                ok: true,
                json: async () => ({ success: true }),
            }),
        );

        sender = new FakeEmailSender();
        users = new UserRepository(db);
        passwordResetRepository = new PasswordResetRepository(db);

        emailVerificationService = new EmailVerificationService(
            users,
            new EmailVerificationRepository(db),
            sender,
            process.env.FRONTEND_ORIGIN,
        );

        app = createApp(db, { emailSender: sender });
    });

    afterEach(() => {
        if (db.open) {
            db.close();
        }

        if (previousEnv.frontendOrigin === undefined) {
            delete process.env.FRONTEND_ORIGIN;
        } else {
            process.env.FRONTEND_ORIGIN = previousEnv.frontendOrigin;
        }

        if (previousEnv.sessionSecret === undefined) {
            delete process.env.SESSION_SECRET;
        } else {
            process.env.SESSION_SECRET = previousEnv.sessionSecret;
        }

        if (previousEnv.recaptchaSecret === undefined) {
            delete process.env.RECAPTCHA_SECRET_KEY;
        } else {
            process.env.RECAPTCHA_SECRET_KEY = previousEnv.recaptchaSecret;
        }

        vi.unstubAllGlobals();
        vi.restoreAllMocks();
    });

    async function createUser(
        username = 'testuser',
        email = 'testuser@example.com',
    ) {
        return users.create({
            username,
            email,
            passwordHash: await bcrypt.hash('old-password', 4),
        });
    }

    async function requestReset(email = 'testuser@example.com') {
        const response = await request(app)
            .post('/api/auth/forgot-password')
            .send({ email, recaptchaToken: 'valid-test-token' });

        return response;
    }

    function getResetToken(): string {
        const email = sender.passwordResetEmails.at(-1);

        if (!email) {
            throw new Error('No password-reset email was sent.');
        }

        return new URL(email.resetUrl).searchParams.get('token')!;
    }

    it('returns the same generic response for known and unknown reset emails', async () => {
        await createUser();

        const known = await requestReset();
        const unknown = await requestReset('nobody@example.com');

        expect(known.status).toBe(202);
        expect(unknown.status).toBe(202);
        expect(known.body).toEqual(unknown.body);
        expect(sender.passwordResetEmails).toHaveLength(1);
    });

    it('stores only the reset-token hash and sends a one-hour reset link', async () => {
        const user = await createUser();

        const response = await requestReset();

        expect(response.status).toBe(202);
        expect(sender.passwordResetEmails[0].to).toBe(user.email);

        const token = getResetToken();
        const stored = db.prepare(`
            SELECT token_hash, expires_at, used_at
            FROM password_reset_tokens
            WHERE user_id = ?
        `).get(user.id) as {
            token_hash: string;
            expires_at: string;
            used_at: string | null;
        };

        expect(token).toMatch(/^[A-Za-z0-9_-]{43}$/);
        expect(stored.token_hash).toBe(hashToken(token));
        expect(stored.token_hash).not.toBe(token);
        expect(stored.token_hash).toHaveLength(64);
        expect(stored.used_at).toBeNull();

        const lifetime =
            new Date(stored.expires_at).getTime() - Date.now();

        expect(lifetime).toBeGreaterThan(59 * 60 * 1000);
        expect(lifetime).toBeLessThanOrEqual(60 * 60 * 1000);
    });

    it('resets the password for an unverified user and consumes the token', async () => {
        const user = await createUser();

        expect(user.emailVerifiedAt).toBeNull();

        await requestReset();
        const token = getResetToken();

        const response = await request(app)
            .post('/api/auth/reset-password')
            .send({ token, password: 'new-password' });

        expect(response.status).toBe(200);

        const updatedUser = users.findById(user.id)!;

        expect(
            await bcrypt.compare('new-password', updatedUser.passwordHash),
        ).toBe(true);

        expect(
            await bcrypt.compare('old-password', updatedUser.passwordHash),
        ).toBe(false);

        const secondAttempt = await request(app)
            .post('/api/auth/reset-password')
            .send({ token, password: 'another-password' });

        expect(secondAttempt.status).toBe(400);
    });

    it('rejects expired reset tokens', async () => {
        await createUser();

        const token = 'A'.repeat(43);

        db.prepare(`
            INSERT INTO password_reset_tokens (
                user_id, token_hash, expires_at
            )
            VALUES (?, ?, ?)
        `).run(
            1,
            hashToken(token),
            new Date(Date.now() - 60_000).toISOString(),
        );

        const response = await request(app)
            .post('/api/auth/reset-password')
            .send({ token, password: 'new-password' });

        expect(response.status).toBe(400);
    });

    it('rejects malformed reset tokens and missing passwords', async () => {
        const malformedToken = await request(app)
            .post('/api/auth/reset-password')
            .send({ token: 'not-a-valid-token', password: 'new-password' });

        const missingPassword = await request(app)
            .post('/api/auth/reset-password')
            .send({ token: 'A'.repeat(43), password: '' });

        expect(malformedToken.status).toBe(400);
        expect(missingPassword.status).toBe(400);
    });

    it('invalidates all the user’s sessions and other outstanding reset tokens', async () => {
        const user = await createUser();
        const otherUser = await createUser(
            'anotheruser',
            'another@example.com',
        );

        await requestReset();
        const token = getResetToken();

        const otherTokenHash = hashToken('B'.repeat(43));

        db.prepare(`
            INSERT INTO password_reset_tokens (
                user_id, token_hash, expires_at
            )
            VALUES (?, ?, ?)
        `).run(
            user.id,
            otherTokenHash,
            new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        );

        const expiry = Date.now() + 60 * 60 * 1000;

        db.prepare(`
            INSERT INTO sessions (sid, session, expires_at)
            VALUES (?, ?, ?), (?, ?, ?)
        `).run(
            'user-session',
            JSON.stringify({ userId: user.id, cookie: {} }),
            expiry,
            'other-user-session',
            JSON.stringify({ userId: otherUser.id, cookie: {} }),
            expiry,
        );

        const response = await request(app)
            .post('/api/auth/reset-password')
            .send({ token, password: 'new-password' });

        expect(response.status).toBe(200);

        const remainingSessions = db.prepare(`
            SELECT sid FROM sessions ORDER BY sid
        `).all() as { sid: string }[];

        expect(remainingSessions).toEqual([
            { sid: 'other-user-session' },
        ]);

        const otherToken = db.prepare(`
            SELECT used_at
            FROM password_reset_tokens
            WHERE token_hash = ?
        `).get(otherTokenHash) as { used_at: string | null };

        expect(otherToken.used_at).not.toBeNull();
    });

    it('invalidates a newly created token if email delivery fails', async () => {
        await createUser();
        sender.failDelivery = true;

        const response = await requestReset();

        expect(response.status).toBe(202);
        expect(response.body.message).toBeTruthy();

        const tokenHash = hashToken(getResetToken());

        const stored = db.prepare(`
            SELECT used_at
            FROM password_reset_tokens
            WHERE token_hash = ?
        `).get(tokenHash) as { used_at: string | null };

        expect(stored.used_at).not.toBeNull();
    });

    it('returns a generic response for username recovery', async () => {
        const user = await createUser();

        const known = await request(app)
            .post('/api/auth/forgot-username')
            .send({ email: user.email, recaptchaToken: 'valid-test-token' });

        const unknown = await request(app)
            .post('/api/auth/forgot-username')
            .send({ email: 'unknown@example.com', recaptchaToken: 'valid-test-token' });

        expect(known.status).toBe(202);
        expect(unknown.status).toBe(202);
        expect(known.body).toEqual(unknown.body);

        expect(sender.usernameRecoveryEmails).toHaveLength(1);
        expect(sender.usernameRecoveryEmails[0]).toEqual({
            to: user.email,
            username: user.username,
        });
    });

    it('rejects invalid email addresses on recovery endpoints', async () => {
        const badPasswordRequest = await request(app)
            .post('/api/auth/forgot-password')
            .send({ email: 'not-an-email' });

        const badUsernameRequest = await request(app)
            .post('/api/auth/forgot-username')
            .send({ email: '' });

        expect(badPasswordRequest.status).toBe(400);
        expect(badUsernameRequest.status).toBe(400);
    });

    it('returns 503 when email delivery is not configured', async () => {
        const unconfiguredApp = createApp(db, {
            emailSender: new UnconfiguredEmailSender(),
        });

        const response = await request(unconfiguredApp)
            .post('/api/auth/forgot-password')
            .send({ email: 'testuser@example.com', recaptchaToken: 'valid-test-token' });

        expect(response.status).toBe(503);
    });

    it('sends a verification email and verifies the address using its token', async () => {
        const user = await createUser();

        await emailVerificationService.requestVerification(user.id);

        expect(sender.verificationEmails).toHaveLength(1);
        expect(sender.verificationEmails[0].to).toBe(user.email);

        const token = new URL(
            sender.verificationEmails[0].verificationUrl,
        ).searchParams.get('token')!;

        const stored = db.prepare(`
            SELECT token_hash, used_at
            FROM email_verification_tokens
            WHERE user_id = ?
        `).get(user.id) as {
            token_hash: string;
            used_at: string | null;
        };

        expect(stored.token_hash).toBe(hashToken(token));
        expect(stored.token_hash).not.toBe(token);

        const response = await request(app)
            .post('/api/auth/email-verification/verify')
            .send({ token });

        expect(response.status).toBe(200);
        expect(users.findById(user.id)?.emailVerifiedAt).not.toBeNull();

        const repeated = await request(app)
            .post('/api/auth/email-verification/verify')
            .send({ token });

        expect(repeated.status).toBe(400);
    });

    it('allows an unverified user to log in', async () => {
        const user = await createUser();

        expect(user.emailVerifiedAt).toBeNull();

        const response = await request(app)
            .post('/api/auth/login')
            .send({
                username: user.username,
                password: 'old-password',
                recaptchaToken: 'test-token',
            });

        expect(response.status).toBe(200);
        expect(response.body.user.username).toBe(user.username);
    });


    it('rejects password recovery without a CAPTCHA token', async () => {
        await createUser()

        const response = await request(app)
            .post('/api/auth/forgot-password')
            .send({ email: 'testuser@example.com' })

        expect(response.status).toBe(400)
        expect(response.body).toEqual({
            error: 'Complete the CAPTCHA verification.',
        })

        expect(sender.passwordResetEmails).toHaveLength(0)
    })

    it('rejects username recovery without a CAPTCHA token', async () => {
        await createUser()

        const response = await request(app)
            .post('/api/auth/forgot-username')
            .send({ email: 'testuser@example.com' })

        expect(response.status).toBe(400)
        expect(response.body).toEqual({
            error: 'Complete the CAPTCHA verification.',
        })

        expect(sender.usernameRecoveryEmails).toHaveLength(0)
    })

    it('does not send recovery emails when Google rejects the CAPTCHA', async () => {
        await createUser()

        vi.stubGlobal(
            'fetch',
            vi.fn().mockResolvedValue({
                ok: true,
                json: async () => ({
                    success: false,
                    'error-codes': ['invalid-input-response'],
                }),
            }),
        )

        const passwordResponse = await request(app)
            .post('/api/auth/forgot-password')
            .send({
                email: 'testuser@example.com',
                recaptchaToken: 'invalid-test-token',
            })

        const usernameResponse = await request(app)
            .post('/api/auth/forgot-username')
            .send({
                email: 'testuser@example.com',
                recaptchaToken: 'invalid-test-token',
            })

        expect(passwordResponse.status).toBe(400)
        expect(passwordResponse.body).toEqual({
            error: 'CAPTCHA verification failed. Please try again.',
        })

        expect(usernameResponse.status).toBe(400)
        expect(usernameResponse.body).toEqual({
            error: 'CAPTCHA verification failed. Please try again.',
        })

        expect(sender.passwordResetEmails).toHaveLength(0)
        expect(sender.usernameRecoveryEmails).toHaveLength(0)
    })
});
