import Database from 'better-sqlite3';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { runMigrations } from './migrate.js';
import { seedHeroes } from './seedHeroes.js';
import { heroSeedData } from './heroSeedData.js';

describe('seedHeroes', () => {
    let db: Database.Database;

    beforeEach(() => {
        db = new Database(':memory:');
        db.pragma('foreign_keys = ON');

        runMigrations(db);
    });

    afterEach(() => {
        if (db.open) {
            db.close();
        }
    });

    it('inserts the configured hero seed data', () => {
        seedHeroes(db);

        const rows = db.prepare(`
            SELECT id, name FROM heroes ORDER BY id
        `).all() as { id: number; name: string }[];

        expect(rows).toHaveLength(heroSeedData.length);
        expect(rows[0].name).toBe(heroSeedData[0].name);
    });

    it('does not create duplicate heroes when run repeatedly', () => {
        seedHeroes(db);
        seedHeroes(db);

        const count = db.prepare(`
            SELECT COUNT(*) AS count FROM heroes
        `).get() as { count: number };

        expect(count.count).toBe(heroSeedData.length);
    });

    it('updates existing hero data when the seed is rerun', () => {
        seedHeroes(db);

        const hero = heroSeedData[0];
        const updatedName = 'Updated Test Hero';

        db.prepare(`
            UPDATE heroes SET name = ? WHERE id = ?
        `).run('Old Hero Name', hero.id);

        seedHeroes(db);

        const row = db.prepare(`
            SELECT name FROM heroes WHERE id = ?
        `).get(hero.id) as { name: string };

        expect(row.name).toBe(hero.name);
        expect(row.name).not.toBe(updatedName);
    });
});
