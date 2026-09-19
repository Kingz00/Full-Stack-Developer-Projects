import Database from 'better-sqlite3';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { createApp } from './app.js';
import { createDatabase } from './db/database.js';

describe('Authentication API', () => {
    let db: Database.Database;
    let app: ReturnType<typeof createApp>;

    beforeEach(() => {
        db = createDatabase(':memory:');

        db.exec(`
            CREATE TABLE users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL UNIQUE,
                password_hash TEXT NOT NULL,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
        `);

        app = createApp(db);
    });

    afterEach(() => {
        db.close();
    });

    it('registers a new user', async () => {
        const response = await request(app)
            .post('/api/auth/register')
            .send({
                username: 'testuser',
                password: 'password123',
            });

        expect(response.status).toBe(201);

        expect(response.body).toMatchObject({
            user: {
                id: 1,
                username: 'testuser',
            },
        });

        expect(response.body.user.passwordHash).toBeUndefined();
    });

    it('creates an authenticated session when registering', async () => {
        const agent = request.agent(app);

        const registerResponse = await agent
            .post('/api/auth/register')
            .send({
                username: 'testuser',
                password: 'password123',
            });

        expect(registerResponse.status).toBe(201);

        const meResponse = await agent.get('/api/auth/me');

        expect(meResponse.status).toBe(200);

        expect(meResponse.body).toMatchObject({
            user: {
                id: 1,
                username: 'testuser',
            },
        });
    });

    it('logs in with valid credentials', async () => {
        const agent = request.agent(app);

        await agent
            .post('/api/auth/register')
            .send({
                username: 'testuser',
                password: 'password123',
            });

        // Log out first so we're testing the login flow itself.
        const logoutResponse = await agent
            .post('/api/auth/logout');

        expect(logoutResponse.status).toBe(204);

        const loginResponse = await agent
            .post('/api/auth/login')
            .send({
                username: 'testuser',
                password: 'password123',
            });

        expect(loginResponse.status).toBe(200);

        expect(loginResponse.body).toMatchObject({
            user: {
                id: 1,
                username: 'testuser',
            },
        });

        const meResponse = await agent.get('/api/auth/me');

        expect(meResponse.status).toBe(200);

        expect(meResponse.body.user.username).toBe('testuser');
    });

    it('rejects an unknown username', async () => {
        const response = await request(app)
            .post('/api/auth/login')
            .send({
                username: 'unknown',
                password: 'password123',
            });

        expect(response.status).toBe(401);

        expect(response.body).toEqual({
            error: 'Invalid username or password.',
        });
    });

    it('rejects an incorrect password', async () => {
        await request(app)
            .post('/api/auth/register')
            .send({
                username: 'testuser',
                password: 'password123',
            });

        const response = await request(app)
            .post('/api/auth/login')
            .send({
                username: 'testuser',
                password: 'wrong-password',
            });

        expect(response.status).toBe(401);

        expect(response.body).toEqual({
            error: 'Invalid username or password.',
        });
    });

    it('rejects unauthenticated requests to /me', async () => {
        const response = await request(app)
            .get('/api/auth/me');

        expect(response.status).toBe(401);

        expect(response.body).toEqual({
            error: 'Authentication required.',
        });
    });

    it('allows an authenticated user to access /me', async () => {
        const agent = request.agent(app);

        await agent
            .post('/api/auth/register')
            .send({
                username: 'testuser',
                password: 'password123',
            });

        const response = await agent
            .get('/api/auth/me');

        expect(response.status).toBe(200);

        expect(response.body.user.username).toBe('testuser');
    });

    it('logs out an authenticated user', async () => {
        const agent = request.agent(app);

        await agent
            .post('/api/auth/register')
            .send({
                username: 'testuser',
                password: 'password123',
            });

        const logoutResponse = await agent
            .post('/api/auth/logout');

        expect(logoutResponse.status).toBe(204);

        const meResponse = await agent
            .get('/api/auth/me');

        expect(meResponse.status).toBe(401);
    });

    it('rejects duplicate usernames', async () => {
        await request(app)
            .post('/api/auth/register')
            .send({
                username: 'testuser',
                password: 'password123',
            });

        const response = await request(app)
            .post('/api/auth/register')
            .send({
                username: 'testuser',
                password: 'another-password',
            });

        expect(response.status).toBe(409);

        expect(response.body).toEqual({
            error: 'Username already exists.',
        });
    });
});