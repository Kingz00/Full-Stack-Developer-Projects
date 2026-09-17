import type { Session, SessionData } from 'express-session';
import { describe, expect, it, vi } from 'vitest';

import { SessionService } from './sessionService.js';

type AppSession = Session & Partial<SessionData>

describe('SessionService', () => {
    it('creates an authenticated session', async () => {
        const session: AppSession = {
            userId: undefined,
            regenerate: vi.fn((callback) => {
                callback(null);
            }),
            save: vi.fn((callback) => {
                callback(null);
            }),
        } as unknown as Session;

        const service = new SessionService();

        await service.create(session, 123);

        expect(session.regenerate).toHaveBeenCalledOnce();
        expect(session.userId).toBe(123);
        expect(session.save).toHaveBeenCalledOnce();
    });

    it('rejects when session regeneration fails', async () => {
        const error = new Error('regeneration failed');

        const session = {
            regenerate: vi.fn((callback) => {
                callback(error);
            }),
            save: vi.fn(),
        } as unknown as Session;

        const service = new SessionService();

        await expect(
            service.create(session, 123),
        ).rejects.toBe(error);

        expect(session.save).not.toHaveBeenCalled();
    });

    it('rejects when session saving fails', async () => {
        const error = new Error('save failed');

        const session = {
            regenerate: vi.fn((callback) => {
                callback(null);
            }),
            save: vi.fn((callback) => {
                callback(error);
            }),
        } as unknown as Session;

        const service = new SessionService();

        await expect(
            service.create(session, 123),
        ).rejects.toBe(error);
    });

    it('destroys a session', async () => {
        const session = {
            destroy: vi.fn((callback) => {
                callback(null);
            }),
        } as unknown as Session;

        const service = new SessionService();

        await service.destroy(session);

        expect(session.destroy).toHaveBeenCalledOnce();
    });

    it('rejects when session destruction fails', async () => {
        const error = new Error('destroy failed');

        const session = {
            destroy: vi.fn((callback) => {
                callback(error);
            }),
        } as unknown as Session;

        const service = new SessionService();

        await expect(
            service.destroy(session),
        ).rejects.toBe(error);
    });
});