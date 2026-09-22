import Database from 'better-sqlite3';
import { createDatabase } from '../db/database.js';

import { describe, expect, it, vi, afterEach, beforeEach } from 'vitest';
import { BattleRepository } from '../repositories/battleRepository.js';
import { GameRunRepository } from '../repositories/gameRunRepository.js';
import { HeroRepository } from '../repositories/heroRepository.js';

import type { GameRun } from '../domain/gameRun/types.js';
import type { Hero } from '../domain/hero/types.js';

import { GameRunService } from './gameRunService.js';

describe('GameRunService', () => {
    let db: Database.Database;

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
                CHECK (
                    outcome IN ('active', 'win', 'loss', 'draw')
                ),

            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

            FOREIGN KEY (battle_id)
                REFERENCES battles(id)
                ON DELETE CASCADE,

            UNIQUE (battle_id, round_number)
        );

        CREATE INDEX idx_battle_rounds_battle_id
            ON battle_rounds(battle_id);
    `);
    });

    afterEach(() => {
        db.close();
    });

    const selectedHero: Hero = {
        id: 1,
        name: 'Warrior',
        description: 'A strong warrior.',
        imageUrl: 'warrior.png',
        health: 100,
        attack: 15,
        defense: 8,
    };

    const createdGameRun: GameRun = {
        id: 1,
        userId: 10,
        selectedHeroId: 1,
        status: 'active',
        startedAt: '2026-09-19T10:00:00.000Z',
        completedAt: null,
    };

    function createService() {
        const gameRunRepository = {
            create: vi.fn(),
            findByIdForUser: vi.fn(),
            findActiveByUserId: vi.fn(),
            updateStatus: vi.fn(),
        } as unknown as GameRunRepository;

        const heroRepository = {
            findById: vi.fn(),
        } as unknown as HeroRepository;

        const battleRepository = {
            abandonActiveByRunId: vi.fn(),
        } as unknown as BattleRepository;

        const service = new GameRunService(
            gameRunRepository,
            heroRepository,
            battleRepository,
            db
        );

        return {
            service,
            gameRunRepository,
            heroRepository,
            battleRepository
        };
    }

    function createPersistenceService() {
        const gameRunRepository = new GameRunRepository(db);
        const heroRepository = new HeroRepository(db);
        const battleRepository = new BattleRepository(db);

        const service = new GameRunService(
            gameRunRepository,
            heroRepository,
            battleRepository,
            db,
        );

        return {
            service,
            gameRunRepository,
            battleRepository,
        };
    }

    describe('createRun', () => {
        it('creates a game run for a valid selected hero', () => {
            const {
                service,
                gameRunRepository,
                heroRepository,
            } = createService();

            vi.mocked(heroRepository.findById)
                .mockReturnValue(selectedHero);

            vi.mocked(gameRunRepository.findActiveByUserId)
                .mockReturnValue(null);

            vi.mocked(gameRunRepository.create)
                .mockReturnValue(createdGameRun);

            const gameRun = service.createRun(10, {
                selectedHeroId: 1
            });

            expect(gameRun).toEqual(createdGameRun);

            expect(heroRepository.findById)
                .toHaveBeenCalledWith(1);

            expect(gameRunRepository.create)
                .toHaveBeenCalledWith({
                    userId: 10,
                    selectedHeroId: 1
                });
        });

        it('throws when the selected hero does not exist', () => {
            const {
                service,
                gameRunRepository,
                heroRepository
            } = createService();

            vi.mocked(heroRepository.findById)
                .mockReturnValue(null);

            expect(() =>
                service.createRun(10, {
                    selectedHeroId: 999,
                }),
            ).toThrow('Selected hero not found.');

            expect(gameRunRepository.create)
                .not.toHaveBeenCalled();
        });

        it('throws when the user already has an active game run', () => {
            const {
                service,
                gameRunRepository,
                heroRepository,
            } = createService();

            vi.mocked(heroRepository.findById)
                .mockReturnValue(selectedHero);

            vi.mocked(gameRunRepository.findActiveByUserId)
                .mockReturnValue(createdGameRun);

            expect(() =>
                service.createRun(10, {
                    selectedHeroId: 1,
                }),
            ).toThrow('An active game run already exists.');

            expect(gameRunRepository.create)
                .not.toHaveBeenCalled();
        });
    });

    describe('abandonRun', () => {
        it('abandons an active game run belonging to the user', () => {
            const {
                service,
                gameRunRepository,
                battleRepository
            } = createService();

            const abandonedGameRun: GameRun = {
                ...createdGameRun,
                status: 'abandoned',
                completedAt: '2026-09-20 05:00:00',
            };

            vi.mocked(gameRunRepository.findByIdForUser)
                .mockReturnValue(createdGameRun);

            vi.mocked(gameRunRepository.updateStatus)
                .mockReturnValue(abandonedGameRun);

            const gameRun = service.abandonRun(10, 1);

            expect(battleRepository.abandonActiveByRunId)
                .toHaveBeenCalledWith(1);

            expect(gameRun).toEqual(abandonedGameRun);

            expect(gameRunRepository.findByIdForUser)
                .toHaveBeenCalledWith(1, 10);

            expect(gameRunRepository.updateStatus)
                .toHaveBeenCalledWith(1, 'abandoned');
        });

        it('abandons the game run even when there is no active battle', () => {
            const {
                service,
                gameRunRepository,
                battleRepository,
            } = createService();

            const abandonedGameRun: GameRun = {
                ...createdGameRun,
                status: 'abandoned',
                completedAt: '2026-09-20 05:00:00',
            };

            vi.mocked(gameRunRepository.findByIdForUser)
                .mockReturnValue(createdGameRun);

            vi.mocked(battleRepository.abandonActiveByRunId)
                .mockReturnValue(null);

            vi.mocked(gameRunRepository.updateStatus)
                .mockReturnValue(abandonedGameRun);

            const gameRun = service.abandonRun(10, 1);

            expect(gameRun).toEqual(abandonedGameRun);

            expect(battleRepository.abandonActiveByRunId)
                .toHaveBeenCalledWith(1);

            expect(gameRunRepository.updateStatus)
                .toHaveBeenCalledWith(1, 'abandoned');
        });

        it('throws when the game run does not exist or belong to the user', () => {
            const {
                service,
                gameRunRepository,
                battleRepository
            } = createService();

            vi.mocked(gameRunRepository.findByIdForUser)
                .mockReturnValue(null);

            expect(() =>
                service.abandonRun(10, 999),
            ).toThrow('Game run not found.');

            expect(battleRepository.abandonActiveByRunId)
                .not.toHaveBeenCalled();

            expect(gameRunRepository.updateStatus)
                .not.toHaveBeenCalled();
        });

        it('throws when the game run is already completed', () => {
            const {
                service,
                gameRunRepository,
                battleRepository
            } = createService();

            vi.mocked(gameRunRepository.findByIdForUser)
                .mockReturnValue({
                    ...createdGameRun,
                    status: 'completed',
                    completedAt: '2026-09-20 05:00:00',
                });

            expect(() =>
                service.abandonRun(10, 1),
            ).toThrow('Game run is not active.');

            expect(battleRepository.abandonActiveByRunId)
                .not.toHaveBeenCalled();

            expect(gameRunRepository.updateStatus)
                .not.toHaveBeenCalled();
        });

        it('throws when the game run is already abandoned', () => {
            const {
                service,
                gameRunRepository,
                battleRepository
            } = createService();

            vi.mocked(gameRunRepository.findByIdForUser)
                .mockReturnValue({
                    ...createdGameRun,
                    status: 'abandoned',
                    completedAt: '2026-09-20 05:00:00',
                });

            expect(() =>
                service.abandonRun(10, 1),
            ).toThrow('Game run is not active.');

            expect(battleRepository.abandonActiveByRunId)
                .not.toHaveBeenCalled();

            expect(gameRunRepository.updateStatus)
                .not.toHaveBeenCalled();
        });

        it('persists abandonment of both the active battle and game run', () => {
            const {
                service,
                battleRepository,
            } = createPersistenceService();

            db.prepare(`
            INSERT INTO users (
                username,
                password_hash
            )
            VALUES (?, ?)
            `).run('testuser', 'hash');

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
                'Warrior',
                'A strong warrior.',
                'warrior.png',
                100,
                15,
                8,
            );

            const gameRunRepository =
                new GameRunRepository(db);

            const gameRun = gameRunRepository.create({
                userId: 1,
                selectedHeroId: 1,
            });

            const battle = battleRepository.createBattle({
                runId: gameRun.id,
                heroId: 1,
                playerHealth: 100,
                playerMaxHealth: 100,
                enemyName: 'Goblin',
                enemyHealth: 50,
                enemyMaxHealth: 50,
                enemyAttack: 8,
                enemyDefense: 3,
            });

            const result = service.abandonRun(
                1,
                gameRun.id,
            );

            expect(result.status).toBe('abandoned');
            expect(result.completedAt).toBeTruthy();

            const persistedRun = gameRunRepository.findById(
                gameRun.id,
            );

            expect(persistedRun?.status)
                .toBe('abandoned');

            expect(persistedRun?.completedAt)
                .toBeTruthy();

            const persistedBattle = db
                .prepare(`
                    SELECT
                        status,
                        player_health,
                        enemy_health,
                        completed_at
                    FROM battles
                    WHERE id = ?
                `)
                .get(battle.id) as {
                    status: string;
                    player_health: number;
                    enemy_health: number;
                    completed_at: string | null;
                };

            expect(persistedBattle).toMatchObject({
                status: 'abandoned',
                player_health: 100,
                enemy_health: 50,
            });

            expect(persistedBattle.completed_at)
                .toBeTruthy();

            expect(
                battleRepository.findActiveByRunId(
                    gameRun.id,
                ),
            ).toBeNull();
        });

        it('rolls back battle abandonment when game run abandonment fails', () => {
            const {
                service,
                gameRunRepository,
                battleRepository,
            } = createPersistenceService();

            db.prepare(`
            INSERT INTO users (
                username,
                password_hash
            )
            VALUES (?, ?)
            `).run('testuser', 'hash');

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
                'Warrior',
                'A strong warrior.',
                'warrior.png',
                100,
                15,
                8,
            );

            const gameRun = gameRunRepository.create({
                userId: 1,
                selectedHeroId: 1,
            });

            const battle = battleRepository.createBattle({
                runId: gameRun.id,
                heroId: 1,
                playerHealth: 100,
                playerMaxHealth: 100,
                enemyName: 'Goblin',
                enemyHealth: 50,
                enemyMaxHealth: 50,
                enemyAttack: 8,
                enemyDefense: 3,
            });

            vi.spyOn(
                gameRunRepository,
                'updateStatus',
            ).mockImplementation(() => {
                throw new Error('Simulated persistence failure');
            });

            expect(() =>
                service.abandonRun(1, gameRun.id),
            ).toThrow('Simulated persistence failure');

            const persistedRun = db
                .prepare(`
                    SELECT
                        status,
                        completed_at
                    FROM game_runs
                    WHERE id = ?
                `)
                .get(gameRun.id) as {
                    status: string;
                    completed_at: string | null;
                };

            expect(persistedRun).toEqual({
                status: 'active',
                completed_at: null,
            });

            const persistedBattle = db
                .prepare(`
                    SELECT
                        status,
                        completed_at,
                        player_health,
                        enemy_health
                    FROM battles
                    WHERE id = ?
                `)
                .get(battle.id) as {
                    status: string;
                    completed_at: string | null;
                    player_health: number;
                    enemy_health: number;
                };

            expect(persistedBattle).toEqual({
                status: 'active',
                completed_at: null,
                player_health: 100,
                enemy_health: 50,
            });
        });
    });

    describe('completeRun', () => {
        it('completes an active game run and abandons its active battle', () => {
            const {
                service,
                gameRunRepository,
                battleRepository,
            } = createService();

            const completedGameRun: GameRun = {
                ...createdGameRun,
                status: 'completed',
                completedAt: '2026-09-20 05:00:00',
            };

            vi.mocked(gameRunRepository.findByIdForUser)
                .mockReturnValue(createdGameRun);

            vi.mocked(battleRepository.abandonActiveByRunId)
                .mockReturnValue(null);

            vi.mocked(gameRunRepository.updateStatus)
                .mockReturnValue(completedGameRun);

            const gameRun = service.completeRun(10, 1);

            expect(gameRun).toEqual(completedGameRun);

            expect(gameRunRepository.findByIdForUser)
                .toHaveBeenCalledWith(1, 10);

            expect(battleRepository.abandonActiveByRunId)
                .toHaveBeenCalledWith(1);

            expect(gameRunRepository.updateStatus)
                .toHaveBeenCalledWith(1, 'completed');
        });

        it('completes the game run when there is no active battle', () => {
            const {
                service,
                gameRunRepository,
                battleRepository,
            } = createService();

            const completedGameRun: GameRun = {
                ...createdGameRun,
                status: 'completed',
                completedAt: '2026-09-20 05:00:00',
            };

            vi.mocked(gameRunRepository.findByIdForUser)
                .mockReturnValue(createdGameRun);

            vi.mocked(battleRepository.abandonActiveByRunId)
                .mockReturnValue(null);

            vi.mocked(gameRunRepository.updateStatus)
                .mockReturnValue(completedGameRun);

            const gameRun = service.completeRun(10, 1);

            expect(gameRun).toEqual(completedGameRun);

            expect(battleRepository.abandonActiveByRunId)
                .toHaveBeenCalledWith(1);

            expect(gameRunRepository.updateStatus)
                .toHaveBeenCalledWith(1, 'completed');
        });

        it('throws when the game run does not exist or belong to the user', () => {
            const {
                service,
                gameRunRepository,
            } = createService();

            vi.mocked(gameRunRepository.findByIdForUser)
                .mockReturnValue(null);

            expect(() =>
                service.completeRun(10, 999),
            ).toThrow('Game run not found.');

            expect(gameRunRepository.updateStatus)
                .not.toHaveBeenCalled();
        });

        it('throws when the game run is already completed', () => {
            const {
                service,
                gameRunRepository,
            } = createService();

            vi.mocked(gameRunRepository.findByIdForUser)
                .mockReturnValue({
                    ...createdGameRun,
                    status: 'completed',
                    completedAt: '2026-09-20 05:00:00',
                });

            expect(() =>
                service.completeRun(10, 1),
            ).toThrow('Game run is not active.');

            expect(gameRunRepository.updateStatus)
                .not.toHaveBeenCalled();
        });

        it('throws when the game run is already abandoned', () => {
            const {
                service,
                gameRunRepository,
            } = createService();

            vi.mocked(gameRunRepository.findByIdForUser)
                .mockReturnValue({
                    ...createdGameRun,
                    status: 'abandoned',
                    completedAt: '2026-09-20 05:00:00',
                });

            expect(() =>
                service.completeRun(10, 1),
            ).toThrow('Game run is not active.');

            expect(gameRunRepository.updateStatus)
                .not.toHaveBeenCalled();
        });

        it('persists completion of both the active battle and game run', () => {
            const {
                service,
                gameRunRepository,
                battleRepository,
            } = createPersistenceService();

            db.prepare(`
            INSERT INTO users (
                username,
                password_hash
            )
            VALUES (?, ?)
            `).run('testuser', 'hash');

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
                    'Warrior',
                    'A strong warrior.',
                    'warrior.png',
                    100,
                    15,
                    8,
                );

            const gameRun = gameRunRepository.create({
                userId: 1,
                selectedHeroId: 1,
            });

            const battle = battleRepository.createBattle({
                runId: gameRun.id,
                heroId: 1,
                playerHealth: 100,
                playerMaxHealth: 100,
                enemyName: 'Goblin',
                enemyHealth: 50,
                enemyMaxHealth: 50,
                enemyAttack: 8,
                enemyDefense: 3,
            });

            const result = service.completeRun(
                1,
                gameRun.id,
            );

            expect(result.status).toBe('completed');
            expect(result.completedAt).toBeTruthy();

            const persistedRun = gameRunRepository.findById(
                gameRun.id,
            );

            expect(persistedRun?.status)
                .toBe('completed');

            expect(persistedRun?.completedAt)
                .toBeTruthy();

            const persistedBattle = db
                .prepare(`
                    SELECT
                        status,
                        player_health,
                        enemy_health,
                        completed_at
                    FROM battles
                    WHERE id = ?
                `)
                .get(battle.id) as {
                    status: string;
                    player_health: number;
                    enemy_health: number;
                    completed_at: string | null;
                };

            expect(persistedBattle).toMatchObject({
                status: 'abandoned',
                player_health: 100,
                enemy_health: 50,
            });

            expect(persistedBattle.completed_at)
                .toBeTruthy();

            expect(
                battleRepository.findActiveByRunId(
                    gameRun.id,
                ),
            ).toBeNull();
        });

        it('rolls back battle abandonment when game run completion fails', () => {
            const {
                service,
                gameRunRepository,
                battleRepository,
            } = createPersistenceService();

            db.prepare(`
                INSERT INTO users (
                    username,
                    password_hash
                )
                VALUES (?, ?)
            `).run('testuser', 'hash');

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
                    'Warrior',
                    'A strong warrior.',
                    'warrior.png',
                    100,
                    15,
                    8,
                );

            const gameRun = gameRunRepository.create({
                userId: 1,
                selectedHeroId: 1,
            });

            const battle = battleRepository.createBattle({
                runId: gameRun.id,
                heroId: 1,
                playerHealth: 100,
                playerMaxHealth: 100,
                enemyName: 'Goblin',
                enemyHealth: 50,
                enemyMaxHealth: 50,
                enemyAttack: 8,
                enemyDefense: 3,
            });

            vi.spyOn(
                gameRunRepository,
                'updateStatus',
            ).mockImplementation(() => {
                throw new Error('Simulated persistence failure');
            });

            expect(() =>
                service.completeRun(1, gameRun.id),
            ).toThrow('Simulated persistence failure');

            const persistedRun = db
                .prepare(`
                    SELECT
                        status,
                        completed_at
                    FROM game_runs
                    WHERE id = ?
                `)
                .get(gameRun.id) as {
                    status: string;
                    completed_at: string | null;
                };

            expect(persistedRun).toEqual({
                status: 'active',
                completed_at: null,
            });

            const persistedBattle = db
                .prepare(`
                    SELECT
                        status,
                        completed_at,
                        player_health,
                        enemy_health
                    FROM battles
                    WHERE id = ?
                `)
                .get(battle.id) as {
                    status: string;
                    completed_at: string | null;
                    player_health: number;
                    enemy_health: number;
                };

            expect(persistedBattle).toEqual({
                status: 'active',
                completed_at: null,
                player_health: 100,
                enemy_health: 50,
            });

            expect(
                battleRepository.findActiveByRunId(
                    gameRun.id,
                ),
            ).toMatchObject({
                id: battle.id,
                status: 'active',
            });
        });
    })
});