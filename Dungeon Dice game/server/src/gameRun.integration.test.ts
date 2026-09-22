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

            CREATE TABLE battles (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                run_id INTEGER NOT NULL,
                hero_id INTEGER NOT NULL,

                player_health INTEGER NOT NULL
                    CHECK (player_health >= 0),

                player_max_health INTEGER NOT NULL
                    CHECK (player_max_health > 0),

                enemy_name TEXT NOT NULL,

                enemy_health INTEGER NOT NULL
                    CHECK (enemy_health >= 0),

                enemy_max_health INTEGER NOT NULL
                    CHECK (enemy_max_health > 0),

                enemy_attack INTEGER NOT NULL
                    CHECK (enemy_attack > 0),

                enemy_defense INTEGER NOT NULL
                    CHECK (enemy_defense >= 0),

                status TEXT NOT NULL DEFAULT 'active'
                    CHECK (status IN ( 'active', 'won', 'lost', 'draw', 'abandoned')),

                started_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                completed_at TEXT,

                FOREIGN KEY (run_id)
                    REFERENCES game_runs(id)
                    ON DELETE CASCADE,

                FOREIGN KEY (hero_id)
                    REFERENCES heroes(id)
            );

            CREATE INDEX idx_battles_run_id
                ON battles(run_id);

            CREATE UNIQUE INDEX idx_battles_one_active_per_run
                ON battles(run_id)
                WHERE status = 'active';
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

    it('rejects creating a second active game run for the same user', async () => {
        const agent = request.agent(app);

        await agent
            .post('/api/auth/register')
            .send({
                username: 'duplicate-active-run',
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
                'Duplicate Run Knight',
                'A hero used for duplicate active run testing.',
                '/images/duplicate-run-knight.png',
                100,
                15,
                8
            );

        const heroId = Number(heroResult.lastInsertRowid);

        const firstRunResponse = await agent
            .post('/api/runs')
            .send({
                selectedHeroId: heroId,
            })
            .expect(201);

        const firstRunId = firstRunResponse.body.run.id;

        const secondRunResponse = await agent
            .post('/api/runs')
            .send({
                selectedHeroId: heroId,
            })
            .expect(409);

        expect(secondRunResponse.body).toEqual({
            error: 'An active game run already exists.',
        });

        const activeRuns = db
            .prepare(`
                SELECT id, status
                FROM game_runs
                WHERE user_id = ?
                AND status = 'active'
            `)
            .all(firstRunResponse.body.run.userId) as {
                id: number;
                status: string;
            }[];

        expect(activeRuns).toHaveLength(1);

        expect(activeRuns[0]).toEqual({
            id: firstRunId,
            status: 'active'
        });
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
                username: 'invalid-runId-player',
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

    it('does not allow one user to reset another user\'s game run', async () => {
        const playerOne = request.agent(app);
        const playerTwo = request.agent(app);

        await playerOne
            .post('/api/auth/register')
            .send({
                username: 'run-owner',
                password: 'password123',
            })
            .expect(201);

        await playerTwo
            .post('/api/auth/register')
            .send({
                username: 'run-attacker',
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
                'Ownership Knight',
                'A hero used for ownership testing.',
                '/images/ownership-knight.png',
                100,
                15,
                8,
            );

        const heroId = Number(heroResult.lastInsertRowid);

        const runResponse = await playerOne
            .post('/api/runs')
            .send({
                selectedHeroId: heroId,
            })
            .expect(201);

        const runId = runResponse.body.run.id;

        const response = await playerTwo
            .post(`/api/runs/${runId}/reset`)
            .expect(404);

        expect(response.body).toEqual({
            error: 'Game run not found.',
        });

        const run = db
            .prepare(`
                SELECT status, completed_at
                FROM game_runs
                WHERE id = ?
            `)
            .get(runId) as {
                status: string;
                completed_at: string | null;
            };

        expect(run).toEqual({
            status: 'active',
            completed_at: null,
        });
    });

    describe('game run lifecycle integrity', () => {

        it('abandons the active battle when resetting an active game run', async () => {
            const agent = request.agent(app);

            await agent
                .post('/api/auth/register')
                .send({
                    username: 'stage17-reset-player',
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
                    'Stage 17 Reset Knight',
                    'A hero used for Stage 17 reset testing.',
                    '/images/stage17-reset-knight.png',
                    100,
                    15,
                    8
                );

            const heroId = Number(heroResult.lastInsertRowid);

            const runResponse = await agent
                .post('/api/runs')
                .send({
                    selectedHeroId: heroId,
                })
                .expect(201);

            const runId = runResponse.body.run.id;

            const battleResult = db
                .prepare(`
                    INSERT INTO battles (
                        run_id,
                        hero_id,
                        player_health,
                        player_max_health,
                        enemy_name,
                        enemy_health,
                        enemy_max_health,
                        enemy_attack,
                        enemy_defense
                    )
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                `)
                .run(
                    runId,
                    heroId,
                    100,
                    100,
                    'Goblin',
                    50,
                    50,
                    8,
                    3
                );

            const battleId = Number(battleResult.lastInsertRowid);

            const resetResponse = await agent
                .post(`/api/runs/${runId}/reset`)
                .expect(200);

            expect(resetResponse.body.run).toMatchObject({
                id: runId,
                status: 'abandoned',
            });

            const battle = db
                .prepare(`
                    SELECT
                        id,
                        run_id,
                        status,
                        completed_at
                    FROM battles
                    WHERE id = ?
                `)
                .get(battleId) as {
                    id: number;
                    run_id: number;
                    status: string;
                    completed_at: string | null;
                };

            expect(battle).toMatchObject({
                id: battleId,
                run_id: runId,
                status: 'abandoned',
            });

            expect(battle.completed_at)
                .toEqual(expect.any(String));
        });

        it('completes the run and abandons its active battle when the user logs out', async () => {
            const agent = request.agent(app);

            await agent
                .post('/api/auth/register')
                .send({
                    username: 'complete-player',
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
                    'Stage 17 Complete Knight',
                    'A hero used for Stage 17 completion testing.',
                    '/images/stage17-complete-knight.png',
                    100,
                    15,
                    8,
                );

            const heroId = Number(heroResult.lastInsertRowid);

            const runResponse = await agent
                .post('/api/runs')
                .send({
                    selectedHeroId: heroId,
                })
                .expect(201);

            const runId = runResponse.body.run.id;

            const battleResult = db
                .prepare(`
                    INSERT INTO battles (
                        run_id,
                        hero_id,
                        player_health,
                        player_max_health,
                        enemy_name,
                        enemy_health,
                        enemy_max_health,
                        enemy_attack,
                        enemy_defense
                    )
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                `)
                .run(
                    runId,
                    heroId,
                    100,
                    100,
                    'Goblin',
                    50,
                    50,
                    8,
                    3,
                );

            const battleId = Number(battleResult.lastInsertRowid);

            await agent
                .post('/api/auth/logout')
                .expect(204);

            const run = db
                .prepare(`
                    SELECT
                        id,
                        status,
                        completed_at
                    FROM game_runs
                    WHERE id = ?
                `)
                .get(runId) as {
                    id: number;
                    status: string;
                    completed_at: string | null;
                };

            expect(run).toMatchObject({
                id: runId,
                status: 'completed',
            });

            expect(run.completed_at)
                .toEqual(expect.any(String));

            const battle = db
                .prepare(`
                    SELECT
                        id,
                        run_id,
                        status,
                        completed_at
                    FROM battles
                    WHERE id = ?
                `)
                .get(battleId) as {
                    id: number;
                    run_id: number;
                    status: string;
                    completed_at: string | null;
                };

            expect(battle).toMatchObject({
                id: battleId,
                run_id: runId,
                status: 'abandoned',
            });

            expect(battle.completed_at)
                .toEqual(expect.any(String));
        });

        it('clears the session run after resetting so a new run can be created', async () => {
            const agent = request.agent(app);

            await agent
                .post('/api/auth/register')
                .send({
                    username: 'reset-session-player',
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
                    'Reset Session Knight',
                    'A hero used for session reset testing.',
                    '/images/reset-session-knight.png',
                    100,
                    15,
                    8,
                );

            const heroId = Number(heroResult.lastInsertRowid);

            const firstRunResponse = await agent
                .post('/api/runs')
                .send({
                    selectedHeroId: heroId,
                })
                .expect(201);

            const firstRunId = firstRunResponse.body.run.id;

            await agent
                .post(`/api/runs/${firstRunId}/reset`)
                .expect(200);

            const secondRunResponse = await agent
                .post('/api/runs')
                .send({
                    selectedHeroId: heroId,
                })
                .expect(201);

            const secondRunId = secondRunResponse.body.run.id;

            expect(secondRunId).not.toBe(firstRunId);

            const runs = db
                .prepare(`
                    SELECT
                        id,
                        status
                    FROM game_runs
                    WHERE id IN (?, ?)
                    ORDER BY id
                `)
                .all(firstRunId, secondRunId) as {
                    id: number;
                    status: string;
                }[];

            expect(runs).toEqual([
                {
                    id: firstRunId,
                    status: 'abandoned',
                },
                {
                    id: secondRunId,
                    status: 'active',
                },
            ]);
        });

        it('allows a new run after logout and login', async () => {
            const agent = request.agent(app);

            await agent
                .post('/api/auth/register')
                .send({
                    username: 'new-run-after-login',
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
                    'Login Lifecycle Knight',
                    'A hero used for login lifecycle testing.',
                    '/images/login-lifecycle-knight.png',
                    100,
                    15,
                    8,
                );

            const heroId = Number(heroResult.lastInsertRowid);

            const firstRunResponse = await agent
                .post('/api/runs')
                .send({
                    selectedHeroId: heroId,
                })
                .expect(201);

            const firstRunId = firstRunResponse.body.run.id;

            await agent
                .post('/api/auth/logout')
                .expect(204);

            await agent
                .post('/api/auth/login')
                .send({
                    username: 'new-run-after-login',
                    password: 'password123',
                })
                .expect(200);

            const secondRunResponse = await agent
                .post('/api/runs')
                .send({
                    selectedHeroId: heroId,
                })
                .expect(201);

            const secondRunId = secondRunResponse.body.run.id;

            expect(secondRunId).not.toBe(firstRunId);

            const runs = db
                .prepare(`
                    SELECT
                        id,
                        status
                    FROM game_runs
                    WHERE id IN (?, ?)
                    ORDER BY id
                `)
                .all(firstRunId, secondRunId) as {
                    id: number;
                    status: string;
                }[];

            expect(runs).toEqual([
                {
                    id: firstRunId,
                    status: 'completed',
                },
                {
                    id: secondRunId,
                    status: 'active',
                },
            ]);
        });

        it('rejects resetting a completed game run', async () => {
            const agent = request.agent(app);

            await agent
                .post('/api/auth/register')
                .send({
                    username: 'completed-run-reset',
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
                    'Completed Reset Knight',
                    'A hero used for completed run testing.',
                    '/images/completed-reset-knight.png',
                    100,
                    15,
                    8,
                );

            const runResponse = await agent
                .post('/api/runs')
                .send({
                    selectedHeroId: Number(heroResult.lastInsertRowid),
                })
                .expect(201);

            const runId = runResponse.body.run.id;

            await agent
                .post('/api/auth/logout')
                .expect(204);

            await agent
                .post('/api/auth/login')
                .send({
                    username: 'completed-run-reset',
                    password: 'password123',
                })
                .expect(200);

            const response = await agent
                .post(`/api/runs/${runId}/reset`)
                .expect(409);

            expect(response.body).toEqual({
                error: 'Game run is not active.',
            });

            const run = db
                .prepare(`
                    SELECT status, completed_at
                    FROM game_runs
                    WHERE id = ?
                `)
                .get(runId) as {
                    status: string;
                    completed_at: string | null;
                };

            expect(run.status).toBe('completed');
            expect(run.completed_at).toEqual(expect.any(String));
        });

    });
});