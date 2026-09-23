import Database from 'better-sqlite3';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { createDatabase } from '../db/database.js';
import { PlayerStatsRepository } from './playerStatsRepository.js';

describe('PlayerStatsRepository', () => {
    let db: Database.Database;
    let repository: PlayerStatsRepository;

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
        `);

        db.prepare(`
            INSERT INTO users (
                username,
                password_hash
            )
            VALUES (?, ?)
        `).run(
            'testuser',
            'hashed-password',
        );

        db.prepare(`
            INSERT INTO users (
                username,
                password_hash
            )
            VALUES (?, ?)
        `).run(
            'otheruser',
            'hashed-password',
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
            'Test Hero',
            'A hero used for testing.',
            '/images/test-hero.png',
            100,
            10,
            5,
        );

        repository = new PlayerStatsRepository(db);
    });

    afterEach(() => {
        db.close();
    });

    function createRun(
        userId: number,
        status: 'active' | 'completed' | 'abandoned' = 'active'
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
        status: 'active' | 'won' | 'lost' | 'draw' | 'abandoned',
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
            status,
        );

        return Number(result.lastInsertRowid);
    }

    it('returns zero statistics and null bestRun when the user has no battles', () => {
        const statistics = repository.getPlayerStatistics(1);

        expect(statistics).toEqual({
            totalBattles: 0,
            wins: 0,
            losses: 0,
            draws: 0,
            bestRun: null,
        });
    });

    it('counts wins, losses, and draws', () => {
        const runId = createRun(1, 'completed');

        createBattle(runId, 'won');
        createBattle(runId, 'won');
        createBattle(runId, 'lost');
        createBattle(runId, 'draw');

        const statistics = repository.getPlayerStatistics(1);

        expect(statistics.totalBattles).toBe(4);
        expect(statistics.wins).toBe(2);
        expect(statistics.losses).toBe(1);
        expect(statistics.draws).toBe(1);
    });

    it('includes draws in totalBattles', () => {
        const runId = createRun(1, 'completed');

        createBattle(runId, 'draw');
        createBattle(runId, 'draw');
        createBattle(runId, 'draw');

        const statistics = repository.getPlayerStatistics(1);

        expect(statistics.totalBattles).toBe(3);
        expect(statistics.wins).toBe(0);
        expect(statistics.losses).toBe(0);
        expect(statistics.draws).toBe(3);
    });

    it('excludes active battles from statistics', () => {
        const runId = createRun(1, 'completed');

        createBattle(runId, 'won');
        createBattle(runId, 'lost');
        createBattle(runId, 'draw');
        createBattle(runId, 'active');

        const statistics = repository.getPlayerStatistics(1);

        expect(statistics.totalBattles).toBe(3);
        expect(statistics.wins).toBe(1);
        expect(statistics.losses).toBe(1);
        expect(statistics.draws).toBe(1);
    });

    it('excludes abandoned battles from statistics', () => {
        const runId = createRun(1, 'completed');

        createBattle(runId, 'won');
        createBattle(runId, 'draw');
        createBattle(runId, 'abandoned');

        const statistics = repository.getPlayerStatistics(1);

        expect(statistics.totalBattles).toBe(2);
        expect(statistics.wins).toBe(1);
        expect(statistics.losses).toBe(0);
        expect(statistics.draws).toBe(1);
    });

    it('returns a completed run as bestRun', () => {
        const runId = createRun(1, 'completed');

        createBattle(runId, 'won');
        createBattle(runId, 'won');
        createBattle(runId, 'lost');
        createBattle(runId, 'draw');

        const statistics = repository.getPlayerStatistics(1);

        expect(statistics.bestRun).toEqual({
            runId,
            totalBattles: 4,
            wins: 2,
            losses: 1,
            draws: 1,
        });
    });

    it('selects the run with the highest number of wins', () => {
        const runOne = createRun(1, 'completed');
        const runTwo = createRun(1, 'completed');

        createBattle(runOne, 'won');
        createBattle(runOne, 'won');
        createBattle(runOne, 'lost');

        createBattle(runTwo, 'won');
        createBattle(runTwo, 'won');
        createBattle(runTwo, 'won');
        createBattle(runTwo, 'lost');

        const statistics = repository.getPlayerStatistics(1);

        expect(statistics.bestRun?.runId)
            .toBe(runTwo);

        expect(statistics.bestRun?.wins)
            .toBe(3);
    });

    it('uses fewer losses as the first bestRun tie-breaker', () => {
        const runOne = createRun(1, 'completed');
        const runTwo = createRun(1, 'completed');

        for (let i = 0; i < 4; i++) {
            createBattle(runOne, 'won');
        }

        for (let i = 0; i < 3; i++) {
            createBattle(runOne, 'lost');
        }

        for (let i = 0; i < 4; i++) {
            createBattle(runTwo, 'won');
        }

        createBattle(runTwo, 'lost');

        const statistics = repository.getPlayerStatistics(1);

        expect(statistics.bestRun?.runId)
            .toBe(runTwo);
    });

    it('uses more completed battles as the second bestRun tie-breaker', () => {
        const runOne = createRun(1, 'completed');
        const runTwo = createRun(1, 'completed');

        for (let i = 0; i < 4; i++) {
            createBattle(runOne, 'won');
        }

        createBattle(runOne, 'lost');

        for (let i = 0; i < 4; i++) {
            createBattle(runTwo, 'won');
        }

        createBattle(runTwo, 'lost');

        createBattle(runTwo, 'draw');
        createBattle(runTwo, 'draw');

        const statistics = repository.getPlayerStatistics(1);

        expect(statistics.bestRun?.runId)
            .toBe(runTwo);

        expect(statistics.bestRun?.totalBattles)
            .toBe(7);

        expect(statistics.bestRun?.draws)
            .toBe(2);
    });

    it('uses the lower run ID when all bestRun criteria are tied', () => {
        const runOne = createRun(1, 'completed');
        const runTwo = createRun(1, 'completed');

        for (let i = 0; i < 4; i++) {
            createBattle(runOne, 'won');
            createBattle(runTwo, 'won');
        }

        createBattle(runOne, 'lost');
        createBattle(runTwo, 'lost');

        createBattle(runOne, 'draw');
        createBattle(runTwo, 'draw');

        const statistics = repository.getPlayerStatistics(1);

        expect(statistics.bestRun?.runId)
            .toBe(Math.min(runOne, runTwo));
    });

    it('does not select an active run as bestRun', () => {
        const activeRun = createRun(1, 'active');
        const completedRun = createRun(1, 'completed');

        for (let i = 0; i < 10; i++) {
            createBattle(activeRun, 'won');
        }

        createBattle(completedRun, 'won');
        createBattle(completedRun, 'won');

        const statistics = repository.getPlayerStatistics(1);

        expect(statistics.bestRun?.runId)
            .toBe(completedRun);
    });

    it('does not select an abandoned run as bestRun', () => {
        const abandonedRun = createRun(1, 'abandoned');
        const completedRun = createRun(1, 'completed');

        for (let i = 0; i < 10; i++) {
            createBattle(abandonedRun, 'won');
        }

        createBattle(completedRun, 'won');
        createBattle(completedRun, 'won');

        const statistics = repository.getPlayerStatistics(1);

        expect(statistics.bestRun?.runId)
            .toBe(completedRun);
    });

    it('does not include another user\'s battles', () => {
        const userOneRun = createRun(1, 'completed');
        const userTwoRun = createRun(2, 'completed');

        createBattle(userOneRun, 'won');
        createBattle(userOneRun, 'lost');

        for (let i = 0; i < 10; i++) {
            createBattle(userTwoRun, 'won');
        }

        const statistics = repository.getPlayerStatistics(1);

        expect(statistics.totalBattles).toBe(2);
        expect(statistics.wins).toBe(1);
        expect(statistics.losses).toBe(1);
        expect(statistics.draws).toBe(0);

        expect(statistics.bestRun?.runId)
            .toBe(userOneRun);
    });

    it('does not return a bestRun when the user has no eligible completed run', () => {
        const activeRun = createRun(1, 'active');
        const abandonedRun = createRun(1, 'abandoned');

        createBattle(activeRun, 'won');
        createBattle(abandonedRun, 'won');

        const statistics = repository.getPlayerStatistics(1);

        expect(statistics.bestRun).toBeNull();
    });
});