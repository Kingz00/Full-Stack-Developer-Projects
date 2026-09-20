import Database from 'better-sqlite3';
import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';

import { createApp } from './app.js';

describe('Game Run integration', () => {
    let db: Database.Database;
    let app: ReturnType<typeof createApp>;

    beforeEach(() => {
        db = new Database(':memory:');

        db.pragma('foreign_keys = ON');

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

    it('rejects unauthenticated game run creation', async () => {
        const response = await request(app)
            .post('/api/runs')
            .send({
                selectedHeroId: 1
            });

        expect(response.status).toBe(401);

        expect(response.body).toEqual({
            error: 'Authentication required.'
        });
    });

    it('creates a game run for an authenticated user', async () => {
        const agent = request.agent(app);

        await agent
            .post('/api/auth/register')
            .send({
                username: 'run-player',
                password: 'password123'
            })
            .expect(201);

        const heroResult = db
            .prepare(`
                INSERT INTO heroes (
                    name,
                    description,
                    image_url,
                    health,
                    attack,
                    defense
                )
                VALUES (?, ?, ?, ?, ?, ?)
            `)
            .run(
                'Knight',
                'A balanced warrior.',
                '/images/knight.png',
                100,
                15,
                8
            );

        const heroId = Number(heroResult.lastInsertRowid);

        const response = await agent
            .post('/api/runs')
            .send({
                selectedHeroId: heroId
            })
            .expect(201);

        expect(response.body.run).toMatchObject({
            id: expect.any(Number),
            userId: expect.any(Number),
            selectedHeroId: heroId,
            status: 'active',
            completedAt: null
        });

        const run = db
            .prepare(`
                SELECT
                    id,
                    user_id,
                    selected_hero_id,
                    status,
                    completed_at
                FROM game_runs
                WHERE id = ?
            `)
            .get(response.body.run.id) as {
                id: number;
                user_id: number;
                selected_hero_id: number;
                status: string;
                completed_at: string | null;
            };

        expect(run).toMatchObject({
            id: response.body.run.id,
            selected_hero_id: heroId,
            status: 'active',
            completed_at: null
        });

        expect(run.user_id).toBe(response.body.run.userId);
        if (db) {
            db.close();
        }
    });

    it('returns 404 when the selected hero does not exist', async () => {
        const agent = request.agent(app);

        await agent
            .post('/api/auth/register')
            .send({
                username: 'missing-hero-player',
                password: 'password123',
            })
            .expect(201);

        const response = await agent
            .post('/api/runs')
            .send({
                selectedHeroId: 999
            })
            .expect(404);

        expect(response.body).toEqual({
            error: 'Selected hero not found.',
        });
    });

    it('returns 400 when selectedHeroId is missing', async () => {
        const agent = request.agent(app);

        await agent
            .post('/api/auth/register')
            .send({
                username: 'invalid-run-player',
                password: 'password123',
            })
            .expect(201);

        const response = await agent
            .post('/api/runs')
            .send({})
            .expect(400);

        expect(response.body).toEqual({
            error: 'A valid selected hero ID is required.',
        });
    });

    it('abandons an active game run for the authenticated user', async () => {
        const agent = request.agent(app);

        await agent
            .post('/api/auth/register')
            .send({
                username: 'reset-player',
                password: 'password123',
            })
            .expect(201);

        const heroResult = db
            .prepare(`
            INSERT INTO heroes (
                name,
                description,
                image_url,
                health,
                attack,
                defense
            )
            VALUES (?, ?, ?, ?, ?, ?)
        `)
            .run(
                'Reset Knight',
                'A hero used for reset testing.',
                '/images/reset-knight.png',
                100,
                15,
                8
            );

        const heroId = Number(heroResult.lastInsertRowid);

        const createResponse = await agent
            .post('/api/runs')
            .send({
                selectedHeroId: heroId,
            })
            .expect(201);

        const runId = createResponse.body.run.id;

        const resetResponse = await agent
            .post(`/api/runs/${runId}/reset`)
            .expect(200);

        expect(resetResponse.body.run).toMatchObject({
            id: runId,
            selectedHeroId: heroId,
            status: 'abandoned'
        });

        expect(resetResponse.body.run.completedAt)
            .toEqual(expect.any(String));

        const run = db
            .prepare(`
            SELECT
                id,
                user_id,
                selected_hero_id,
                status,
                completed_at
            FROM game_runs
            WHERE id = ?
        `)
            .get(runId) as {
                id: number;
                user_id: number;
                selected_hero_id: number;
                status: string;
                completed_at: string | null;
            };

        expect(run).toMatchObject({
            id: runId,
            selected_hero_id: heroId,
            status: 'abandoned',
        });

        expect(run.completed_at)
            .toEqual(expect.any(String));
    });

    it('rejects unauthenticated game run reset', async () => {
        const response = await request(app)
            .post('/api/runs/1/reset')
            .expect(401);

        expect(response.body).toEqual({
            error: 'Authentication required.'
        });
    });

    it('returns 404 when the game run does not exist', async () => {
        const agent = request.agent(app);

        await agent
            .post('/api/auth/register')
            .send({
                username: 'missing-run-player',
                password: 'password123',
            })
            .expect(201);

        const response = await agent
            .post('/api/runs/999/reset')
            .expect(404);

        expect(response.body).toEqual({
            error: 'Game run not found.',
        });
    });

    it('returns 400 when the game run ID is invalid', async () => {
        const agent = request.agent(app);

        await agent
            .post('/api/auth/register')
            .send({
                username: 'invalid-run-id-player',
                password: 'password123',
            })
            .expect(201);

        const response = await agent
            .post('/api/runs/not-a-number/reset')
            .expect(400);

        expect(response.body).toEqual({
            error: 'A valid game run ID is required.',
        });
    });
});