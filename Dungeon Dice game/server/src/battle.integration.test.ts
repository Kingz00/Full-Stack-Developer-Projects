import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import request from 'supertest';

import { createApp } from './app.js';
import { createDatabase } from './db/database.js';

describe('battle integration', () => {
    let db: ReturnType<typeof createDatabase>;
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
                CHECK (status IN ('active', 'won', 'lost', 'draw')),
            started_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
            completed_at TEXT,

            FOREIGN KEY (run_id)
                REFERENCES game_runs(id)
                ON DELETE CASCADE,

            FOREIGN KEY (hero_id)
                REFERENCES heroes(id)
        );

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
    `);

        app = createApp(db);
    });

    afterEach(() => {
        db.close();
    });

    it('rejects unauthenticated battle creation', async () => {
        const response = await request(app)
            .post('/api/runs/1/battles');

        expect(response.status).toBe(401);
    });

    it('rejects unauthenticated round execution', async () => {
        const response = await request(app)
            .post('/api/battles/1/rounds');

        expect(response.status).toBe(401);
    });

    it('creates a battle for an authenticated user', async () => {
        const agent = request.agent(app);

        await agent
            .post('/api/auth/register')
            .send({
                username: 'battle-player',
                password: 'password123',
            })
            .expect(201);

        // Seed heroes required by the battle.
        const selectedHero = db.prepare(`
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
            'Knight',
            'A balanced warrior.',
            '/images/knight.png',
            100,
            15,
            8,
        );

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
                `)
            .run(
                'Orc',
                'A powerful enemy.',
                '/images/orc.png',
                80,
                12,
                4,
            );

        const runResponse = await agent
            .post('/api/runs')
            .send({
                selectedHeroId: Number(selectedHero.lastInsertRowid),
            })
            .expect(201);

        const runId = runResponse.body.run.id;

        const response = await agent
            .post(`/api/runs/${runId}/battles`)
            .expect(201);

        expect(response.body.battle).toMatchObject({
            runId,
            heroId: Number(selectedHero.lastInsertRowid),
            playerHealth: 100,
            playerMaxHealth: 100,
            enemyName: 'Orc',
            enemyHealth: 80,
            enemyMaxHealth: 80,
            enemyAttack: 12,
            enemyDefense: 4,
            status: 'active'
        });
    });

    it('does not allow one user to play another user\'s battle', async () => {
        const playerOne = request.agent(app);
        const playerTwo = request.agent(app);

        // Register user 1.
        await playerOne
            .post('/api/auth/register')
            .send({
                username: 'player-one',
                password: 'password123',
            })
            .expect(201);

        // Register user 2.
        await playerTwo
            .post('/api/auth/register')
            .send({
                username: 'player-two',
                password: 'password123',
            })
            .expect(201);

        // Seed heroes.
        const heroResult = db.prepare(`
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
            'Knight',
            'A balanced warrior.',
            '/images/knight.png',
            100,
            15,
            8,
        );

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
            'Orc',
            'A powerful enemy.',
            '/images/orc.png',
            80,
            12,
            4,
        );

        const runResponse = await playerOne
            .post('/api/runs')
            .send({
                selectedHeroId: Number(heroResult.lastInsertRowid),
            })
            .expect(201);

        const runId = runResponse.body.run.id;

        // User 1 creates the battle.
        const battleResponse = await playerOne
            .post(`/api/runs/${runId}/battles`)
            .expect(201);

        const battleId = battleResponse.body.battle.id;

        // User 2 attempts to play User 1's battle.
        const response = await playerTwo
            .post(`/api/battles/${battleId}/rounds`)
            .expect(404);

        expect(response.body).toMatchObject({
            error: 'Battle not found.',
        });
    });

    it('plays a round for an authenticated user', async () => {
        const agent = request.agent(app);

        await agent
            .post('/api/auth/register')
            .send({
                username: 'round-player',
                password: 'password123',
            })
            .expect(201);

        const heroResult = db.prepare(`
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
            'Knight',
            'A balanced warrior.',
            '/images/knight.png',
            100,
            15,
            8,
        );

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
            'Orc',
            'A powerful enemy.',
            '/images/orc.png',
            80,
            12,
            4,
        );

        const runResponse = await agent
            .post('/api/runs')
            .send({
                selectedHeroId: Number(heroResult.lastInsertRowid),
            })
            .expect(201);

        const runId = runResponse.body.run.id;

        const battleResponse = await agent
            .post(`/api/runs/${runId}/battles`)
            .expect(201);

        const battleId = battleResponse.body.battle.id;

        const response = await agent
            .post(`/api/battles/${battleId}/rounds`)
            .expect(200);

        expect(response.body.round).toBeDefined();
        expect(response.body.state).toBeDefined();

        expect([
            'active', 'won', 'lost', 'draw',
        ]).toContain(response.body.round.status);
    });

    it('persists the played round', async () => {
        const agent = request.agent(app);

        await agent
            .post('/api/auth/register')
            .send({
                username: 'history-player',
                password: 'password123',
            })
            .expect(201);

        const heroResult = db.prepare(`
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
            'Knight',
            'A balanced warrior.',
            '/images/knight.png',
            100,
            15,
            8,
        );

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
            'Orc',
            'A powerful enemy.',
            '/images/orc.png',
            80,
            12,
            4,
        );

        const runResponse = await agent
            .post('/api/runs')
            .send({
                selectedHeroId: Number(heroResult.lastInsertRowid),
            })
            .expect(201);

        const runId = runResponse.body.run.id;

        const battleResponse = await agent
            .post(`/api/runs/${runId}/battles`)
            .expect(201);

        const battleId = battleResponse.body.battle.id;

        const response = await agent
            .post(`/api/battles/${battleId}/rounds`)
            .expect(200);

        const round = db
            .prepare(`
                SELECT
                    battle_id,
                    round_number,
                    player_roll,
                    enemy_roll,
                    player_damage,
                    enemy_damage,
                    player_health_after,
                    enemy_health_after,
                    outcome
                FROM battle_rounds
                WHERE battle_id = ?
            `)
            .get(battleId) as {
                battle_id: number;
                round_number: number;
                player_roll: number;
                enemy_roll: number;
                player_damage: number;
                enemy_damage: number;
                player_health_after: number;
                enemy_health_after: number;
                outcome: string;
            };

        expect(round).toBeDefined();

        expect(round).toMatchObject({
            battle_id: battleId,
            round_number: 1,
            player_roll: response.body.round.playerRoll,
            enemy_roll: response.body.round.enemyRoll,
            player_damage: response.body.round.playerDamage,
            enemy_damage: response.body.round.enemyDamage,
            player_health_after: response.body.round.playerHealthAfter,
            enemy_health_after: response.body.round.enemyHealthAfter,
            outcome: response.body.round.status === 'active'
                ? 'active'
                : response.body.round.status === 'won'
                    ? 'win'
                    : response.body.round.status === 'lost'
                        ? 'loss'
                        : 'draw',
        });
    });

    it('keeps the game run active after a battle ends and allows another battle', async () => {
        const agent = request.agent(app);

        await agent
            .post('/api/auth/register')
            .send({
                username: 'continuous-run-player',
                password: 'password123',
            })
            .expect(201);

        const heroResult = db.prepare(`
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
            'Knight',
            'A balanced warrior.',
            '/images/knight.png',
            100,
            15,
            8,
        );

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
            'Orc',
            'A powerful enemy.',
            '/images/orc.png',
            80,
            12,
            4,
        );

        const runResponse = await agent
            .post('/api/runs')
            .send({
                selectedHeroId: Number(heroResult.lastInsertRowid),
            })
            .expect(201);

        const runId = runResponse.body.run.id;

        const firstBattleResponse = await agent
            .post(`/api/runs/${runId}/battles`)
            .expect(201);

        const firstBattleId = firstBattleResponse.body.battle.id;

        // Make the first battle deterministic:
        // the player's next attack will definitely reduce the enemy to 0 HP.
        db.prepare(`
            UPDATE battles
            SET enemy_health = 1
            WHERE id = ?
        `).run(firstBattleId);

        const roundResponse = await agent
            .post(`/api/battles/${firstBattleId}/rounds`)
            .expect(200);

        expect(roundResponse.body.round.status).toBe('won');

        const firstBattle = db
            .prepare(`
                SELECT
                    id,
                    run_id,
                    status,
                    completed_at
                FROM battles
                WHERE id = ?
            `)
            .get(firstBattleId) as {
                id: number;
                run_id: number;
                status: string;
                completed_at: string | null;
            };

        expect(firstBattle).toMatchObject({
            id: firstBattleId,
            run_id: runId,
            status: 'won',
        });

        expect(firstBattle.completed_at)
            .toEqual(expect.any(String));

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
            status: 'active',
            completed_at: null,
        });

        // The same active run must be able to start another battle.
        const secondBattleResponse = await agent
            .post(`/api/runs/${runId}/battles`)
            .expect(201);

        expect(secondBattleResponse.body.battle).toMatchObject({
            runId,
            status: 'active',
        });

        expect(secondBattleResponse.body.battle.id)
            .not.toBe(firstBattleId);
    });

    it('rejects rounds after the parent game run is reset', async () => {
        const agent = request.agent(app);

        await agent
            .post('/api/auth/register')
            .send({
                username: 'reset-battle-player',
                password: 'password123',
            })
            .expect(201);

        const heroResult = db.prepare(`
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
            'Reset Knight',
            'A hero used for reset testing.',
            '/images/reset-knight.png',
            100,
            15,
            8,
        );

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
            'Reset Orc',
            'An enemy used for reset testing.',
            '/images/reset-orc.png',
            80,
            12,
            4,
        );

        const runResponse = await agent
            .post('/api/runs')
            .send({
                selectedHeroId: Number(heroResult.lastInsertRowid),
            })
            .expect(201);

        const runId = runResponse.body.run.id;

        const battleResponse = await agent
            .post(`/api/runs/${runId}/battles`)
            .expect(201);

        const battleId = battleResponse.body.battle.id;

        await agent
            .post(`/api/runs/${runId}/reset`)
            .expect(200);

        const roundResponse = await agent
            .post(`/api/battles/${battleId}/rounds`)
            .expect(409);

        expect(roundResponse.body).toEqual({
            error: 'Game run is not active.',
        });

        const roundCount = db
            .prepare(`
                SELECT COUNT(*) AS count
                FROM battle_rounds
                WHERE battle_id = ?
            `)
            .get(battleId) as {
                count: number;
            };

        expect(roundCount.count).toBe(0);

        const battle = db
            .prepare(`
                SELECT
                    status,
                    completed_at
                FROM battles
                WHERE id = ?
            `)
            .get(battleId) as {
                status: string;
                completed_at: string | null;
            };

        expect(battle).toEqual({
            status: 'active',
            completed_at: null,
        });
    });

    it('rejects starting a new battle after the parent game run is reset', async () => {
        const agent = request.agent(app);

        await agent
            .post('/api/auth/register')
            .send({
                username: 'reset-start-battle-player',
                password: 'password123',
            })
            .expect(201);

        const heroResult = db.prepare(`
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
            'Reset Start Knight',
            'A hero used for reset testing.',
            '/images/reset-start-knight.png',
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
            .post(`/api/runs/${runId}/reset`)
            .expect(200);

        const run = db
            .prepare(`
                SELECT
                    status,
                    completed_at
                FROM game_runs
                WHERE id = ?
            `)
            .get(runId) as {
                status: string;
                completed_at: string | null;
            };

        expect(run.status).toBe('abandoned');
        expect(run.completed_at).toEqual(expect.any(String));

        const battleResponse = await agent
            .post(`/api/runs/${runId}/battles`)
            .expect(409);

        expect(battleResponse.body).toEqual({
            error: 'Game run is not active.',
        });

        const battles = db
            .prepare(`
                SELECT COUNT(*) AS count
                FROM battles
                WHERE run_id = ?
            `)
            .get(runId) as {
                count: number;
            };

        expect(battles.count).toBe(0);
    });
});