import { afterEach, describe, expect, it, vi } from 'vitest';

import { AppError } from '../errors/AppError.js';
import { BrevoEmailSender, UnconfiguredEmailSender } from './emailSender.js';

const config = {
    apiKey: 'test-api-key',
    senderEmail: 'noreply@mail.kingsleyonwupeluonye.dev',
    senderName: 'Dungeon Dice Duel',
};

function createSender() {
    const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        status: 201,
    } as Response);

    const sender = new BrevoEmailSender(
        config,
        fetchMock as unknown as typeof fetch,
    );

    return { sender, fetchMock };
}

function getRequestBody(fetchMock: ReturnType<typeof vi.fn>) {
    const [, options] = fetchMock.mock.calls[0] as [
        string,
        RequestInit,
    ];

    return JSON.parse(options.body as string) as {
        sender: { name: string; email: string };
        to: { email: string }[];
        subject: string;
        textContent: string;
        htmlContent: string;
    };
}

describe('BrevoEmailSender', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('reports whether the required configuration is present', () => {
        expect(new BrevoEmailSender(config).isConfigured()).toBe(true);

        expect(
            new BrevoEmailSender({
                apiKey: '',
                senderEmail: config.senderEmail,
                senderName: config.senderName,
            }).isConfigured(),
        ).toBe(false);

        expect(
            new BrevoEmailSender({
                apiKey: config.apiKey,
                senderEmail: '',
                senderName: config.senderName,
            }).isConfigured(),
        ).toBe(false);
    });

    it('sends a verification email with the correct Brevo payload', async () => {
        const { sender, fetchMock } = createSender();

        await sender.sendVerificationEmail({
            to: 'player@example.com',
            verificationUrl:
                'https://game.example/verify?token=abc&next=home',
        });

        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(fetchMock).toHaveBeenCalledWith('https://api.brevo.com/v3/smtp/email',
            expect.objectContaining({
                method: 'POST',
                headers: {
                    'api-key': config.apiKey,
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                signal: expect.any(AbortSignal),
            }),
        );

        const body = getRequestBody(fetchMock);

        expect(body.sender).toEqual({
            name: config.senderName,
            email: config.senderEmail,
        });
        expect(body.to).toEqual([{ email: 'player@example.com' }]);
        expect(body.subject).toBe(
            'Verify your Dungeon Dice Duel email',
        );
        expect(body.textContent).toContain(
            'https://game.example/verify?token=abc&next=home',
        );
        expect(body.htmlContent).toContain(
            'token=abc&amp;next=home',
        );
    });

    it('sends a password-reset email with the correct subject and expiry notice', async () => {
        const { sender, fetchMock } = createSender();

        await sender.sendPasswordResetEmail({
            to: 'player@example.com',
            resetUrl: 'https://game.example/reset?token=reset-token',
        });

        const body = getRequestBody(fetchMock);

        expect(body.subject).toBe(
            'Reset your Dungeon Dice Duel password',
        );
        expect(body.to).toEqual([{ email: 'player@example.com' }]);
        expect(body.textContent).toContain('one hour');
        expect(body.htmlContent).toContain('one hour');
        expect(body.textContent).toContain(
            'https://game.example/reset?token=reset-token',
        );
    });

    it('sends a username-recovery email and escapes HTML content', async () => {
        const { sender, fetchMock } = createSender();

        await sender.sendUsernameRecoveryEmail({
            to: 'player@example.com',
            username: '<admin>&player',
        });

        const body = getRequestBody(fetchMock);

        expect(body.subject).toBe(
            'Your Dungeon Dice Duel username',
        );
        expect(body.textContent).toContain('<admin>&player');
        expect(body.htmlContent).toContain(
            '&lt;admin&gt;&amp;player',
        );
        expect(body.htmlContent).not.toContain('<strong><admin>');
    });

    it('does not call Brevo when configuration is incomplete', async () => {
        const fetchMock = vi.fn();
        const sender = new BrevoEmailSender(
            {
                apiKey: '',
                senderEmail: config.senderEmail,
                senderName: config.senderName,
            },
            fetchMock as unknown as typeof fetch,
        );

        await expect(
            sender.sendVerificationEmail({
                to: 'player@example.com',
                verificationUrl: 'https://game.example/verify',
            }),
        ).rejects.toMatchObject({
            statusCode: 503,
            message: 'Email delivery is not configured.',
        });

        expect(fetchMock).not.toHaveBeenCalled();
    });

    it('converts a network failure into an AppError', async () => {
        const fetchMock = vi.fn().mockRejectedValue(
            new Error('Network failure'),
        );

        const sender = new BrevoEmailSender(
            config,
            fetchMock as unknown as typeof fetch,
        );

        await expect(
            sender.sendVerificationEmail({
                to: 'player@example.com',
                verificationUrl: 'https://game.example/verify',
            }),
        ).rejects.toMatchObject({
            statusCode: 502,
            message: 'The email provider could not be reached.',
        });
    });

    it('rejects a non-success response from Brevo', async () => {
        const fetchMock = vi.fn().mockResolvedValue({
            ok: false,
            status: 401,
        } as Response);

        const sender = new BrevoEmailSender(
            config,
            fetchMock as unknown as typeof fetch,
        );

        await expect(
            sender.sendPasswordResetEmail({
                to: 'player@example.com',
                resetUrl: 'https://game.example/reset',
            }),
        ).rejects.toMatchObject({
            statusCode: 502,
            message: 'The email provider rejected the message.',
        });
    });

    it('retains the unconfigured fallback sender', async () => {
        const sender = new UnconfiguredEmailSender();

        expect(sender.isConfigured()).toBe(false);

        await expect(
            sender.sendUsernameRecoveryEmail({
                to: 'player@example.com',
                username: 'player',
            }),
        ).rejects.toBeInstanceOf(AppError);
    });
});
