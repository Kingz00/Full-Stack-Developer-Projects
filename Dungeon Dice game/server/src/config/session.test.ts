/// <reference path="../types/express-session.d.ts" />
import Database from 'better-sqlite3';
import express from 'express';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { createSessionMiddleware } from './session.js';

describe('createSessionMiddleware', () => {
    let db: Database.Database;
    let originalSecret: string | undefined;
    let originalNodeEnv: string | undefined;

    const validSecret = 'test-session-secret-with-at-least-32-bytes';

    beforeEach(() => {
        db = new Database(':memory:');

        originalSecret = process.env.SESSION_SECRET;
        originalNodeEnv = process.env.NODE_ENV;

        process.env.SESSION_SECRET = validSecret;
        process.env.NODE_ENV = 'test';
    });

    afterEach(() => {
        db.close();

        if (originalSecret === undefined) {
            delete process.env.SESSION_SECRET;
        } else {
            process.env.SESSION_SECRET = originalSecret;
        }

        if (originalNodeEnv === undefined) {
            delete process.env.NODE_ENV;
        } else {
            process.env.NODE_ENV = originalNodeEnv;
        }
    });

    function createTestApp() {
        const app = express();

        app.set('trust proxy', 1);
        app.use(createSessionMiddleware(db));

        app.get('/set-session', (req, res) => {
            req.session.userId = 42;
            res.status(200).json({ ok: true });
        });

        app.get('/session', (req, res) => {
            res.json({
                userId: req.session.userId ?? null,
            });
        });

        return app;
    }

    it('rejects a missing session secret', () => {
        delete process.env.SESSION_SECRET;

        expect(() => createSessionMiddleware(db)).toThrow(
            /SESSION_SECRET/,
        );
    });

    it('rejects a secret shorter than 32 bytes', () => {
        process.env.SESSION_SECRET = 'too-short';

        expect(() => createSessionMiddleware(db)).toThrow(
            /SESSION_SECRET/,
        );
    });

    it('issues an HTTP-only SameSite=Lax cookie', async () => {
        const response = await request(createTestApp())
            .get('/set-session')
            .expect(200);

        const cookie = response.headers['set-cookie']?.[0];

        expect(cookie).toBeDefined();
        expect(cookie).toContain('dungeon.sid=');
        expect(cookie).toMatch(/HttpOnly/i);
        expect(cookie).toMatch(/SameSite=Lax/i);
        expect(cookie).not.toMatch(/;\s*Secure(?:;|$)/i);
    });

    it('marks the session cookie Secure in production', async () => {
        process.env.NODE_ENV = 'production';

        const response = await request(createTestApp())
            .get('/set-session')
            .set('X-Forwarded-Proto', 'https')
            .expect(200);

        const cookie = response.headers['set-cookie']?.[0];

        expect(cookie).toBeDefined();
        expect(cookie).toMatch(/;\s*Secure(?:;|$)/i);
        expect(cookie).toMatch(/HttpOnly/i);
        expect(cookie).toMatch(/SameSite=Lax/i);
    });

    it('preserves sessions across app instances using the same database', async () => {
        const firstApp = createTestApp();

        const createResponse = await request(firstApp)
            .get('/set-session')
            .expect(200);

        const setCookie = createResponse.headers['set-cookie']?.[0];

        expect(setCookie).toBeDefined();

        const cookiePair = setCookie!.split(';')[0];

        // Simulate a new Express app instance after a restart.
        const secondApp = createTestApp();

        const response = await request(secondApp)
            .get('/session')
            .set('Cookie', cookiePair)
            .expect(200);

        expect(response.body).toEqual({ userId: 42 });
    });
});
