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

});
