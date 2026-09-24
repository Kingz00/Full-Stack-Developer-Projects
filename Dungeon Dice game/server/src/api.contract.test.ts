import Database from 'better-sqlite3';
import request from 'supertest';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { createApp } from './app.js';

describe('API contract', () => {
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
                    CHECK (status IN ('active', 'won', 'lost', 'draw', 'abandoned')),

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

            CREATE TABLE battle_rounds (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                battle_id INTEGER NOT NULL,
                round_number INTEGER NOT NULL,

                player_roll INTEGER NOT NULL
                    CHECK (player_roll >= 0),

                enemy_roll INTEGER NOT NULL
                    CHECK (enemy_roll >= 0),

                player_damage INTEGER NOT NULL
                    CHECK (player_damage >= 0),

                enemy_damage INTEGER NOT NULL
                    CHECK (enemy_damage >= 0),

                player_health_after INTEGER NOT NULL
                    CHECK (player_health_after >= 0),

                enemy_health_after INTEGER NOT NULL
                    CHECK (enemy_health_after >= 0),

                outcome TEXT NOT NULL
                    CHECK (outcome IN ('active', 'win', 'loss', 'draw')),

                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

                FOREIGN KEY (battle_id)
                    REFERENCES battles(id)
                    ON DELETE CASCADE,

                UNIQUE (battle_id, round_number)
            );

            CREATE INDEX idx_battle_rounds_battle_id
                ON battle_rounds(battle_id);
        `);

        app = createApp(db);
    });

    afterEach(() => {
        db.close();
    });

    function createHero(name: string, health = 18, attack = 8, defense = 7): number {
        const result = db
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
                name,
                `Description for ${name}.`,
                `/heroes/${name.toLowerCase().replace(/\s+/g, '-')}.png`,
                health,
                attack,
                defense
            );

        return Number(result.lastInsertRowid);
    }

    async function registerUser(
        agent: ReturnType<typeof request.agent>,
        username = 'contract-user',
        password = 'password123'
    ) {
        return agent
            .post('/api/auth/register')
            .send({
                username,
                password
            });
    }

    async function createAuthenticatedAgent(
        username = 'contract-user',
        password = 'password123'
    ) {
        const agent = request.agent(app);

        const response = await registerUser(
            agent,
            username,
            password
        );

        expect(response.status).toBe(201);

        return agent;
    }

    async function createAuthenticatedRun(
        agent: ReturnType<typeof request.agent>,
        heroId: number
    ): Promise<number> {
        const response = await agent
            .post('/api/runs')
            .send({
                selectedHeroId: heroId
            });

        expect(response.status).toBe(201);

        return response.body.run.id;
    }

    describe('GET /api/health', () => {
        it('returns the health response contract', async () => {
            const response = await request(app).get('/api/health');

            expect(response.status).toBe(200);

            expect(response.body).toEqual({
                status: 'ok'
            });
        });
    });

    describe('GET /api/heroes', () => {
        it('returns the hero collection contract', async () => {
            createHero('Knight of Ashfang');

            const response = await request(app).get('/api/heroes');

            expect(response.status).toBe(200);

            expect(response.body).toHaveProperty('heroes');
            expect(Array.isArray(response.body.heroes)).toBe(true);

            expect(response.body.heroes).toHaveLength(1);

            const hero = response.body.heroes[0];

            expect(hero).toEqual({
                id: expect.any(Number),
                name: 'Knight of Ashfang',
                description: expect.any(String),
                imageUrl: expect.any(String),
                health: expect.any(Number),
                attack: expect.any(Number),
                defense: expect.any(Number),
            });

            expect(hero).not.toHaveProperty('image_url');
            expect(hero).not.toHaveProperty('created_at');
        });
    });

    describe('Authentication API', () => {
        describe('POST /api/auth/register', () => {
            it('returns the registered user contract', async () => {
                const response = await request(app)
                    .post('/api/auth/register')
                    .send({
                        username: 'contract-register',
                        password: 'password123',
                    });

                expect(response.status).toBe(201);

                expect(response.body).toEqual({
                    user: {
                        id: expect.any(Number),
                        username: 'contract-register',
                        createdAt: expect.any(String),
                    },
                });

                expect(response.body.user)
                    .not.toHaveProperty('passwordHash');

                expect(response.body.user)
                    .not.toHaveProperty('password');
            });
        });

        describe('POST /api/auth/login', () => {
            it('returns the authenticated user contract', async () => {
                await request(app)
                    .post('/api/auth/register')
                    .send({
                        username: 'contract-login',
                        password: 'password123',
                    })
                    .expect(201);

                const response = await request(app)
                    .post('/api/auth/login')
                    .send({
                        username: 'contract-login',
                        password: 'password123',
                    });

                expect(response.status).toBe(200);

                expect(response.body).toEqual({
                    user: {
                        id: expect.any(Number),
                        username: 'contract-login',
                        createdAt: expect.any(String),
                    },
                });

                expect(response.body.user)
                    .not.toHaveProperty('passwordHash');

                expect(response.body.user)
                    .not.toHaveProperty('password');
            });
        });

        describe('GET /api/auth/me', () => {
            it('returns the current authenticated user contract', async () => {
                const agent = await createAuthenticatedAgent('contract-me');

                const response = await agent.get('/api/auth/me');

                expect(response.status).toBe(200);

                expect(response.body).toEqual({
                    user: {
                        id: expect.any(Number),
                        username: 'contract-me',
                        createdAt: expect.any(String)
                    },
                });

                expect(response.body.user)
                    .not.toHaveProperty('passwordHash');

                expect(response.body.user)
                    .not.toHaveProperty('password');
            });

            it('returns the authentication error contract when unauthenticated', async () => {
                const response = await request(app).get('/api/auth/me');

                expect(response.status).toBe(401);

                expect(response.body).toEqual({
                    error: 'Authentication required.'
                });
            });
        });

        describe('POST /api/auth/logout', () => {
            it('returns the logout response contract', async () => {
                const agent = await createAuthenticatedAgent('contract-logout');

                const response = await agent.post('/api/auth/logout');

                expect(response.status).toBe(204);
            });
        });
    });

    describe('Game Run API', () => {
        describe('POST /api/runs', () => {
            it('returns the game run contract', async () => {
                const heroId = createHero('Run Hero', 18, 8, 7);

                const agent = await createAuthenticatedAgent('contract-run');

                const response = await agent
                    .post('/api/runs')
                    .send({
                        selectedHeroId: heroId
                    });

                expect(response.status).toBe(201);

                expect(response.body.run).toEqual({
                    id: expect.any(Number),
                    userId: expect.any(Number),
                    selectedHeroId: heroId,
                    status: 'active',
                    startedAt: expect.any(String),
                    completedAt: null
                });
            });

            it('returns the validation error contract for an invalid selected hero ID', async () => {
                const agent = await createAuthenticatedAgent('contract-run');

                const response = await agent
                    .post('/api/runs')
                    .send({
                        selectedHeroId: '1'
                    });

                expect(response.status).toBe(400);

                expect(response.body).toEqual({
                    error: 'A valid selected hero ID is required.',
                });
            });
        });

        describe('POST /api/runs/:runId/reset', () => {
            it('returns the abandoned game run contract', async () => {
                const heroId = createHero('Reset Hero', 18, 8, 7);

                const agent = await createAuthenticatedAgent('contract-reset');

                const runId = await createAuthenticatedRun(agent, heroId);

                const response = await agent.post(`/api/runs/${runId}/reset`);

                expect(response.status).toBe(200);

                expect(response.body.run).toEqual({
                    id: runId,
                    userId: expect.any(Number),
                    selectedHeroId: heroId,
                    status: 'abandoned',
                    startedAt: expect.any(String),
                    completedAt: expect.any(String)
                });
            });
        });
    });

    describe('Battle API', () => {
        describe('POST /api/runs/:runId/battles', () => {
            it('returns the battle creation contract', async () => {
                const playerHeroId = createHero('Battle Player', 18, 8, 7);

                createHero('Battle Enemy', 20, 7, 8);

                const agent = await createAuthenticatedAgent('contract-battle');

                const runId = await createAuthenticatedRun(agent, playerHeroId);

                const response = await agent.post(`/api/runs/${runId}/battles`);

                expect(response.status).toBe(201);

                expect(response.body.battle).toEqual({
                    id: expect.any(Number),
                    runId,
                    heroId: playerHeroId,

                    playerHealth: expect.any(Number),
                    playerMaxHealth: expect.any(Number),

                    enemyName: expect.any(String),
                    enemyHealth: expect.any(Number),
                    enemyMaxHealth: expect.any(Number),
                    enemyAttack: expect.any(Number),
                    enemyDefense: expect.any(Number),

                    status: 'active',
                    startedAt: expect.any(String),
                    completedAt: null
                });
            });

            it('returns the not-found error contract for an unknown run', async () => {
                const agent = await createAuthenticatedAgent('contract-battle');

                const response = await agent.post('/api/runs/999/battles');

                expect(response.status).toBe(404);

                expect(response.body).toEqual({
                    error: 'Game run not found.'
                });
            });
        });

        describe('POST /api/battles/:battleId/rounds', () => {
            it('returns the battle round contract', async () => {
                const playerHeroId = createHero('Round Player', 100, 10, 8);

                createHero('Round Enemy', 100, 10, 8);

                const agent = await createAuthenticatedAgent('contract-round');

                const runId = await createAuthenticatedRun(agent, playerHeroId);

                const battleResponse = await agent.post(`/api/runs/${runId}/battles`);

                expect(battleResponse.status).toBe(201);

                const battleId = battleResponse.body.battle.id;

                const response = await agent.post(`/api/battles/${battleId}/rounds`);

                expect(response.status).toBe(200);

                expect(response.body).toEqual({
                    state: {
                        player: {
                            health: expect.any(Number),
                            maxHealth: expect.any(Number),
                            attack: expect.any(Number),
                            defense: expect.any(Number)
                        },
                        enemy: {
                            health: expect.any(Number),
                            maxHealth: expect.any(Number),
                            attack: expect.any(Number),
                            defense: expect.any(Number)
                        },
                        status: expect.stringMatching(
                            /^(active|won|lost|draw|abandoned)$/,
                        ),
                    },
                    round: {
                        playerRoll: expect.any(Number),
                        enemyRoll: expect.any(Number),
                        playerDamage: expect.any(Number),
                        enemyDamage: expect.any(Number),
                        playerHealthAfter: expect.any(Number),
                        enemyHealthAfter: expect.any(Number),
                        status: expect.stringMatching(
                            /^(active|won|lost|draw)$/,
                        ),
                    },
                });
            });
        });
    });

    describe('Player Statistics API', () => {
        describe('GET /api/stats', () => {
            it('returns the player statistics contract for a new user', async () => {
                const agent = await createAuthenticatedAgent('contract-stats');

                const response = await agent.get('/api/stats');

                expect(response.status).toBe(200);

                expect(response.body).toEqual({
                    statistics: {
                        totalBattles: 0,
                        wins: 0,
                        losses: 0,
                        draws: 0,
                        bestRun: null
                    },
                });
            });
        });
    });
});