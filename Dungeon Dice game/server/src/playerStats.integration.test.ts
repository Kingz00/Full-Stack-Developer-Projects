import Database from 'better-sqlite3';
import request from 'supertest';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { createApp } from './app.js';
import { createDatabase } from './db/database.js';

describe('Player Statistics API', () => {
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
                    CHECK (status IN ('active','completed','abandoned')),
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
                    CHECK (status IN ('active','won','lost','draw','abandoned')),

                started_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                completed_at TEXT,

                FOREIGN KEY (run_id)
                    REFERENCES game_runs(id)
                    ON DELETE CASCADE
            );

            CREATE INDEX idx_battles_run_id
                ON battles(run_id);

            CREATE UNIQUE INDEX idx_battles_one_active_per_run
                ON battles(run_id)
                WHERE status = 'active';
        `);

        db.prepare(`
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
            'Test Hero',
            'A hero used for testing.',
            '/images/test-hero.png',
            100,
            10,
            5,
        );

        app = createApp(db);
    });

    afterEach(() => {
        db.close();
    });

    function createRun(
        userId: number,
        status: 'active' | 'completed' | 'abandoned'
    ): number {
        const result = db.prepare(`
            INSERT INTO game_runs (
                user_id,
                selected_hero_id,
                status
            )
            VALUES (?, ?, ?)
            `).run(userId, 1, status);

        return Number(result.lastInsertRowid);
    }

    function createBattle(
        runId: number,
        status: 'active' | 'won' | 'lost' | 'draw' | 'abandoned'
    ): number {
        const result = db.prepare(`
            INSERT INTO battles (
                run_id,
                hero_id,
                player_health,
                player_max_health,
                enemy_name,
                enemy_health,
                enemy_max_health,
                enemy_attack,
                enemy_defense,
                status
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
            runId,
            1,
            100,
            100,
            'Test Enemy',
            100,
            100,
            10,
            5,
            status
        );

        return Number(result.lastInsertRowid);
    }

    async function register(
        agent: ReturnType<typeof request.agent>,
        username: string
    ) {
        return agent
            .post('/api/auth/register')
            .send({
                username,
                password: 'password123',
            });
    }

    it('rejects unauthenticated statistics requests', async () => {
        const response = await request(app)
            .get('/api/stats');

        expect(response.status).toBe(401);

        expect(response.body).toEqual({
            error: 'Authentication required.'
        });
    });

    it('returns zero statistics for a newly registered user', async () => {
        const agent = request.agent(app);

        const registerResponse = await register(
            agent,
            'stats-player'
        );

        expect(registerResponse.status).toBe(201);

        const user = db.prepare(`
            SELECT id FROM users
            WHERE username = ?
        `).get('stats-player') as {
            id: number;
        };

        const response = await agent.get('/api/stats');

        expect(response.status).toBe(200);

        expect(response.body).toEqual({
            statistics: {
                totalBattles: 0,
                wins: 0,
                losses: 0,
                draws: 0,
                bestRun: null,
            }
        });

        expect(user.id).toBeGreaterThan(0);
    });

    it('returns the authenticated user\'s battle statistics', async () => {
        const agent = request.agent(app);

        await register(agent, 'stats-player');

        const user = db.prepare(`
            SELECT id FROM users
            WHERE username = ?
        `).get('stats-player') as {
            id: number;
        };

        const runId = createRun(user.id, 'completed');

        createBattle(runId, 'won');
        createBattle(runId, 'won');
        createBattle(runId, 'lost');
        createBattle(runId, 'draw');

        const response = await agent.get('/api/stats');

        expect(response.status).toBe(200);

        expect(response.body.statistics).toMatchObject({
            totalBattles: 4,
            wins: 2,
            losses: 1,
            draws: 1
        });

        expect(response.body.statistics.bestRun)
            .toEqual({
                runId,
                totalBattles: 4,
                wins: 2,
                losses: 1,
                draws: 1
            });
    });

    it('excludes active and abandoned battles from totals', async () => {
        const agent = request.agent(app);

        await register(agent, 'stats-player');

        const user = db.prepare(`
            SELECT id FROM users
            WHERE username = ?
        `).get('stats-player') as {
            id: number;
        };

        const runId = createRun(user.id, 'completed');

        createBattle(runId, 'won');
        createBattle(runId, 'lost');
        createBattle(runId, 'draw');
        createBattle(runId, 'active');
        createBattle(runId, 'abandoned');

        const response = await agent.get('/api/stats');

        expect(response.status).toBe(200);

        expect(response.body.statistics)
            .toMatchObject({
                totalBattles: 3,
                wins: 1,
                losses: 1,
                draws: 1
            });
    });

    it('does not allow an abandoned run to become bestRun', async () => {
        const agent = request.agent(app);

        await register(agent, 'stats-player');

        const user = db.prepare(`
            SELECT id FROM users
            WHERE username = ?
        `).get('stats-player') as {
            id: number;
        };

        const abandonedRun = createRun(user.id, 'abandoned');

        for (let i = 0; i < 10; i++) {
            createBattle(abandonedRun, 'won');
        }

        const completedRun = createRun(user.id, 'completed');

        createBattle(completedRun, 'won');
        createBattle(completedRun, 'won');

        const response = await agent.get('/api/stats');

        expect(response.status).toBe(200);

        expect(
            response.body.statistics.bestRun.runId
        ).toBe(completedRun);
    });

    it('does not allow an active run to become bestRun', async () => {
        const agent = request.agent(app);

        await register(agent, 'stats-player');

        const user = db.prepare(`
            SELECT id FROM users
            WHERE username = ?
        `).get('stats-player') as {
            id: number;
        };

        const activeRun = createRun(user.id, 'active');

        for (let i = 0; i < 10; i++) {
            createBattle(activeRun, 'won');
        }

        const completedRun = createRun(user.id, 'completed');

        createBattle(completedRun, 'won');
        createBattle(completedRun, 'won');

        const response = await agent.get('/api/stats');

        expect(response.status).toBe(200);

        expect(
            response.body.statistics.bestRun.runId
        ).toBe(completedRun);
    });

    it('isolates statistics between users', async () => {
        const agentOne = request.agent(app);
        const agentTwo = request.agent(app);

        await register(agentOne, 'stats-player-one');

        await register(agentTwo, 'stats-player-two');

        const userOne = db.prepare(`
            SELECT id FROM users
            WHERE username = ?
        `).get('stats-player-one') as {
            id: number;
        };

        const userTwo = db.prepare(`
            SELECT id FROM users
            WHERE username = ?
        `).get('stats-player-two') as {
            id: number;
        };

        const userOneRun = createRun(userOne.id, 'completed');

        createBattle(userOneRun, 'won');
        createBattle(userOneRun, 'lost');

        const userTwoRun = createRun(userTwo.id, 'completed');

        for (let i = 0; i < 10; i++) {
            createBattle(userTwoRun, 'won');
        }

        const response = await agentOne.get('/api/stats');

        expect(response.status).toBe(200);

        expect(response.body.statistics)
            .toMatchObject({
                totalBattles: 2,
                wins: 1,
                losses: 1,
                draws: 0
            });

        expect(
            response.body.statistics.bestRun.runId
        ).toBe(userOneRun);
    });

    it('applies all bestRun tie-breakers in order', async () => {
        const agent = request.agent(app);

        await register(agent, 'stats-player');

        const user = db.prepare(`
            SELECT id FROM users
            WHERE username = ?
        `).get('stats-player') as {
            id: number;
        };

        // Run 1:
        // 4 wins, 3 losses
        const runOne = createRun(user.id, 'completed');

        for (let i = 0; i < 4; i++) {
            createBattle(runOne, 'won');
        }

        for (let i = 0; i < 3; i++) {
            createBattle(runOne, 'lost');
        }

        // Run 2:
        // 4 wins, 1 loss
        const runTwo = createRun(user.id, 'completed');

        for (let i = 0; i < 4; i++) {
            createBattle(runTwo, 'won');
        }

        createBattle(runTwo, 'lost');

        // Run 3:
        // 4 wins, 1 loss, 2 draws
        const runThree = createRun(user.id, 'completed');

        for (let i = 0; i < 4; i++) {
            createBattle(runThree, 'won');
        }

        createBattle(runThree, 'lost');
        createBattle(runThree, 'draw');
        createBattle(runThree, 'draw');

        // Run 4 is deliberately identical to Run 3.
        // Lower run ID should therefore win.
        const runFour = createRun(user.id, 'completed');

        for (let i = 0; i < 4; i++) {
            createBattle(runFour, 'won');
        }

        createBattle(runFour, 'lost');
        createBattle(runFour, 'draw');
        createBattle(runFour, 'draw');

        const response = await agent.get('/api/stats');

        expect(response.status).toBe(200);

        expect(
            response.body.statistics.bestRun
        ).toEqual({
            runId: runThree,
            totalBattles: 7,
            wins: 4,
            losses: 1,
            draws: 2
        });
    });
});