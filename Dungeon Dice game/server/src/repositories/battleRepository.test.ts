import Database from 'better-sqlite3';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { createDatabase } from '../db/database.js';
import { BattleRepository } from './battleRepository.js';

describe('BattleRepository', () => {
    let db: Database.Database;
    let repository: BattleRepository;

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
                    CHECK (status IN ('active', 'won', 'lost', 'draw', 'abandoned')),

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

        db.prepare(`
            INSERT INTO users (username, password_hash)
            VALUES (?, ?)
        `).run('testuser', 'hash');

        db.prepare(`
            INSERT INTO users (username, password_hash)
            VALUES (?, ?)
        `).run('otheruser', 'hash');

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

        db.prepare(`
            INSERT INTO game_runs (
                user_id,
                selected_hero_id
            )
            VALUES (?, ?)
        `).run(1, 1);

        db.prepare(`
            INSERT INTO game_runs (
                user_id,
                selected_hero_id
            )
            VALUES (?, ?)
        `).run(2, 1);

        repository = new BattleRepository(db);
    });

    afterEach(() => {
        db.close();
    });

    it('creates an active battle', () => {
        const battle = repository.createBattle({
            runId: 1,
            heroId: 1,
            playerHealth: 100,
            playerMaxHealth: 100,
            enemyName: 'Goblin',
            enemyHealth: 50,
            enemyMaxHealth: 50,
            enemyAttack: 8,
            enemyDefense: 3,
        });

        expect(battle).toMatchObject({
            id: 1,
            runId: 1,
            heroId: 1,
            playerHealth: 100,
            playerMaxHealth: 100,
            enemyName: 'Goblin',
            enemyHealth: 50,
            enemyMaxHealth: 50,
            enemyAttack: 8,
            enemyDefense: 3,
            status: 'active',
            completedAt: null,
        });

        expect(battle.startedAt).toBeTruthy();
    });

    it('finds a battle by id', () => {
        const created = repository.createBattle({
            runId: 1,
            heroId: 1,
            playerHealth: 100,
            playerMaxHealth: 100,
            enemyName: 'Goblin',
            enemyHealth: 50,
            enemyMaxHealth: 50,
            enemyAttack: 8,
            enemyDefense: 3,
        });

        expect(repository.findById(created.id)).toEqual(created);
    });

    it('returns null when a battle does not exist', () => {
        expect(repository.findById(999)).toBeNull();
    });

    it('finds a battle belonging to a user', () => {
        const battle = repository.createBattle({
            runId: 1,
            heroId: 1,
            playerHealth: 100,
            playerMaxHealth: 100,
            enemyName: 'Goblin',
            enemyHealth: 50,
            enemyMaxHealth: 50,
            enemyAttack: 8,
            enemyDefense: 3,
        });

        expect(
            repository.findByIdForUser(battle.id, 1),
        ).toEqual(battle);
    });

    it('returns null when the battle belongs to another user', () => {
        const battle = repository.createBattle({
            runId: 1,
            heroId: 1,
            playerHealth: 100,
            playerMaxHealth: 100,
            enemyName: 'Goblin',
            enemyHealth: 50,
            enemyMaxHealth: 50,
            enemyAttack: 8,
            enemyDefense: 3,
        });

        expect(
            repository.findByIdForUser(battle.id, 2),
        ).toBeNull();
    });

    it('adds a battle round', () => {
        const battle = repository.createBattle({
            runId: 1,
            heroId: 1,
            playerHealth: 100,
            playerMaxHealth: 100,
            enemyName: 'Goblin',
            enemyHealth: 50,
            enemyMaxHealth: 50,
            enemyAttack: 8,
            enemyDefense: 3,
        });

        const round = repository.addRound({
            battleId: battle.id,
            roundNumber: 1,
            playerRoll: 8,
            enemyRoll: 5,
            playerDamage: 3,
            enemyDamage: 0,
            playerHealthAfter: 100,
            enemyHealthAfter: 47,
            outcome: 'win',
        });

        expect(round).toMatchObject({
            id: 1,
            battleId: battle.id,
            roundNumber: 1,
            playerRoll: 8,
            enemyRoll: 5,
            playerDamage: 3,
            enemyDamage: 0,
            playerHealthAfter: 100,
            enemyHealthAfter: 47,
            outcome: 'win',
        });

        expect(round.createdAt).toBeTruthy();
    });

    it('adds an active battle round', () => {
        const battle = repository.createBattle({
            runId: 1,
            heroId: 1,
            playerHealth: 100,
            playerMaxHealth: 100,
            enemyName: 'Goblin',
            enemyHealth: 50,
            enemyMaxHealth: 50,
            enemyAttack: 8,
            enemyDefense: 3,
        });

        const round = repository.addRound({
            battleId: battle.id,
            roundNumber: 1,
            playerRoll: 4,
            enemyRoll: 3,
            playerDamage: 1,
            enemyDamage: 0,
            playerHealthAfter: 100,
            enemyHealthAfter: 49,
            outcome: 'active',
        });

        expect(round).toMatchObject({
            id: 1,
            battleId: battle.id,
            roundNumber: 1,
            playerRoll: 4,
            enemyRoll: 3,
            playerDamage: 1,
            enemyDamage: 0,
            playerHealthAfter: 100,
            enemyHealthAfter: 49,
            outcome: 'active',
        });

        expect(round.createdAt).toBeTruthy();
    });

    it('returns battle rounds in round-number order', () => {
        const battle = repository.createBattle({
            runId: 1,
            heroId: 1,
            playerHealth: 100,
            playerMaxHealth: 100,
            enemyName: 'Goblin',
            enemyHealth: 50,
            enemyMaxHealth: 50,
            enemyAttack: 8,
            enemyDefense: 3,
        });

        repository.addRound({
            battleId: battle.id,
            roundNumber: 2,
            playerRoll: 4,
            enemyRoll: 6,
            playerDamage: 0,
            enemyDamage: 2,
            playerHealthAfter: 98,
            enemyHealthAfter: 47,
            outcome: 'loss',
        });

        repository.addRound({
            battleId: battle.id,
            roundNumber: 1,
            playerRoll: 8,
            enemyRoll: 5,
            playerDamage: 3,
            enemyDamage: 0,
            playerHealthAfter: 100,
            enemyHealthAfter: 47,
            outcome: 'win',
        });

        const rounds = repository.findRounds(battle.id);

        expect(rounds).toHaveLength(2);
        expect(rounds[0]?.roundNumber).toBe(1);
        expect(rounds[1]?.roundNumber).toBe(2);
    });

    it('updates battle state', () => {
        const battle = repository.createBattle({
            runId: 1,
            heroId: 1,
            playerHealth: 100,
            playerMaxHealth: 100,
            enemyName: 'Goblin',
            enemyHealth: 50,
            enemyMaxHealth: 50,
            enemyAttack: 8,
            enemyDefense: 3,
        });

        const updated = repository.updateState(battle.id, {
            playerHealth: 90,
            enemyHealth: 0,
            status: 'won',
        });

        expect(updated).toMatchObject({
            id: battle.id,
            playerHealth: 90,
            enemyHealth: 0,
            status: 'won',
        });

        expect(updated?.completedAt).toBeTruthy();
    });

    it('keeps completedAt null while a battle is active', () => {
        const battle = repository.createBattle({
            runId: 1,
            heroId: 1,
            playerHealth: 100,
            playerMaxHealth: 100,
            enemyName: 'Goblin',
            enemyHealth: 50,
            enemyMaxHealth: 50,
            enemyAttack: 8,
            enemyDefense: 3,
        });

        const updated = repository.updateState(battle.id, {
            playerHealth: 90,
            enemyHealth: 40,
            status: 'active',
        });

        expect(updated?.completedAt).toBeNull();
    });

    it('returns null when updating a nonexistent battle', () => {
        expect(
            repository.updateState(999, {
                playerHealth: 90,
                enemyHealth: 40,
                status: 'active',
            }),
        ).toBeNull();
    });

    it('persists a round and updated battle state atomically', () => {
        const battle = repository.createBattle({
            runId: 1,
            heroId: 1,
            playerHealth: 100,
            playerMaxHealth: 100,
            enemyName: 'Goblin',
            enemyHealth: 50,
            enemyMaxHealth: 50,
            enemyAttack: 8,
            enemyDefense: 3,
        });

        const round = repository.persistRound(
            {
                battleId: battle.id,
                roundNumber: 1,
                playerRoll: 8,
                enemyRoll: 5,
                playerDamage: 3,
                enemyDamage: 0,
                playerHealthAfter: 100,
                enemyHealthAfter: 47,
                outcome: 'active',
            },
            {
                playerHealth: 100,
                enemyHealth: 47,
                status: 'active',
            },
        );

        expect(round).toMatchObject({
            battleId: battle.id,
            roundNumber: 1,
            playerHealthAfter: 100,
            enemyHealthAfter: 47,
            outcome: 'active',
        });

        expect(repository.findRounds(battle.id))
            .toHaveLength(1);

        expect(repository.findById(battle.id))
            .toMatchObject({
                playerHealth: 100,
                enemyHealth: 47,
                status: 'active',
            });
    });

    it('rolls back the round when updating the battle state fails', () => {
        const battle = repository.createBattle({
            runId: 1,
            heroId: 1,
            playerHealth: 100,
            playerMaxHealth: 100,
            enemyName: 'Goblin',
            enemyHealth: 50,
            enemyMaxHealth: 50,
            enemyAttack: 8,
            enemyDefense: 3,
        });

        expect(() =>
            repository.persistRound(
                {
                    battleId: battle.id,
                    roundNumber: 1,
                    playerRoll: 8,
                    enemyRoll: 5,
                    playerDamage: 3,
                    enemyDamage: 0,
                    playerHealthAfter: 100,
                    enemyHealthAfter: 47,
                    outcome: 'active',
                },
                {
                    playerHealth: 100,
                    enemyHealth: 47,
                    status: 'invalid' as never,
                },
            ),
        ).toThrow();

        expect(repository.findRounds(battle.id))
            .toHaveLength(0);

        expect(repository.findById(battle.id))
            .toMatchObject({
                playerHealth: 100,
                enemyHealth: 50,
                status: 'active',
            });
    });

    it('finds the active battle for a game run', () => {
        const battle = repository.createBattle({
            runId: 1,
            heroId: 1,
            playerHealth: 100,
            playerMaxHealth: 100,
            enemyName: 'Goblin',
            enemyHealth: 50,
            enemyMaxHealth: 50,
            enemyAttack: 8,
            enemyDefense: 3,
        });

        expect(
            repository.findActiveByRunId(battle.runId),
        ).toEqual(battle);
    });

    it('returns null when a game run has no active battle', () => {
        expect(
            repository.findActiveByRunId(1),
        ).toBeNull();
    });

    it('returns null when the game run only has completed battles', () => {
        const battle = repository.createBattle({
            runId: 1,
            heroId: 1,
            playerHealth: 100,
            playerMaxHealth: 100,
            enemyName: 'Goblin',
            enemyHealth: 50,
            enemyMaxHealth: 50,
            enemyAttack: 8,
            enemyDefense: 3,
        });

        const completedBattle = repository.updateState(
            battle.id,
            {
                playerHealth: 100,
                enemyHealth: 0,
                status: 'won',
            },
        );

        expect(completedBattle?.status).toBe('won');

        expect(
            repository.findActiveByRunId(battle.runId),
        ).toBeNull();
    });

    it('persists an abandoned battle and excludes it from active battles', () => {
        const battle = repository.createBattle({
            runId: 1,
            heroId: 1,
            playerHealth: 90,
            playerMaxHealth: 100,
            enemyName: 'Goblin',
            enemyHealth: 40,
            enemyMaxHealth: 50,
            enemyAttack: 8,
            enemyDefense: 3,
        });

        const abandonedBattle = repository.updateState(
            battle.id,
            {
                playerHealth: battle.playerHealth,
                enemyHealth: battle.enemyHealth,
                status: 'abandoned',
            },
        );

        expect(abandonedBattle).toMatchObject({
            id: battle.id,
            runId: battle.runId,
            status: 'abandoned',
        });

        expect(abandonedBattle?.completedAt).toBeTruthy();

        expect(
            repository.findActiveByRunId(battle.runId),
        ).toBeNull();
    });

    it('abandons the active battle for a game run', () => {
        const battle = repository.createBattle({
            runId: 1,
            heroId: 1,
            playerHealth: 100,
            playerMaxHealth: 100,
            enemyName: 'Goblin',
            enemyHealth: 50,
            enemyMaxHealth: 50,
            enemyAttack: 8,
            enemyDefense: 3,
        });

        const abandonedBattle =
            repository.abandonActiveByRunId(battle.runId);

        expect(abandonedBattle).toMatchObject({
            id: battle.id,
            runId: battle.runId,
            playerHealth: 100,
            enemyHealth: 50,
            status: 'abandoned',
        });

        expect(abandonedBattle?.completedAt).toBeTruthy();

        expect(
            repository.findActiveByRunId(battle.runId),
        ).toBeNull();
    });

    it('returns null when a game run has no active battle to abandon', () => {
        const battle = repository.createBattle({
            runId: 1,
            heroId: 1,
            playerHealth: 100,
            playerMaxHealth: 100,
            enemyName: 'Goblin',
            enemyHealth: 50,
            enemyMaxHealth: 50,
            enemyAttack: 8,
            enemyDefense: 3,
        });

        const completedBattle = repository.updateState(
            battle.id,
            {
                playerHealth: 100,
                enemyHealth: 0,
                status: 'won',
            },
        );

        expect(completedBattle?.status).toBe('won');

        const result =
            repository.abandonActiveByRunId(battle.runId);

        expect(result).toBeNull();

        expect(
            repository.findById(battle.id),
        ).toMatchObject({
            id: battle.id,
            status: 'won',
            playerHealth: 100,
            enemyHealth: 0,
        });
    });
});