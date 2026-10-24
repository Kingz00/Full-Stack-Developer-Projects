import Database from 'better-sqlite3';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { runMigrations } from './migrate.js';

describe('runMigrations', () => {
    let db: Database.Database;

    beforeEach(() => {
        db = new Database(':memory:');
        db.pragma('foreign_keys = ON');
    });

    afterEach(() => {
        if (db.open) {
            db.close();
        }
    });

    it('creates the migration tracking table', () => {
        runMigrations(db);

        const table = db.prepare(`
            SELECT name
            FROM sqlite_master
            WHERE type = 'table' AND name = 'migrations'
        `).get();

        expect(table).toBeDefined();
    });

    it('records every applied migration', () => {
        runMigrations(db);

        const recorded = db.prepare(`
            SELECT name FROM migrations ORDER BY name
        `).all() as { name: string }[];

        expect(recorded.length).toBeGreaterThan(0);
        expect(new Set(recorded.map(({ name }) => name)).size)
            .toBe(recorded.length);
    });

    it('does not apply migrations a second time', () => {
        runMigrations(db);

        const before = db.prepare(`
            SELECT name, executed_at
            FROM migrations ORDER BY name
        `).all();

        expect(() => runMigrations(db)).not.toThrow();

        const after = db.prepare(`
            SELECT name, executed_at
            FROM migrations ORDER BY name
        `).all();

        expect(after).toEqual(before);
    });


    it('preserves existing users when adding the email column', () => {
        db.exec(`
            CREATE TABLE users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL UNIQUE,
                password_hash TEXT NOT NULL,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );

            INSERT INTO users (username, password_hash)
            VALUES ('legacyuser', 'existing-hash');

            CREATE TABLE battles (
                id INTEGER PRIMARY KEY,
                enemy_image_url TEXT NOT NULL
            );

            CREATE TABLE migrations (
                id INTEGER PRIMARY KEY,
                name TEXT NOT NULL UNIQUE,
                executed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );

            INSERT INTO migrations (name) VALUES
                ('001_create_users.sql'),
                ('002_create_heroes.sql'),
                ('003_create_game_runs.sql'),
                ('004_create_battles.sql'),
                ('005_create_battle_rounds.sql');
        `);

        runMigrations(db);

        const user = db.prepare(`
            SELECT id, username, email, password_hash
            FROM users
            WHERE username = ?
        `).get('legacyuser') as {
            id: number;
            username: string;
            email: string | null;
            password_hash: string;
        };

        expect(user).toMatchObject({
            id: 1,
            username: 'legacyuser',
            email: null,
            password_hash: 'existing-hash',
        });

        const emailIndex = db.prepare(`
            SELECT name
            FROM sqlite_master
            WHERE type = 'index'
            AND name = 'idx_users_email_unique'
        `).get();

        expect(emailIndex).toBeDefined();
    });


    it('updates existing battle image URLs without changing other battle data', () => {
        runMigrations(db);

        db.prepare(`
            INSERT INTO users (username, password_hash)
            VALUES (?, ?)
        `).run('migration-test-user', 'test-hash');

        db.prepare(`
            INSERT INTO heroes (
                id, name, description, image_url,
                health, attack, defense
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(
            1,
            'Test Hero',
            'A hero used for migration testing.',
            '/heroes/01-test-hero.webp',
            100,
            20,
            5,
        );

        db.prepare(`
            INSERT INTO game_runs (
                id, user_id, run_number, selected_hero_id, status,
                started_at
            )
            VALUES (?, ?, ?, ?, ?, ?)
        `).run(1, 1, 1, 1, 'active', '2026-10-20 10:00:00');

        db.prepare(`
            INSERT INTO battles (
                id, run_id, battle_number, hero_id,
                player_health, player_max_health,
                enemy_name, enemy_image_url,
                enemy_health, enemy_max_health,
                enemy_attack, enemy_defense,
                status, started_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
            1,
            1,
            1,
            1,
            85,
            100,
            'Test Enemy',
            '/heroes/02-test-enemy.png',
            60,
            80,
            15,
            4,
            'active',
            '2026-10-20 10:05:00',
        );

        const before = db.prepare(`
            SELECT
                id,
                enemy_image_url,
                player_health,
                enemy_health,
                status,
                started_at
            FROM battles
            WHERE id = ?
        `).get(1) as {
            id: number;
            enemy_image_url: string;
            player_health: number;
            enemy_health: number;
            status: string;
            started_at: string;
        };

        // Allow the image-reference migration to run again against
        // the existing battle record.
        db.prepare(`
            DELETE FROM migrations
            WHERE name = ?
        `).run('008_align_hero_image_extensions.sql');

        runMigrations(db);

        const after = db.prepare(`
            SELECT
                id,
                enemy_image_url,
                player_health,
                enemy_health,
                status,
                started_at
            FROM battles
            WHERE id = ?
        `).get(1) as {
            id: number;
            enemy_image_url: string;
            player_health: number;
            enemy_health: number;
            status: string;
            started_at: string;
        };

        expect(after).toEqual({
            ...before,
            enemy_image_url: '/heroes/02-test-enemy.webp',
        });
    });


});
