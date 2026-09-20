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

        CREATE TABLE heroes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE,
            description TEXT NOT NULL,
            image_url TEXT NOT NULL,
            health INTEGER NOT NULL CHECK (health > 0),
            attack INTEGER NOT NULL CHECK (attack > 0),
            defense INTEGER NOT NULL CHECK (defense >= 0),
            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE game_runs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            selected_hero_id INTEGER NOT NULL,
            status TEXT NOT NULL DEFAULT 'active'
                CHECK (status IN ('active', 'completed', 'abandoned')),
            started_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
            completed_at TEXT,

            FOREIGN KEY (user_id)
                REFERENCES users(id)
                ON DELETE CASCADE,

            FOREIGN KEY (selected_hero_id)
                REFERENCES heroes(id)
        );

        CREATE INDEX idx_game_runs_user_id
        ON game_runs(user_id);
    `);

        app = createApp(db);
    });

    afterEach(() => {
        db.close();
    });

    function createHero(): number {
        const result = db.prepare(`
        INSERT INTO heroes (
            name,
            description,
            image_url,
            health,
            attack,
            defense
        )
        VALUES (?, ?, ?, ?, ?, ?)
        `).run(
            'Test Warrior',
            'A hero used for authentication run tests.',
            'warrior.png',
            100,
            15,
            8,
        );

        return Number(result.lastInsertRowid);
    }

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

    it('completes the active run when an authenticated user logs out', async () => {
        const agent = request.agent(app);

        await agent
            .post('/api/auth/register')
            .send({
                username: 'testuser',
                password: 'password123',
            })
            .expect(201);

        const heroId = createHero();

        const runResponse = await agent
            .post('/api/runs')
            .send({
                selectedHeroId: heroId,
            })
            .expect(201);

        const runId = runResponse.body.run.id;

        const activeRun = db
            .prepare(`
            SELECT status, completed_at
            FROM game_runs
            WHERE id = ?
        `)
            .get(runId) as {
                status: string;
                completed_at: string | null;
            };

        expect(activeRun.status).toBe('active');
        expect(activeRun.completed_at).toBeNull();

        const logoutResponse = await agent
            .post('/api/auth/logout');

        expect(logoutResponse.status).toBe(204);

        const completedRun = db
            .prepare(`
            SELECT status, completed_at
            FROM game_runs
            WHERE id = ?
        `)
            .get(runId) as {
                status: string;
                completed_at: string | null;
            };

        expect(completedRun.status).toBe('completed');
        expect(completedRun.completed_at).toEqual(expect.any(String));

        const meResponse = await agent
            .get('/api/auth/me');

        expect(meResponse.status).toBe(401);

        expect(meResponse.body).toEqual({
            error: 'Authentication required.',
        });
    });

    it('logs out successfully when the authenticated user has no active run', async () => {
        const agent = request.agent(app);

        await agent
            .post('/api/auth/register')
            .send({
                username: 'testuser',
                password: 'password123',
            })
            .expect(201);

        const logoutResponse = await agent
            .post('/api/auth/logout');

        expect(logoutResponse.status).toBe(204);

        const meResponse = await agent
            .get('/api/auth/me');

        expect(meResponse.status).toBe(401);

        expect(meResponse.body).toEqual({
            error: 'Authentication required.',
        });

        const runs = db
            .prepare(`
                SELECT COUNT(*) AS count
                FROM game_runs
            `)
            .get() as {
                count: number;
            };

        expect(runs.count).toBe(0);
    });

    it('keeps a reset run abandoned when the user later logs out', async () => {
        const agent = request.agent(app);

        await agent
            .post('/api/auth/register')
            .send({
                username: 'testuser',
                password: 'password123',
            })
            .expect(201);

        const heroId = createHero();

        const runResponse = await agent
            .post('/api/runs')
            .send({
                selectedHeroId: heroId,
            })
            .expect(201);

        const runId = runResponse.body.run.id;

        await agent
            .post(`/api/runs/${runId}/reset`)
            .expect(200);

        const abandonedRun = db
            .prepare(`
                SELECT status, completed_at
                FROM game_runs
                WHERE id = ?
            `)
            .get(runId) as {
                status: string;
                completed_at: string | null;
            };

        expect(abandonedRun.status).toBe('abandoned');
        expect(abandonedRun.completed_at).toEqual(expect.any(String));

        await agent
            .post('/api/auth/logout')
            .expect(204);

        const runAfterLogout = db
            .prepare(`
                SELECT status, completed_at
                FROM game_runs
                WHERE id = ?
            `)
            .get(runId) as {
                status: string;
                completed_at: string | null;
            };

        expect(runAfterLogout.status).toBe('abandoned');
        expect(runAfterLogout.completed_at).toEqual(
            abandonedRun.completed_at,
        );
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