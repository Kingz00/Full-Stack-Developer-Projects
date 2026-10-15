import Database from 'better-sqlite3';
import request from 'supertest';
import { afterEach, describe, expect, it } from 'vitest';

import { createApp } from './app.js';
import { runMigrations } from './db/migrate.js';
import { seedHeroes } from './db/seedHeroes.js';

describe('GET /api/health', () => {
    let db: Database.Database;

    afterEach(() => {
        if (db?.open) {
            db.close();
        }
    });

    it('returns 200 when the database can be queried', async () => {
        db = new Database(':memory:');
        db.pragma('foreign_keys = ON');

        runMigrations(db);
        seedHeroes(db);

        const response = await request(createApp(db))
            .get('/api/health');

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            status: 'ok',
            database: 'ok',
        });
    });

    it('returns 503 when the database query fails', async () => {
        const db = new Database(':memory:');

        try {
            runMigrations(db);
            seedHeroes(db);

            // Initialize the app while the database is available.
            const app = createApp(db);

            // Simulate a database failure after app initialization.
            db.close();

            const response = await request(app).get('/api/health');

            expect(response.status).toBe(503);
            expect(response.body).toEqual({
                status: 'unavailable',
                database: 'unavailable'
            });
        } finally {
            // Closing an already-closed database is unnecessary.
            if (db.open) {
                db.close();
            }
        }
    });
});
